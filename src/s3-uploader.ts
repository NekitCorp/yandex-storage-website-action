import async from "async";
import fs from "fs";
import mime from "mime-types";
import path from "path";

type UploadOptions = {
    clear: boolean;
    exclude: string[];
    include: string[];
    workingDirectory: string;
};

export class S3Uploader {
    constructor(private s3client: IS3Client, private filesManager: IFilesManager, private log: ILogger) {}

    public async upload(options: UploadOptions): Promise<unknown> {
        const { clear, exclude, include, workingDirectory } = options;

        this.log(`Include patterns: ${include.join(", ")}.`);
        this.log(`Exclude patterns: ${exclude.join(", ")}.`);
        if (workingDirectory) this.log(`Working directory: ${workingDirectory}.`);

        if (clear) {
            const count = await this.s3client.clearBucket();
            this.log(`Successfully deleted ${count} objects from S3 bucket.`);
        }

        const files = this.filesManager.getFiles({ exclude, include, workingDirectory });

        console.log(files);

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

                    await this.s3client.putObjects(key, fs.readFileSync(file), contentType);
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
}
