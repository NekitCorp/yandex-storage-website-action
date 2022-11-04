import dotenv from "dotenv";
import { S3Uploader } from "./s3-uploader";

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
    {
        accessKeyId: process.env.ACCESS_KEY_ID,
        endpoint: "https://storage.yandexcloud.net",
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
    console.log
);

s3Uploader
    .upload({
        bucket: process.env.BUCKET,
        clear: true,
        include: ["**/*"],
        exclude: [".gitignore", "yarn.lock", "node_modules/**"],
    })
    .catch((err) => console.error(err));
