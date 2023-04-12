import * as core from "@actions/core";
import { AWSS3Client } from "./src/aws-s3-client";
import { FilesManager } from "./src/files-manager";
import { getBoolean, getMultiline, getString } from "./src/inputs";
import { S3Uploader } from "./src/s3-uploader";

const inputs: Inputs = {
    // required
    accessKeyId: getString({ name: "access-key-id", required: true }),
    secretAccessKey: getString({ name: "secret-access-key", required: true }),
    bucket: getString({ name: "bucket", required: true }),
    // optional
    workingDirectory: getString({ name: "working-directory", required: false, defaultValue: "" }),
    include: getMultiline({ name: "include", required: false, defaultValue: ["**/*"] }),
    exclude: getMultiline({ name: "exclude", required: false, defaultValue: [] }),
    clear: getBoolean({ name: "clear", required: false, defaultValue: false }),
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
