import {fetchListAction, fetchSearch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

export function fetchSearchTruckerStats(queryName: string, query: any, page: number) {
    return fetchSearch(
        "stats/truckers-list",
        "trucker-stats",
        undefined,
        queryName,
        query,
        page,
        "web"
    );
}

export function fetchExportTruckerStats(
    filters: string,
    exportMethod: "download" | "email",
    email: string
) {
    return fetchListAction(
        "stats",
        "trucker-stats",
        "export-trucker-stats",
        "POST",
        {},
        {export_method: exportMethod, email, filters},
        exportMethod === "email" ? t("common.emailSent") : undefined,
        undefined,
        "web"
    );
}
