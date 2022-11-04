import async from "async";
import AWS from "aws-sdk";
import fs from "fs";
import glob from "glob";
import mime from "mime-types";
import minimatch from "minimatch";

type S3UploaderOptions = {
    accessKeyId: string;
    endpoint: string;
    secretAccessKey: string;
};

type UploadOptions = {
    bucket: string;
    clear: boolean;
    exclude: string[];
    include: string[];
};

function nonNullable<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined;
}

export class S3Uploader {
    private readonly s3: AWS.S3;

    constructor(
        { accessKeyId, endpoint, secretAccessKey }: S3UploaderOptions,
        private log: (message: string) => void
    ) {
        this.s3 = new AWS.S3({ endpoint, accessKeyId, secretAccessKey });
    }

    public async upload(options: UploadOptions): Promise<unknown> {
        const { bucket, clear, exclude, include } = options;

        this.log(`Include patterns: ${include.join(", ")}.`);
        this.log(`Exclude patterns: ${exclude.join(", ")}.`);

        if (clear) {
            await this.emptyBucket(bucket);
            this.log("Bucket was cleaned successfully.");
        }

        const files = this.getFiles(options);

        this.log(`Found ${files.length} files to upload.`);

        return new Promise((resolve, reject) => {
            async.eachOfLimit(
                files,
                10,
                async.asyncify(async (file: string) => {
                    const contentType =
                        mime.lookup(file) || "application/octet-stream";

                    this.log(`Uploading: ${file} (${contentType})...`);

                    await this.s3
                        .upload({
                            Key: file,
                            Bucket: bucket,
                            Body: fs.readFileSync(file),
                            ContentType: contentType,
                        })
                        .promise();
                }),
                (err) => {
                    if (err) {
                        return reject(new Error(err.message));
                    }

                    resolve(null);
                }
            );
        });
    }

    private async emptyBucket(bucket: string): Promise<void> {
        const listedObjects = await this.s3
            .listObjects({ Bucket: bucket })
            .promise();

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            return;
        }

        const deleteKeys = listedObjects.Contents.map((c) => ({
            Key: c.Key as string,
        }));

        await this.s3
            .deleteObjects({ Bucket: bucket, Delete: { Objects: deleteKeys } })
            .promise();

        if (listedObjects.IsTruncated) {
            await this.emptyBucket(bucket);
        }
    }

    private getFiles(options: UploadOptions): string[] {
        const { exclude, include } = options;

        return include
            .map((pattern) =>
                glob
                    .sync(pattern, { nodir: true })
                    .map((file) =>
                        exclude.some((excludePattern) =>
                            minimatch(file, excludePattern)
                        )
                            ? null
                            : file
                    )
                    .filter(nonNullable)
            )
            .flat(1);
    }
}
