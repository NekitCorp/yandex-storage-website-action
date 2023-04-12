import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilesManager } from "../files-manager";
import { S3Uploader } from "../s3-uploader";

const workingDirectory = "src/__tests__/test-build";

const mockS3Client = {
    clearBucket: vi.fn(),
    putObjects: vi.fn(),
};

describe("s3-uploader", () => {
    let s3Uploader: S3Uploader;

    beforeEach(() => {
        s3Uploader = new S3Uploader(mockS3Client, new FilesManager(), vi.fn());
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("upload", () => {
        it("clear bucket before uploading files", async () => {
            await s3Uploader.upload({ clear: true, exclude: [], include: [], workingDirectory: "" });

            expect(mockS3Client.clearBucket).toBeCalledTimes(1);
        });

        it("don't clear bucket before uploading files", async () => {
            await s3Uploader.upload({ clear: false, exclude: [], include: [], workingDirectory: "" });

            expect(mockS3Client.clearBucket).toBeCalledTimes(0);
        });

        it("general", async () => {
            await s3Uploader.upload({ clear: false, exclude: ["README.md", "**/*.d.ts"], include: ["**/*"], workingDirectory });

            expect(mockS3Client.putObjects).toBeCalledTimes(7);

            const calls = mockS3Client.putObjects.mock.calls;

            expect(calls.find((c) => c[0] === "some.json")[2]).toBe("application/json");
            expect(calls.find((c) => c[0] === "a.js")[2]).toBe("application/javascript");
            expect(calls.find((c) => c[0] === "a.css")[2]).toBe("text/css");
            expect(calls.find((c) => c[0] === "folder1/b.js")[2]).toBe("application/javascript");
            expect(calls.find((c) => c[0] === "folder1/b.css")[2]).toBe("text/css");
            expect(calls.find((c) => c[0] === "folder1/folder2/c.js")[2]).toBe("application/javascript");
            expect(calls.find((c) => c[0] === "folder1/folder2/c.css")[2]).toBe("text/css");
        });
    });
});
