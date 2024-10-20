import {t} from "@dashdoc/web-core";
import isEqual from "lodash.isequal";
import {createSelectorCreator, defaultMemoize} from "reselect";

import {getErrorMessageFromServerError} from "../services/errors.service";

export {createCachedSelector} from "re-reselect";
export * from "reselect";

// create a "selector creator" that uses lodash.isequal instead of ===
export const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export type SuccessMessage = string | null;
export type ErrorMessage = string | null;
export type RequestError = {status: number};

export async function getErrorMessage(
    error: RequestError,
    errorMessage?: ErrorMessage | undefined
) {
    return await getErrorMessageFromServerError(error, errorMessage ?? undefined);
}

export function getSuccessMessage(successMessage: SuccessMessage | undefined) {
    return successMessage || t("common.success");
}

/** Take an objects, checks if its an error  of the form:
 * ```javascript
 * {
 *     non_field_errors: {
 *         code: [...] //list of strings
 *     }
 * }
 * ```
 * and return the list of error codes if that's the case.
 */
export function getErrorCodes(error: unknown): null | string[] {
    if (
        typeof error === "object" &&
        error !== null &&
        "non_field_errors" in error &&
        typeof error["non_field_errors"] === "object" &&
        error["non_field_errors"] !== null &&
        "code" in error["non_field_errors"] &&
        Array.isArray(error["non_field_errors"]["code"]) &&
        error["non_field_errors"]["code"].every((x) => typeof x === "string")
    ) {
        return error["non_field_errors"]["code"];
    }
    return null;
}
