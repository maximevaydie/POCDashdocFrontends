import {getMessageFromErrorCode} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {AsyncThunkAction} from "@reduxjs/toolkit";

type NonFieldError = {
    code: string[];
    detail?: string[];
};

export type ErrorPayload =
    | {
          non_field_errors: NonFieldError;
      }
    | {detail: string};

/**
 * Extract the error payload from an error object.
 */
async function getErrorPayload(err: unknown): Promise<ErrorPayload> {
    if (err instanceof Object) {
        if ("status" in err && typeof err.status === "number") {
            if (err.status >= 400 && err.status < 500) {
                if ("json" in err && typeof err.json === "function") {
                    const error: ErrorPayload = await err.json();
                    return error;
                }
            }
        }
    }
    const defaultError: ErrorPayload = {
        non_field_errors: {
            code: [t("common.unknownError")],
        },
    };
    return defaultError;
}

/**
 * Detect if an action result contains an error.
 */
function containsError(result: AsyncThunkAction<unknown, unknown, any>) {
    return result instanceof Object && "error" in result;
}

/**
 * Get the error message from an action result.
 */
function getErrorCode(result: AsyncThunkAction<unknown, unknown, any>): string {
    if (result instanceof Object && "payload" in result) {
        const payload = result.payload;
        if (payload instanceof Object) {
            if ("non_field_errors" in payload) {
                const non_field_errors = payload.non_field_errors;
                if (
                    non_field_errors instanceof Object &&
                    "code" in non_field_errors &&
                    Array.isArray(non_field_errors.code)
                ) {
                    const errorCode = non_field_errors.code[0];
                    if (errorCode.length > 0) {
                        return errorCode;
                    }
                }
            } else if ("code" in payload && typeof payload.code === "string") {
                return payload.code;
            }
        }
    }
    return "unknown";
}

/**
 * Get the error message from an action result.
 */
function getError(result: AsyncThunkAction<unknown, unknown, any>): string {
    if (result instanceof Object && "payload" in result) {
        const payload = result.payload;
        if (payload instanceof Object) {
            if ("non_field_errors" in payload) {
                const non_field_errors = payload.non_field_errors;
                if (
                    non_field_errors instanceof Object &&
                    "code" in non_field_errors &&
                    Array.isArray(non_field_errors.code)
                ) {
                    const errorCode = non_field_errors.code[0];
                    if (errorCode.length > 0) {
                        const message = getMessageFromErrorCode(errorCode);
                        if (message) {
                            return message;
                        }
                    }
                }
            } else if ("code" in payload && typeof payload.code === "string") {
                const message = getMessageFromErrorCode(payload.code);
                if (message) {
                    return message;
                }
            } else if ("detail" in payload && typeof payload.detail === "string") {
                return payload.detail;
            }
        }
    }
    return t("common.unknownError");
}

export const actionService = {
    getErrorPayload,
    containsError,
    getErrorCode,
    getError,
};
