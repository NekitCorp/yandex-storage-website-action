import async from "async";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import readdir from "recursive-readdir";
import * as core from "@actions/core";

type Inputs = {
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    path: string;
};

const inputs: Inputs = {
    accessKeyId: core.getInput("accessKeyId", { required: true }),
    secretAccessKey: core.getInput("secretAccessKey", { required: true }),
    bucket: core.getInput("bucket", { required: true }),
    path: core.getInput("path", { required: true }),
};

const s3 = new AWS.S3({
    endpoint: "https://storage.yandexcloud.net",
    accessKeyId: inputs.accessKeyId,
    secretAccessKey: inputs.secretAccessKey,
});

// https://www.thetopsites.net/article/52403322.shtml
const emptyS3Bucket = async (bucket: string) => {
    const listedObjects = await s3.listObjects({ Bucket: bucket }).promise();

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        return;
    }

    const deleteKeys = listedObjects.Contents.map(c => ({ Key: c.Key as string }));

    await s3.deleteObjects({ Bucket: bucket, Delete: { Objects: deleteKeys } }).promise();

    if (listedObjects.IsTruncated) {
        await emptyS3Bucket(bucket);
    }
};

// https://gist.github.com/jlouros/9abc14239b0d9d8947a3345b99c4ebcb#gistcomment-2751992
const upload = async (pathToFolder: string, bucket: string) => {
    const dirPath = path.resolve(__dirname, pathToFolder);
    const filesToUpload = fs.existsSync(dirPath) ? await readdir(dirPath) : [];

    console.log("pathToFolder", fs.existsSync(pathToFolder));
    const test = await readdir(pathToFolder);
    console.log("pathToFolder ls", test);
    console.log("__dirname", __dirname);
    console.log("dirPath", dirPath);

    if (filesToUpload.length === 0) {
        throw new Error(`Folder ${dirPath} doesn't exists`);
    }

    return new Promise((resolve, reject) => {
        async.eachOfLimit(
            filesToUpload,
            10,
            async.asyncify(async (file: string) => {
                const Key = file.replace(dirPath, "").replace(/\\/g, "/").substr(1);

                console.log(`Uploading: ${Key}`);

                await s3.upload({ Key, Bucket: bucket, Body: fs.readFileSync(file) }).promise();
            }),
            err => {
                if (err) {
                    return reject(new Error(err.message));
                }

                resolve();
            }
        );
    });
};

emptyS3Bucket(inputs.bucket)
    .then(() => {
        console.log(`Bucket ${inputs.bucket} was cleaned successfully`);

        upload(inputs.path, inputs.bucket)
            .then(() => console.log("OK"))
            .catch(err => console.log("Error", err));
    })
    .catch(err => console.log("Cleaning error", err));
