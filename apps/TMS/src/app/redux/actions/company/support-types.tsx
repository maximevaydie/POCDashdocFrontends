import {fetchAdd, fetchDelete, fetchSearch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {AddSupportTypeFormProps} from "app/features/settings/add-support-type-modal";
import {SUPPORT_TYPES_QUERY_NAME} from "app/types/constants";

import {supportTypeSchema} from "../../schemas";

/**
 * Retrieve the list of support types.
 * Despite the naming, this function doesn't handle any searching mechanism,
 * it is only named this way because it uses the subjacent `fetchSearch` which
 * is part of the common "server calls" the front uses.
 * Although, whevener the need of a searching feature is needed, only the parameter
 * implementation is needed for it to fully work.
 */
export function fetchSearchSupportType() {
    return fetchSearch(
        "support-types",
        "supportType",
        supportTypeSchema,
        SUPPORT_TYPES_QUERY_NAME,
        {},
        1,
        "v4"
    );
}

export function fetchAddSupportType(payload: AddSupportTypeFormProps) {
    return fetchAdd(
        "support-types",
        "supportType",
        payload,
        supportTypeSchema,
        t("supportType.createSuccess"),
        t("supportType.createFailed"),
        "v4"
    );
}

export function fetchDeleteSupportType(supportTypeUid: string) {
    return fetchDelete(
        "support-types",
        "supportType",
        supportTypeUid,
        undefined,
        undefined,
        undefined,
        undefined,
        "v4"
    );
}
