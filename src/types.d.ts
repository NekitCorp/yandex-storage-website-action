interface IS3Client {
    putObjects(key: string, body: string | Buffer, contentType: string): Promise<void>;
    clearBucket(): Promise<number>;
}

interface IFilesManager {
    getFiles(options: { exclude: string[]; include: string[]; workingDirectory: string }): string[];
}

type ILogger = (message: string) => void;

type Inputs = {
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    workingDirectory: string;
    include: string[];
    exclude: string[];
    clear: boolean;
};
