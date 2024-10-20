import {
    fetchAdd,
    fetchDelete,
    fetchDetailAction,
    fetchListAction,
    fetchRetrieve,
    fetchSearch,
    fetchUpdate,
} from "@dashdoc/web-common";
import {ExportMethod} from "@dashdoc/web-common/src/features/export/types";
import {queryService, t} from "@dashdoc/web-core";
import {Trucker, Unavailability} from "dashdoc-utils";

import {ExportFileType} from "app/features/export/ExportModal";
import {SearchQuery} from "app/redux/reducers/searches";

import {truckerSchema} from "../schemas";

export function fetchRetrieveTrucker(truckerPk: Trucker["pk"], showToast = true) {
    return fetchRetrieve(
        "manager-truckers",
        "trucker",
        truckerSchema,
        truckerPk,
        undefined,
        "v4",
        undefined,
        undefined,
        showToast
    );
}

export function fetchAddTrucker(values: any) {
    return fetchAdd("manager-truckers", "trucker", values, truckerSchema);
}

export function fetchUpdateTrucker(truckerPk: number, values: any) {
    return fetchUpdate({
        urlBase: "manager-truckers",
        objName: "trucker",
        uid: truckerPk,
        obj: values,
        objSchema: truckerSchema,
        successMessage: t("common.updateSaved"),
    });
}

export function fetchSearchTruckers(
    queryName: string,
    query: any,
    page:
        | number
        | {
              fromPage: number;
              toPage: number;
          }
) {
    return fetchSearch("manager-truckers", "trucker", truckerSchema, queryName, query, page);
}

export function fetchDeleteTrucker(pk: number) {
    return fetchDelete(
        "manager-truckers",
        "trucker",
        String(pk),
        undefined,
        undefined,
        undefined,
        undefined
    );
}

export function fetchDisableTrucker(pk: number) {
    return fetchDetailAction(
        "manager-truckers",
        "trucker",
        "disable",
        "POST",
        null,
        String(pk),
        {},
        truckerSchema,
        undefined,
        undefined,
        "web"
    );
}
export function fetchEnableTrucker(pk: number) {
    return fetchDetailAction(
        "manager-truckers",
        "trucker",
        "enable",
        "POST",
        null,
        String(pk),
        {},
        truckerSchema,
        undefined,
        undefined,
        "web"
    );
}

export function fetchTruckerGenerateInviteCode(pk: number) {
    return fetchDetailAction(
        "manager-truckers",
        "trucker",
        "generate-invite-code",
        "POST",
        null,
        String(pk),
        {},
        truckerSchema,
        undefined,
        undefined
    );
}

export function fetchSendInviteCodes(filters: any) {
    return fetchListAction(
        "manager-truckers",
        "trucker",
        "send-invite-code",
        "POST",
        filters,
        {},
        undefined,
        undefined,
        "web"
    );
}

export function fetchAddTruckerUnavailability(
    truckerPk: number,
    data: Omit<Unavailability, "id">
) {
    return fetchDetailAction(
        "manager-truckers",
        "trucker",
        "unavailability",
        "POST",
        null,
        String(truckerPk),
        data,
        truckerSchema,
        undefined,
        undefined,
        "web"
    );
}

export function fetchUpdateTruckerUnavailability(
    truckerPk: number,
    unavailabilityId: number,
    data: Unavailability
) {
    return fetchDetailAction(
        "manager-truckers",
        "trucker",
        `unavailability/${unavailabilityId}`,
        "PATCH",
        null,
        String(truckerPk),
        data,
        truckerSchema,
        undefined,
        undefined,
        "web"
    );
}

export function fetchDeleteTruckerUnavailability(truckerPk: number, unavailabilityId: number) {
    return fetchDetailAction(
        "manager-truckers",
        "trucker",
        `unavailability/${unavailabilityId}`,
        "DELETE",
        null,
        String(truckerPk),
        null,
        truckerSchema,
        undefined,
        undefined,
        "web"
    );
}

export function fetchExportTruckers(
    filters: SearchQuery,
    fileType: ExportFileType,
    exportMethod: ExportMethod,
    email: string
) {
    return fetchListAction(
        "manager-truckers",
        "trucker",
        "export",
        "POST",
        null,
        {
            export_method: exportMethod,
            file_type: fileType,
            email,
            filters: queryService.toQueryString(filters),
        },
        exportMethod === "email" ? t("common.emailSent") : undefined,
        undefined,
        "web"
    );
}
