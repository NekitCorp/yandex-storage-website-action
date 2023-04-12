import * as core from "@actions/core";

type GetStringOptions = { name: string; required: true } | { name: string; required: false; defaultValue: string };

export function getString(options: GetStringOptions): string {
    const { name, required } = options;

    if (required) {
        return core.getInput(name, { required });
    } else {
        return core.getInput(name, { required }) || options.defaultValue;
    }
}

type GetBooleanOptions = { name: string; required: true } | { name: string; required: false; defaultValue: boolean };

export function getBoolean(options: GetBooleanOptions): boolean {
    const { name, required } = options;

    if (required) {
        return core.getBooleanInput(name, { required });
    } else {
        try {
            return core.getBooleanInput(name, { required });
        } catch (error) {
            return options.defaultValue;
        }
    }
}

type GetMultilineOptions = { name: string; required: true } | { name: string; required: false; defaultValue: string[] };

export function getMultiline(options: GetMultilineOptions): string[] {
    const { name, required } = options;

    if (required) {
        return core.getMultilineInput(name, { required });
    } else {
        const value = core.getMultilineInput(name, { required });

        if (value.length === 0) {
            return options.defaultValue;
        } else {
            return value;
        }
    }
}
