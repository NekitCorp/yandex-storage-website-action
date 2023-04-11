import { globSync } from "glob";
import { minimatch } from "minimatch";
import path from "path";

function nonNullable<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined;
}

export class FilesManager implements IFilesManager {
    getFiles(options: { exclude: string[]; include: string[]; workingDirectory: string }) {
        const include = options.include.map((pattern) => path.join(options.workingDirectory, pattern));
        const exclude = options.exclude.map((pattern) => path.join(options.workingDirectory, pattern));

        return include
            .map((pattern) =>
                globSync(pattern, { nodir: true })
                    .map((file) => (exclude.some((excludePattern) => minimatch(file, excludePattern)) ? null : file))
                    .filter(nonNullable)
            )
            .flat(1);
    }
}
