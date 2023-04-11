import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type Options = {
    accessKeyId: string;
    endpoint: string;
    secretAccessKey: string;
    bucket: string;
};

export class AWSS3Client implements IS3Client {
    private readonly client: S3Client;
    private readonly bucket: string;

    constructor({ accessKeyId, endpoint, secretAccessKey, bucket }: Options) {
        this.client = new S3Client({ endpoint, region: "ru-central1", credentials: { accessKeyId, secretAccessKey } });
        this.bucket = bucket;
    }

    public async putObjects(key: string, body: string | Buffer, contentType: string) {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
        });

        await this.client.send(command);
    }

    public async clearBucket() {
        const listCommand = new ListObjectsV2Command({
            Bucket: this.bucket,
            // The default and maximum number of keys returned is 1000.
            MaxKeys: 1000,
        });

        let isTruncated = true;
        let totalDeleted = 0;

        while (isTruncated) {
            const { Contents, IsTruncated, NextContinuationToken } = await this.client.send(listCommand);

            if (!Contents || Contents.length === 0) {
                break;
            }

            isTruncated = Boolean(IsTruncated);
            listCommand.input.ContinuationToken = NextContinuationToken;

            const deleteCommand = new DeleteObjectsCommand({
                Bucket: this.bucket,
                Delete: {
                    Objects: Contents.map((c) => ({ Key: c.Key })),
                },
            });

            const { Deleted } = await this.client.send(deleteCommand);

            totalDeleted += Deleted?.length ?? 0;
        }

        return totalDeleted;
    }
}
