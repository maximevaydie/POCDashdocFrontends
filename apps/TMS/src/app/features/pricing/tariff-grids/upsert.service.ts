import isEqual from "lodash.isequal";

import {
    TariffGrid,
    TariffGridLineHeaders,
    TariffGridLineHeadersUpsertRequest,
    TariffGridUpdateRequest,
    TariffGridZone,
    TariffGridZoneInput,
} from "app/features/pricing/tariff-grids/types";

export function getTariffGridUpdatePayload(
    tariffGrid: TariffGrid,
    savedTariffGrid: TariffGrid
): TariffGridUpdateRequest {
    const currentVersion = tariffGrid.current_version;
    const savedCurrentVersion = savedTariffGrid.current_version;

    return {
        name: tariffGrid.name !== savedTariffGrid.name ? tariffGrid.name : undefined,
        status: tariffGrid.status !== savedTariffGrid.status ? tariffGrid.status : undefined,
        load_category:
            tariffGrid.load_category !== savedTariffGrid.load_category
                ? tariffGrid.load_category
                : undefined,
        customers_pks: !isEqual(tariffGrid.customers, savedTariffGrid.customers)
            ? tariffGrid.customers.map(({pk}) => pk)
            : undefined,
        is_all_customers:
            tariffGrid.is_all_customers !== savedTariffGrid.is_all_customers
                ? tariffGrid.is_all_customers
                : undefined,
        requested_vehicles_uids: !isEqual(
            tariffGrid.requested_vehicles,
            savedTariffGrid.requested_vehicles
        )
            ? tariffGrid.requested_vehicles.map(({uid}) => uid)
            : undefined,
        is_origin_or_destination:
            tariffGrid.is_origin_or_destination !== savedTariffGrid.is_origin_or_destination
                ? tariffGrid.is_origin_or_destination
                : undefined,
        origin_or_destination:
            tariffGrid.origin_or_destination === null
                ? null
                : tariffGrid.origin_or_destination.id === null
                  ? gridZoneToZoneInput(tariffGrid.origin_or_destination)
                  : undefined,
        pricing_metric:
            tariffGrid.pricing_metric !== savedTariffGrid.pricing_metric
                ? tariffGrid.pricing_metric
                : undefined,
        pricing_policy:
            tariffGrid.pricing_policy !== savedTariffGrid.pricing_policy
                ? tariffGrid.pricing_policy
                : undefined,
        invoice_item_uid: !isEqual(tariffGrid.invoice_item, savedTariffGrid.invoice_item)
            ? (tariffGrid.invoice_item?.uid ?? null)
            : undefined,
        metric_steps: !isEqual(currentVersion.metric_steps, savedCurrentVersion.metric_steps)
            ? currentVersion.metric_steps
            : undefined,
        table: !isEqual(currentVersion.table, savedCurrentVersion.table)
            ? currentVersion.table
            : undefined,
        line_headers: !isEqual(currentVersion.line_headers, savedCurrentVersion.line_headers)
            ? getLineHeadersUpdatePayload(currentVersion.line_headers)
            : undefined,
    };
}

export function getLineHeadersUpdatePayload(
    lineHeaders: TariffGridLineHeaders
): TariffGridLineHeadersUpsertRequest {
    if (lineHeaders.lines_type === "zones") {
        return {
            lines_type: lineHeaders.lines_type,
            zones: lineHeaders.zones.map(gridZoneToZoneInput),
        };
    } else if (lineHeaders.lines_type === "distance_range_in_km") {
        return {
            lines_type: lineHeaders.lines_type,
            distances: lineHeaders.distances,
        };
    }

    throw new Error("Unknown tariff grid lines type");
}

function gridZoneToZoneInput(zone: TariffGridZone): TariffGridZoneInput {
    if (zone.zone_type === "TARIFF_GRID_AREA_ID") {
        return {
            zone_type: "TARIFF_GRID_AREA_ID",
            area_uid: zone.area.uid,
        };
    }
    if (zone.zone_type === "PLACE") {
        return {
            zone_type: "PLACE",
            place: zone.place,
        };
    }
    return {
        zone_type: "ADDRESS",
        address_id: zone.address.id,
    };
}
