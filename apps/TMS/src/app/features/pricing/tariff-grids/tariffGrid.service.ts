import {SelectOption, t} from "@dashdoc/web-core";
import {
    CompanyWithGroupView,
    InvoiceItem,
    TariffGridLine,
    TariffGridPricingPolicy,
} from "dashdoc-utils";
import {cloneDeep} from "lodash";
import isNil from "lodash.isnil";

import {
    ApplicationDateType,
    TariffGridLinesType,
    TariffGridRequestedVehicle,
    TariffGridZone,
} from "app/features/pricing/tariff-grids/types";

import {TariffGrid} from "./types";

function editLandmark(
    tariffGrid: TariffGrid,
    new_origin_or_destination: TariffGridZone | null,
    isOriginOrDestination: "origin" | "destination"
) {
    const result: TariffGrid = cloneDeep(tariffGrid);
    if (new_origin_or_destination) {
        result.origin_or_destination = new_origin_or_destination;
    }
    result.is_origin_or_destination = isOriginOrDestination;
    return result;
}

function editPricingPolicy(tariffGrid: TariffGrid, value: TariffGridPricingPolicy) {
    const result: TariffGrid = cloneDeep(tariffGrid);
    result.pricing_policy = value;
    return result;
}

function editClients(
    tariffGrid: TariffGrid,
    isAllCustomers: boolean,
    customers: {pk: number; name: string}[]
) {
    const result: TariffGrid = cloneDeep(tariffGrid);
    result.is_all_customers = isAllCustomers;
    result.customers = customers;
    return result;
}

function editProduct(tariffGrid: TariffGrid, product: InvoiceItem | null) {
    const result: TariffGrid = cloneDeep(tariffGrid);
    result.invoice_item = product;
    return result;
}

function editRequestedVehicles(
    tariffGrid: TariffGrid,
    requestedVehicles: TariffGridRequestedVehicle[]
) {
    const result: TariffGrid = cloneDeep(tariffGrid);
    result.requested_vehicles = requestedVehicles;
    return result;
}

const getApplicationDateTypeOptions = (): SelectOption<ApplicationDateType>[] => [
    {
        label: t("tariffGridVersion.creationDateOption"),
        value: "creation_date",
    },
    {
        label: t("tariffGridVersion.realLoadingDateOption"),
        value: "real_loading_date",
    },
    {
        label: t("tariffGridVersion.plannedLoadingDateOption"),
        value: "planned_loading_date",
    },
    {
        label: t("tariffGridVersion.askedLoadingDateOption"),
        value: "asked_loading_date",
    },
    {
        label: t("tariffGridVersion.realUnloadingDateOption"),
        value: "real_unloading_date",
    },
    {
        label: t("tariffGridVersion.plannedUnloadingDateOption"),
        value: "planned_unloading_date",
    },
    {
        label: t("tariffGridVersion.askedUnloadingDateOption"),
        value: "asked_unloading_date",
    },
];

const getTariffGridApplicationDateTypeTranslation = (tariffGrid: TariffGrid): string | null => {
    switch (tariffGrid.application_date_type) {
        case "asked_loading_date":
            return t("tariffGrid.askedLoadingDate");
        case "planned_loading_date":
            return t("tariffGrid.plannedLoadingDate");
        case "real_loading_date":
            return t("tariffGrid.realLoadingDate");
        case "asked_unloading_date":
            return t("tariffGrid.askedUnloadingDate");
        case "planned_unloading_date":
            return t("tariffGrid.plannedUnloadingDate");
        case "real_unloading_date":
            return t("tariffGrid.realUnloadingDate");
        case "creation_date":
            return t("tariffGrid.creationDate");
        default:
            return null;
    }
};

const getLinesTypeLabel = (linesType: TariffGridLinesType) =>
    linesType === "zones"
        ? t("tariffGrids.geoZonesLabel", undefined, {capitalize: true})
        : t("tariffGrids.distanceRanges", undefined, {capitalize: true});

function isOwnerOfTariffGrid(
    tariffGridLine: TariffGridLine,
    company: {pk: number} | null | undefined
): boolean {
    return !isNil(company) && tariffGridLine.tariff_grid_creator_company_id == company.pk;
}

function isInTariffGridCreatorGroup(
    tariffGridLine: TariffGridLine,
    company: CompanyWithGroupView | null | undefined
): boolean {
    if (!company) {
        return false;
    }
    if (isOwnerOfTariffGrid(tariffGridLine, company)) {
        return true;
    }

    return (
        !isNil(company.group_view_id) &&
        tariffGridLine.tariff_grid_creator_group_view_id == company.group_view_id
    );
}

export const tariffGridService = {
    editLandmark,
    editPricingPolicy,
    editClients,
    editProduct,
    editRequestedVehicles,
    getApplicationDateTypeOptions,
    getTariffGridApplicationDateTypeTranslation,
    getLinesTypeLabel,
    isOwnerOfTariffGrid,
    isInTariffGridCreatorGroup,
};
