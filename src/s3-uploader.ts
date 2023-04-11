import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import async from "async";
import fs from "fs";
import { globSync } from "glob";
import mime from "mime-types";
import { minimatch } from "minimatch";
import path from "path";

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
    workingDirectory: string;
};

function nonNullable<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined;
}

export class S3Uploader {
    private readonly client: S3Client;

    constructor({ accessKeyId, endpoint, secretAccessKey }: S3UploaderOptions, private log: (message: string) => void) {
        this.client = new S3Client({ endpoint, region: "ru-central1", credentials: { accessKeyId, secretAccessKey } });
    }

    public async upload(options: UploadOptions): Promise<unknown> {
        const { bucket, clear, exclude, include, workingDirectory } = options;

        this.log(`Include patterns: ${include.join(", ")}.`);
        this.log(`Exclude patterns: ${exclude.join(", ")}.`);
        if (workingDirectory) this.log(`Working directory: ${workingDirectory}.`);

        if (clear) {
            await this.clearBucket(bucket);
            this.log("Bucket was cleaned successfully.");
        }

        const files = this.getFiles(options);

        this.log(`Found ${files.length} files to upload.`);

        return new Promise((resolve, reject) => {
            async.eachOfLimit(
                files,
                10,
                async.asyncify(async (file: string) => {
                    const contentType = mime.lookup(file) || "application/octet-stream";
                    // Remove working-directory
                    const key = path.relative(workingDirectory, file);

                    this.log(`Uploading: ${key} (${contentType})...`);

                    const command = new PutObjectCommand({
                        Bucket: bucket,
                        Key: key,
                        Body: fs.readFileSync(file),
                        ContentType: contentType,
                    });

                    await this.client.send(command);
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

    private async clearBucket(bucket: string): Promise<void> {
        const listCommand = new ListObjectsV2Command({
            Bucket: bucket,
            // The default and maximum number of keys returned is 1000.
            MaxKeys: 1000,
        });

        let isTruncated = true;

        while (isTruncated) {
            const { Contents, IsTruncated, NextContinuationToken } = await this.client.send(listCommand);

            if (!Contents || Contents.length === 0) {
                return;
            }

            isTruncated = Boolean(IsTruncated);
            listCommand.input.ContinuationToken = NextContinuationToken;

            const deleteCommand = new DeleteObjectsCommand({
                Bucket: bucket,
                Delete: {
                    Objects: Contents.map((c) => ({ Key: c.Key })),
                },
            });

            const { Deleted } = await this.client.send(deleteCommand);

            this.log(`Successfully deleted ${Deleted?.length} objects from S3 bucket.`);
        }
    }

    private getFiles(options: UploadOptions): string[] {
        const include = options.include.map((pattern) => path.join(options.workingDirectory, pattern));
        const exclude = options.exclude.map((pattern) => path.join(options.workingDirectory, pattern));

        return include
            .map((pattern) =>
                globSync(pattern, { nodir: true })
                    .map((file) => (exclude.some((excludePattern) => minimatch(file, excludePattern)) ? null : file))
                    .filter(nonNullable)
            )
            .flat(1);
    }
}
