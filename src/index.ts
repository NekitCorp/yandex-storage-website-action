import * as core from "@actions/core";
import async from "async";
import AWS from "aws-sdk";
import fs from "fs";
import mime from "mime-types";
import readdir from "recursive-readdir";

type Inputs = {
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    path: string;
    clear: boolean;
};

const getBooleanFromString = (str: string) => (str === "true" ? true : false);

const inputs: Inputs = {
    accessKeyId: core.getInput("accessKeyId", { required: true }),
    secretAccessKey: core.getInput("secretAccessKey", { required: true }),
    bucket: core.getInput("bucket", { required: true }),
    path: core.getInput("path", { required: true }),
    clear: getBooleanFromString(core.getInput("clear", { required: false })),
};

const s3 = new AWS.S3({
    endpoint: "https://storage.yandexcloud.net",
    accessKeyId: inputs.accessKeyId,
    secretAccessKey: inputs.secretAccessKey,
});

const emptyS3Bucket = async (bucket: string) => {
    const listedObjects = await s3.listObjects({ Bucket: bucket }).promise();

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        return;
    }

    const deleteKeys = listedObjects.Contents.map((c) => ({ Key: c.Key as string }));

    await s3.deleteObjects({ Bucket: bucket, Delete: { Objects: deleteKeys } }).promise();

    if (listedObjects.IsTruncated) {
        await emptyS3Bucket(bucket);
    }
};

const upload = async (path: string, bucket: string) => {
    if (!fs.existsSync(path)) {
        throw new Error(`Folder ${path} doesn't exists`);
    }

    const filesToUpload = await readdir(path);

    return new Promise((resolve, reject) => {
        async.eachOfLimit(
            filesToUpload,
            10,
            async.asyncify(async (file: string) => {
                // remove folder name
                const key = file.split("/").slice(1).join("/");

                core.info(`Uploading: ${key} ${mime.lookup(file)}`);

                await s3
                    .upload({
                        Key: key,
                        Bucket: bucket,
                        Body: fs.readFileSync(file),
                        ContentType: mime.lookup(file) as string,
                    })
                    .promise();
            }),
            (err) => {
                if (err) {
                    return reject(new Error(err.message));
                }

                resolve();
            }
        );
    });
};

const run = async () => {
    if (inputs.clear) {
        await emptyS3Bucket(inputs.bucket);
        core.info("Bucket was cleaned successfully");
    }

    await upload(inputs.path, inputs.bucket);
};

run().catch((err) => core.setFailed(err));
