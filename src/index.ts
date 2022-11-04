import * as core from "@actions/core";
import { S3Uploader } from "./s3-uploader";

type Inputs = {
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    include: string[];
    exclude: string[];
    clear: boolean;
};

const getBooleanFromString = (str: string): boolean =>
    str === "true" ? true : false;

const inputs: Inputs = {
    accessKeyId: core.getInput("access-key-id", { required: true }),
    secretAccessKey: core.getInput("secret-access-key", { required: true }),
    bucket: core.getInput("bucket", { required: true }),
    include: core.getMultilineInput("include", { required: true }),
    exclude: core.getMultilineInput("exclude", { required: false }) || [],
    clear: getBooleanFromString(core.getInput("clear", { required: false })),
};

const s3Uploader = new S3Uploader(
    {
        accessKeyId: inputs.accessKeyId,
        endpoint: "https://storage.yandexcloud.net",
        secretAccessKey: inputs.secretAccessKey,
    },
    core.info
);

s3Uploader
    .upload({
        bucket: inputs.bucket,
        clear: inputs.clear,
        exclude: inputs.exclude,
        include: inputs.include,
    })
    .catch((err) => core.setFailed(err));
