import dotenv from "dotenv";
import { AWSS3Client } from "./src/aws-s3-client";
import { FilesManager } from "./src/files-manager";
import { S3Uploader } from "./src/s3-uploader";

dotenv.config();

if (!process.env.ACCESS_KEY_ID) {
    throw new Error("Environment variable `ACCESS_KEY_ID` not provided");
}
if (!process.env.SECRET_ACCESS_KEY) {
    throw new Error("Environment variable `SECRET_ACCESS_KEY` not provided");
}
if (!process.env.BUCKET) {
    throw new Error("Environment variable `BUCKET` not provided");
}

const s3Uploader = new S3Uploader(
    new AWSS3Client({
        accessKeyId: process.env.ACCESS_KEY_ID,
        endpoint: "https://storage.yandexcloud.net",
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        bucket: process.env.BUCKET,
    }),
    new FilesManager(),
    console.log
);

s3Uploader
    .upload({
        clear: true,
        workingDirectory: "node_modules/@actions/core/lib",
        include: ["**/*"],
        exclude: ["command.js.map", "**/*.d.ts"],
    })
    .catch((err) => console.error(err));
