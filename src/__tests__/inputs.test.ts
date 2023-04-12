import { beforeEach, describe, expect, it } from "vitest";
import { getBoolean, getMultiline, getString } from "../inputs";

const testEnvVars = {
    // Set inputs
    INPUT_STRING: "string value",
    INPUT_BOOLEAN_TRUE: "true",
    INPUT_BOOLEAN_FALSE: "false",
    INPUT_LIST: "val1\nval2\nval3",
};

describe("@actions/core", () => {
    beforeEach(() => {
        for (const key in testEnvVars) {
            process.env[key] = testEnvVars[key as keyof typeof testEnvVars];
        }
    });

    describe("get inputs", () => {
        it("getString", async () => {
            expect(getString({ name: "string", required: true })).toBe("string value");
            expect(() => getString({ name: "string required", required: true })).toThrowError();
            expect(getString({ name: "string optional", required: false, defaultValue: "default" })).toBe("default");
        });

        it("getBooleanInput", async () => {
            expect(getBoolean({ name: "boolean true", required: true })).toBe(true);
            expect(getBoolean({ name: "boolean false", required: true })).toBe(false);
            expect(() => getBoolean({ name: "boolean required", required: true })).toThrowError();
            expect(getBoolean({ name: "boolean optional", required: false, defaultValue: false })).toBe(false);
        });

        it("getMultiline", async () => {
            expect(getMultiline({ name: "list", required: true })).toMatchObject(["val1", "val2", "val3"]);
            expect(() => getMultiline({ name: "list required", required: true })).toThrowError();
            expect(getMultiline({ name: "list optional", required: false, defaultValue: ["default"] })).toMatchObject(["default"]);
        });
    });
});
