import {reduceDates} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {IconNames} from "@dashdoc/web-ui";
import {
    ApplicationDateType,
    CompanyWithGroupView,
    FuelSurchargeAgreement,
    Pricing,
    TransportOfferPricing,
} from "dashdoc-utils";

import {
    ActiveField,
    ActiveFieldValues,
} from "app/features/pricing/fuel-surcharges/modals/FuelSurchargeAgreementFormModal";
import {PricingFormData} from "app/services/invoicing";
import {DatesForFuelSurchargeAgreementTransportMatch} from "app/services/invoicing/fuelSurchargeAgreementMatching.service";

import type {Transport} from "app/types/transport";

const getFuelSurchargeImpactBadgeColor = (rate: number) => {
    if (rate < 0) {
        return "red.default";
    }
    return rate > 0 ? "blue.default" : "yellow.default";
};

const getFuelSurchargeBadgeVariant = (rate: number) => {
    if (rate < 0) {
        return "error";
    }
    return rate > 0 ? "blue" : "warning";
};

const getFuelSurchargeAgreementApplicationDateType = (
    application_date_type: FuelSurchargeAgreement["application_date_type"]
) => {
    switch (application_date_type) {
        case ApplicationDateType.ASKED_LOADING_DATE:
            return t("fuelSurcharges.askedLoadingDate");
        case ApplicationDateType.PLANNED_LOADING_DATE:
            return t("fuelSurcharges.plannedLoadingDate");
        case ApplicationDateType.REAL_LOADING_DATE:
            return t("fuelSurcharges.realLoadingDate");
        case ApplicationDateType.ASKED_UNLOADING_DATE:
            return t("fuelSurcharges.askedUnloadingDate");
        case ApplicationDateType.PLANNED_UNLOADING_DATE:
            return t("fuelSurcharges.plannedUnloadingDate");
        case ApplicationDateType.REAL_UNLOADING_DATE:
            return t("fuelSurcharges.realUnloadingDate");
        default:
            return t("fuelSurcharges.creationDate");
    }
};

const getActiveFieldExplanation = (
    activeField: ActiveField
): {icon: IconNames; title: string; description: string} => {
    switch (activeField) {
        case ActiveFieldValues.APPLICATION_DATE_TYPE:
            return {
                icon: "simpleCalendar",
                title: t("fuelSurcharges.dateTypeToUse"),
                description: t("fuelSurcharges.applicationDateDescription"),
            };
        case ActiveFieldValues.FUEL_PRICE_INDEX:
            return {
                icon: "currencyDollarIncreaseMoney",
                title: t("fuelSurcharges.index"),
                description: t("fuelSurcharges.fuelPriceIndexDescription"),
            };
        case ActiveFieldValues.REFERENCE_DATE:
            return {
                icon: "simpleCalendar",
                title: t("fuelSurcharges.initialDate"),
                description: t("fuelSurcharges.initialDateDescription"),
            };
        case ActiveFieldValues.REFERENCE_PRICE:
            return {
                icon: "businessDealHandshake",
                title: t("fuelSurcharges.initialPrice"),
                description: t("fuelSurcharges.initialPriceDescription"),
            };
        case ActiveFieldValues.FUEL_PART:
            return {
                icon: "discount",
                title: t("fuelSurcharges.fuelPart"),
                description: t("fuelSurcharges.fuelPartDescription"),
            };
        default:
            return {
                icon: "gasIndex",
                title: t("fuelSurcharges.fuelSurcharge"),
                description: t("fuelSurcharges.fuelSurchargeDescription"),
            };
    }
};

function isOwnerOfPricingFuelSurchargeAgreement(
    value: Pricing | TransportOfferPricing | null | undefined,
    company: CompanyWithGroupView | null | undefined
): boolean {
    if (!value?.fuel_surcharge_agreement) {
        return true;
    }
    if (!company) {
        return false;
    }
    if (value.fuel_surcharge_agreement.created_by.pk === company.pk) {
        return true;
    }
    return (
        company.group_view_id !== undefined &&
        value.fuel_surcharge_agreement.created_by.group_view_id === company.group_view_id
    );
}

function isOwnerOfPricingFormFuelSurchargeAgreement(
    value: PricingFormData | null | undefined,
    company: CompanyWithGroupView | null | undefined
): boolean {
    if (!value?.fuel_surcharge_line) {
        return true;
    }
    if (!company) {
        return false;
    }
    if (value.fuel_surcharge_line.created_by.pk === company.pk) {
        return true;
    }
    return (
        company.group_view_id !== undefined &&
        value.fuel_surcharge_line.created_by.group_view_id === company.group_view_id
    );
}
export function getDatesForFuelSurchargeAgreementMatch(
    transport: Transport,
    forNewTransport: boolean
): DatesForFuelSurchargeAgreementTransportMatch {
    return {
        creation_date: forNewTransport
            ? new Date().toISOString()
            : (transport.created_device ?? transport.created),
        asked_loading_date: reduceDates(
            transport.segments.map((segment) => segment.scheduled_start_range?.start),
            "min"
        ),
        planned_loading_date: reduceDates(
            transport.segments.map((segment) => segment.origin.scheduled_range?.start),
            "min"
        ),
        real_loading_date: reduceDates(
            transport.segments.map((segment) => segment.origin.real_start),
            "min"
        ),
        asked_unloading_date: reduceDates(
            transport.segments.map((segment) => segment.scheduled_end_range?.end),
            "max"
        ),
        planned_unloading_date: reduceDates(
            transport.segments.map((segment) => segment.destination.scheduled_range?.end),
            "max"
        ),
        real_unloading_date: reduceDates(
            transport.segments.map((segment) => segment.destination.real_end),
            "max"
        ),
    };
}

export const fuelSurchargeService = {
    getFuelSurchargeBadgeVariant,
    getFuelSurchargeImpactBadgeColor,
    getFuelSurchargeAgreementApplicationDateType,
    getActiveFieldExplanation,
    isOwnerOfPricingFuelSurchargeAgreement,
    isOwnerOfPricingFormFuelSurchargeAgreement,
    getDatesForFuelSurchargeAgreementMatch,
};
