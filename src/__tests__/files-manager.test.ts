import { beforeEach, describe, expect, it } from "vitest";
import { FilesManager } from "../files-manager";

const workingDirectory = "src/__tests__/test-build";

describe("files-manager", () => {
    let filesManager: FilesManager;

    beforeEach(() => {
        filesManager = new FilesManager();
    });

    describe("getFiles", () => {
        it("exclude test", async () => {
            expect(
                filesManager.getFiles({
                    exclude: ["README.md", "**/*.d.ts"],
                    include: ["**/*"],
                    workingDirectory,
                })
            ).toMatchObject([
                "src/__tests__/test-build/some.json",
                "src/__tests__/test-build/a.js",
                "src/__tests__/test-build/a.css",
                "src/__tests__/test-build/folder1/b.js",
                "src/__tests__/test-build/folder1/b.css",
                "src/__tests__/test-build/folder1/folder2/c.js",
                "src/__tests__/test-build/folder1/folder2/c.css",
            ]);
        });

        it("include test", async () => {
            expect(filesManager.getFiles({ exclude: [], include: ["*"], workingDirectory })).toMatchObject([
                "src/__tests__/test-build/some.json",
                "src/__tests__/test-build/a.js",
                "src/__tests__/test-build/a.d.ts",
                "src/__tests__/test-build/a.css",
                "src/__tests__/test-build/README.md",
            ]);

            expect(filesManager.getFiles({ exclude: [], include: ["a.js", "folder1/folder2/c.js"], workingDirectory })).toMatchObject([
                "src/__tests__/test-build/a.js",
                "src/__tests__/test-build/folder1/folder2/c.js",
            ]);

            expect(filesManager.getFiles({ exclude: [], include: ["folder1/folder2/**/*", "wrong.js"], workingDirectory })).toMatchObject([
                "src/__tests__/test-build/folder1/folder2/c.js",
                "src/__tests__/test-build/folder1/folder2/c.d.ts",
                "src/__tests__/test-build/folder1/folder2/c.css",
            ]);
        });

        it("workingDirectory test", async () => {
            expect(
                filesManager.getFiles({
                    exclude: [],
                    include: ["**/*"],
                    workingDirectory,
                })
            ).toMatchObject([
                "src/__tests__/test-build/some.json",
                "src/__tests__/test-build/a.js",
                "src/__tests__/test-build/a.d.ts",
                "src/__tests__/test-build/a.css",
                "src/__tests__/test-build/README.md",
                "src/__tests__/test-build/folder1/b.js",
                "src/__tests__/test-build/folder1/b.d.ts",
                "src/__tests__/test-build/folder1/b.css",
                "src/__tests__/test-build/folder1/folder2/c.js",
                "src/__tests__/test-build/folder1/folder2/c.d.ts",
                "src/__tests__/test-build/folder1/folder2/c.css",
            ]);

            expect(
                filesManager.getFiles({
                    exclude: [],
                    include: ["**/*"],
                    workingDirectory: workingDirectory + "/folder1",
                })
            ).toMatchObject([
                "src/__tests__/test-build/folder1/b.js",
                "src/__tests__/test-build/folder1/b.d.ts",
                "src/__tests__/test-build/folder1/b.css",
                "src/__tests__/test-build/folder1/folder2/c.js",
                "src/__tests__/test-build/folder1/folder2/c.d.ts",
                "src/__tests__/test-build/folder1/folder2/c.css",
            ]);

            expect(
                filesManager.getFiles({
                    exclude: [],
                    include: ["**/*"],
                    workingDirectory: workingDirectory + "/folder1/folder2/",
                })
            ).toMatchObject([
                "src/__tests__/test-build/folder1/folder2/c.js",
                "src/__tests__/test-build/folder1/folder2/c.d.ts",
                "src/__tests__/test-build/folder1/folder2/c.css",
            ]);
        });

        it("don't specify workingDirectory, should use cwd project directory", async () => {
            const files = filesManager.getFiles({
                exclude: ["node_modules/**/*"],
                include: ["**/*"],
                workingDirectory: "",
            });

            expect(files.includes("package.json")).toBeTruthy();
            expect(files.includes("yarn.lock")).toBeTruthy();
            expect(files.includes("README.md")).toBeTruthy();
            expect(files.includes("vitest.config.ts")).toBeTruthy();
        });
    });
});
