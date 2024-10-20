import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {
    TariffGrid,
    TariffGridLineHeadersUpsertRequest,
    TariffGridLinesType,
    TariffGridOwnerType,
    TariffGridZoneInput,
} from "../types";

/** The type of arguments expected by the API point that creates a tariff grid
 *
 * must be in sync with the backend `TariffGridCreationRequest` type
 */
interface TariffGridCreationRequest {
    name: string;
    owner_type: TariffGridOwnerType;
    customers_pks: string[];
    is_all_customers: boolean;
    requested_vehicles_uids: string[];
    status: "active" | "inactive";
    load_category: string;
    is_origin_or_destination: "origin" | "destination";
    origin_or_destination: TariffGridZoneInput | null;
    pricing_metric: string;
    pricing_policy: "flat" | "multiply";
    metric_steps: number[];
    table: number[][];
    line_headers: TariffGridLineHeadersUpsertRequest;
    invoice_item_uid?: string | null;
}

/** Create an initial tariff grid */
async function create({
    name,
    owner_type,
    loadCategory,
    pricingMetric,
    lines_type,
    status,
}: {
    name: string;
    owner_type: TariffGridOwnerType;
    loadCategory: string;
    pricingMetric: string;
    lines_type: TariffGridLinesType;
    status: "active" | "inactive";
}): Promise<TariffGrid> {
    const data: TariffGridCreationRequest = {
        name,
        owner_type,
        customers_pks: [],
        is_all_customers: false,
        requested_vehicles_uids: [],
        is_origin_or_destination: "origin",
        origin_or_destination: null,
        status,
        load_category: loadCategory,
        pricing_metric: pricingMetric,
        metric_steps: [],
        pricing_policy: "multiply",
        table: [],
        line_headers: {
            lines_type: lines_type,
            zones: [],
            distances: [],
        },
        invoice_item_uid: null,
    };
    const response: TariffGrid = await apiService.post(`tariff-grids/`, data, {
        apiVersion: "web",
    });
    return response;
}

/** Duplicate a tariff grid */
async function duplicate(
    tariffGridUid: string,
    name: string,
    clearCellValues: boolean
): Promise<TariffGrid> {
    const data = {
        name: `${name} ${t("common.copySuffix")}`,
        clear_cell_values: clearCellValues,
    };
    const response: TariffGrid = await apiService.post(
        `tariff-grids/${tariffGridUid}/duplicate/`,
        data,
        {
            apiVersion: "web",
        }
    );
    return response;
}

/** Rename a tariff grid */
async function rename(tariffGridUid: string, name: string) {
    const data = {name};
    const response = await apiService.patch(`tariff-grids/${tariffGridUid}/`, data, {
        apiVersion: "web",
    });
    return response;
}

/** Delete a tariff grid */
async function _delete(tariffGridUid: string): Promise<void> {
    await apiService.delete(`tariff-grids/${tariffGridUid}/`, {
        apiVersion: "web",
    });
}

export const modalService = {
    create,
    duplicate,
    rename,
    delete: _delete,
};
