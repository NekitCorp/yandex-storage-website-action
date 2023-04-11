import * as core from "@actions/core";
import { AWSS3Client } from "./src/aws-s3-client";
import { S3Uploader } from "./src/s3-uploader";
import { FilesManager } from "./src/files-manager";

const getBooleanFromString = (str: string): boolean => (str === "true" ? true : false);

const inputs: Inputs = {
    accessKeyId: core.getInput("access-key-id", { required: true }),
    secretAccessKey: core.getInput("secret-access-key", { required: true }),
    bucket: core.getInput("bucket", { required: true }),
    workingDirectory: core.getInput("working-directory", { required: false }),
    include: core.getMultilineInput("include", { required: true }),
    exclude: core.getMultilineInput("exclude", { required: false }) || [],
    clear: getBooleanFromString(core.getInput("clear", { required: false })),
};

const s3Uploader = new S3Uploader(
    new AWSS3Client({
        accessKeyId: inputs.accessKeyId,
        endpoint: "https://storage.yandexcloud.net",
        secretAccessKey: inputs.secretAccessKey,
        bucket: inputs.bucket,
    }),
    new FilesManager(),
    core.info
);

s3Uploader
    .upload({
        clear: inputs.clear,
        workingDirectory: inputs.workingDirectory,
        exclude: inputs.exclude,
        include: inputs.include,
    })
    .catch((err) => core.setFailed(err));
