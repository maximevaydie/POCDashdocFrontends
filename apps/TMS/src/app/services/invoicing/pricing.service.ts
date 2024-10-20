/**
 * Methods which can apply to pricing of type "invoiced price / pricing"
 */

import {apiService} from "@dashdoc/web-common";
import {queryService, t, translateMetricUnit} from "@dashdoc/web-core";
import {
    CompanyWithGroupView,
    FuelSurchargeLine,
    InvoiceItem,
    PlannedQuantities,
    Pricing,
    PricingLine,
    PricingLinePost,
    PricingMetricKey,
    PricingPost,
    PricingQuantities,
    TariffGridLine,
    TariffGridLinePost,
    TransportOfferPricing,
    getPricingPostData,
    isEmptyPricing,
    purgePricingIds,
    purgeVariableQuantity,
} from "dashdoc-utils";
import cloneDeep from "rfdc/default";

import {TransportsQueryParams} from "app/features/filters/deprecated/utils";
import {fuelSurchargeService} from "app/features/pricing/fuel-surcharges/services/fuelSurcharge.service";
import {isTransportPartOfAPreparedTrip} from "app/features/trip/trip.service";
import {TransportPricingMetricQuantities} from "app/hooks/useTransportPricingMetricQuantities";
import {invoicingRightService} from "app/services/invoicing/invoicingRight.service";
import {isPricingEmpty} from "app/services/invoicing/pricingEntity.service";
import {hasOverridenFuelSurcharge} from "app/taxation/pricing/services/pricing-helpers";

import type {Load, Transport} from "app/types/transport";

export type PricingFormLine = Omit<PricingLinePost, "invoice_item_uid"> & {
    isOverridden: boolean;
    isNewLine?: boolean; //Tells wether the line has been created by the current form, or was already present in the pricing
    invoice_item: InvoiceItem | null;
    dismissed_suggested_invoice_item?: boolean | null;
};

export type TariffGridLineForm = TariffGridLine & {
    changed: boolean;
};

export type PricingFormData = {
    gas_index: string;
    gas_index_invoice_item: InvoiceItem | null;
    lines: PricingFormLine[];
    tariff_grid_line?: TariffGridLineForm | null;
    fuel_surcharge_line?: FuelSurchargeLine | null;
    dismissed_automatic_fuel_surcharge_application: boolean;
};

export type PricingTableTariffGridLine = TariffGridLineForm & {
    isTariffGridLine: true;
};

export type PricingTableFuelSurchargeLine = FuelSurchargeLine & {
    isFuelSurchargeLine: true;
};

export type PricingTableGasIndexLine = {isGasIndexLine: true};

export type PricingTableLine =
    | PricingFormLine
    | PricingTableTariffGridLine
    | PricingTableGasIndexLine
    | PricingTableFuelSurchargeLine;

export const variableMetrics: PricingMetricKey[] = [
    "DISTANCE_IN_KM",
    "DURATION_IN_HOUR",
    "LOADED_WEIGHT_IN_KG",
    "UNLOADED_WEIGHT_IN_KG",
    "LOADED_WEIGHT_IN_TONNE",
    "UNLOADED_WEIGHT_IN_TONNE",
    "LOADED_VOLUME_IN_LITRE",
    "UNLOADED_VOLUME_IN_LITRE",
    "LOADED_VOLUME_IN_M3",
    "UNLOADED_VOLUME_IN_M3",
    "LOADED_QUANTITY",
    "UNLOADED_QUANTITY",
    "LOADED_LINEAR_METERS",
    "UNLOADED_LINEAR_METERS",
    "LOADED_STERES",
    "UNLOADED_STERES",
    "NB_DELIVERIES",
    "NB_ROUNDS",
];

export const listOfMetrics: PricingMetricKey[] = [
    "FLAT",
    "DURATION_IN_MINUTE",
    ...variableMetrics,
];

export const LOADS_METRICS: PricingMetricKey[] = [
    "LOADED_WEIGHT_IN_KG",
    "UNLOADED_WEIGHT_IN_KG",
    "LOADED_WEIGHT_IN_TONNE",
    "UNLOADED_WEIGHT_IN_TONNE",
    "LOADED_VOLUME_IN_LITRE",
    "UNLOADED_VOLUME_IN_LITRE",
    "LOADED_VOLUME_IN_M3",
    "UNLOADED_VOLUME_IN_M3",
    "LOADED_QUANTITY",
    "UNLOADED_QUANTITY",
    "LOADED_LINEAR_METERS",
    "UNLOADED_LINEAR_METERS",
    "LOADED_STERES",
    "UNLOADED_STERES",
];

export const getMetricLabel = (metricKey: PricingMetricKey, useFlatFeeLabel?: boolean) => {
    switch (metricKey) {
        case "FLAT":
            return useFlatFeeLabel ? t("pricing.flatFee") : t("pricingMetrics.flat");
        case "DISTANCE_IN_KM":
            return t("pricingMetrics.distanceInKm");
        case "DURATION_IN_MINUTE":
            return t("pricingMetrics.durationInMin");
        case "DURATION_IN_HOUR":
            return t("pricingMetrics.durationInH");
        case "LOADED_WEIGHT_IN_KG":
            return t("pricingMetrics.loadedWeightInKg");
        case "UNLOADED_WEIGHT_IN_KG":
            return t("pricingMetrics.unloadedWeightInKg");
        case "LOADED_WEIGHT_IN_TONNE":
            return t("pricingMetrics.loadedWeightInTonnes");
        case "UNLOADED_WEIGHT_IN_TONNE":
            return t("pricingMetrics.unloadedWeightInTonnes");
        case "LOADED_VOLUME_IN_LITRE":
            return t("pricingMetrics.loadedVolumeInL");
        case "UNLOADED_VOLUME_IN_LITRE":
            return t("pricingMetrics.unloadedVolumeInL");
        case "LOADED_VOLUME_IN_M3":
            return t("pricingMetrics.loadedVolumeInM3");
        case "UNLOADED_VOLUME_IN_M3":
            return t("pricingMetrics.unloadedVolumeInM3");
        case "LOADED_QUANTITY":
            return t("pricingMetrics.loadedQuantity");
        case "UNLOADED_QUANTITY":
            return t("pricingMetrics.unloadedQuantity");
        case "LOADED_LINEAR_METERS":
            return t("pricingMetrics.loadedLinearMeters");
        case "UNLOADED_LINEAR_METERS":
            return t("pricingMetrics.unloadedLinearMeters");
        case "LOADED_STERES":
            return t("pricingMetrics.loadedSteres");
        case "UNLOADED_STERES":
            return t("pricingMetrics.unloadedSteres");
        case "NB_DELIVERIES":
            return t("pricingMetrics.deliveryPoints");
        case "NB_ROUNDS":
            return t("components.roundQuantity");
        default:
            return undefined;
    }
};

export const getMetricDisplayUnit = (metricKey: PricingMetricKey) => {
    switch (metricKey) {
        case "NB_DELIVERIES":
            return t("pricing.delivery");
        case "NB_ROUNDS":
            return t("pricing.round");
        default:
            return translateMetricUnit(metricKey);
    }
};

const DEFAULT_PRICING: PricingFormData = {
    gas_index: "0.00",
    gas_index_invoice_item: null,
    lines: [] as PricingFormLine[],
    tariff_grid_line: undefined, // null is used to indicate a line was explicitely removed
    fuel_surcharge_line: null,
    dismissed_automatic_fuel_surcharge_application: false,
};

const DEFAULT_PRICING_FORM_OPTIONS = {
    copyFuelSurchargeAgreement: true,
    copyTariffGridLine: true,
    requireLinesForFuelSurchargeAgreement: false,
    mustBeOwnerOfFuelSurchargeAgreement: false,
    fromTransportCreationForm: false,
};

export const getInitialPricingForm = (
    initialPricing: Pricing | TransportOfferPricing | null | undefined,
    ownerCompany: CompanyWithGroupView | null | undefined,
    options: {
        copyFuelSurchargeAgreement?: boolean;
        copyTariffGridLine?: boolean;
        requireLinesForFuelSurchargeAgreement?: boolean;
        mustBeOwnerOfFuelSurchargeAgreement?: boolean;
        fromTransportCreationForm?: boolean;
    } = DEFAULT_PRICING_FORM_OPTIONS
): PricingFormData => {
    let newInitialPricing: PricingFormData;
    if (!initialPricing) {
        newInitialPricing = cloneDeep(DEFAULT_PRICING);
    } else {
        const copyFuelSurchargeAgreement =
            options.copyFuelSurchargeAgreement ??
            DEFAULT_PRICING_FORM_OPTIONS.copyFuelSurchargeAgreement;
        const copyTariffGridLine =
            options.copyTariffGridLine ?? DEFAULT_PRICING_FORM_OPTIONS.copyTariffGridLine;
        const requireLinesForFuelSurchargeAgreement =
            options.requireLinesForFuelSurchargeAgreement ??
            DEFAULT_PRICING_FORM_OPTIONS.requireLinesForFuelSurchargeAgreement;
        const mustBeOwnerOfFuelSurchargeAgreement =
            options.mustBeOwnerOfFuelSurchargeAgreement ??
            DEFAULT_PRICING_FORM_OPTIONS.mustBeOwnerOfFuelSurchargeAgreement;
        const fromTransportCreationForm =
            options.fromTransportCreationForm ??
            DEFAULT_PRICING_FORM_OPTIONS.fromTransportCreationForm;

        const hasOverriddenFuelSurcharge =
            "overridden_gas_index" in initialPricing && hasOverridenFuelSurcharge(initialPricing);
        const hasFuelSurchargeAgreement = Boolean(
            initialPricing.fuel_surcharge_agreement && initialPricing.fuel_surcharge_item
        );
        const hasDismissedAutomaticFuelSurcharge =
            initialPricing.dismissed_automatic_fuel_surcharge_application;
        const isOwnerOfFuelSurchargeAgreement =
            fuelSurchargeService.isOwnerOfPricingFuelSurchargeAgreement(
                initialPricing,
                ownerCompany
            );
        const hasAnyPricingLines = Boolean(
            initialPricing.lines.length || initialPricing.tariff_grid_line
        );

        /* Decide whether we should add the automatic fuel surcharge line in the pricing form.

           We need all this:
             - to be allowed to copy it (sometimes it's not allowed, for instance for transport duplication
               when there's a draft-assigned carrier)
             - to not have a manual (overridden) fuel surcharge value
             - to have a fuel surcharge agreement (and a matching item)
             - to be the owner of the agreement (unless disabled, for instance in read-only mode)
             - to not have dismissed the agreement
             - to have at least one pricing/tariff grid line line (unless disabled, for instance
               in the chartering modal when we display the agreement even without pricing lines)
        */

        const shouldCopyFuelSurchargeAgreement =
            copyFuelSurchargeAgreement &&
            !hasOverriddenFuelSurcharge &&
            hasFuelSurchargeAgreement &&
            !hasDismissedAutomaticFuelSurcharge &&
            (!mustBeOwnerOfFuelSurchargeAgreement || isOwnerOfFuelSurchargeAgreement) &&
            (!requireLinesForFuelSurchargeAgreement || hasAnyPricingLines);

        let fuel_surcharge_line: FuelSurchargeLine | null | undefined =
            DEFAULT_PRICING.fuel_surcharge_line;
        if (
            shouldCopyFuelSurchargeAgreement &&
            initialPricing.fuel_surcharge_agreement &&
            initialPricing.fuel_surcharge_item !== null
        ) {
            fuel_surcharge_line = {
                name: initialPricing.fuel_surcharge_agreement.name,
                created_by: initialPricing.fuel_surcharge_agreement.created_by,
                quantity: initialPricing.fuel_surcharge_item.computed_rate,
                invoice_item: initialPricing.fuel_surcharge_agreement.invoice_item ?? null,
            };
        }

        newInitialPricing = {
            gas_index:
                "overridden_gas_index" in initialPricing
                    ? initialPricing.overridden_gas_index
                    : DEFAULT_PRICING.gas_index,
            gas_index_invoice_item:
                "gas_index_invoice_item" in initialPricing
                    ? initialPricing.gas_index_invoice_item
                    : DEFAULT_PRICING.gas_index_invoice_item,
            tariff_grid_line:
                !copyTariffGridLine || initialPricing.tariff_grid_line === null
                    ? DEFAULT_PRICING.tariff_grid_line
                    : {
                          /* In the case of the transport creation form, we always need to indicate the line has
                             "changed", otherwise the form does not send it. */
                          changed: fromTransportCreationForm,
                          ...initialPricing.tariff_grid_line,
                      },
            fuel_surcharge_line,
            /* We should always indicate that there was a dismissed automatic fuel surcharge application,
               if there was one, for information and also to allow the display of the re-apply button */
            dismissed_automatic_fuel_surcharge_application:
                initialPricing.dismissed_automatic_fuel_surcharge_application,
            lines: initialPricing.lines.map((pricingLine: PricingLine) => ({
                id: pricingLine.id,
                currency: pricingLine.currency,
                invoice_item: pricingLine.invoice_item,
                description: pricingLine.description,
                metric: pricingLine.metric,
                quantity: pricingLine.final_quantity,
                unit_price: pricingLine.unit_price,
                is_gas_indexed: pricingLine.is_gas_indexed,
                isOverridden: pricingLine.final_quantity_source === "OVERRIDDEN",
                dismissed_suggested_invoice_item: pricingLine.dismissed_suggested_invoice_item,
            })),
        };
    }

    return newInitialPricing;
};

export const getInitialRealQuantity = (
    metric: Exclude<PricingMetricKey, "FLAT">,
    initialQuantities: PricingQuantities
) => {
    if (!initialQuantities) {
        return "0.00";
    }

    const mapMetricToRealQuantities = {
        DISTANCE_IN_KM: initialQuantities.distance_in_km,
        DURATION_IN_MINUTE: initialQuantities.duration_in_minute,
        DURATION_IN_HOUR: initialQuantities.duration_in_hour,
        LOADED_WEIGHT_IN_KG: initialQuantities.loaded_weight_in_kg,
        LOADED_WEIGHT_IN_TONNE: initialQuantities.loaded_weight_in_tonne,
        LOADED_VOLUME_IN_LITRE: initialQuantities.loaded_volume_in_litre,
        LOADED_VOLUME_IN_M3: initialQuantities.loaded_volume_in_m3,
        LOADED_QUANTITY: initialQuantities.loaded_quantity,
        LOADED_LINEAR_METERS: initialQuantities.loaded_linear_meters,
        LOADED_STERES: initialQuantities.loaded_steres,
        UNLOADED_WEIGHT_IN_KG: initialQuantities.unloaded_weight_in_kg,
        UNLOADED_WEIGHT_IN_TONNE: initialQuantities.unloaded_weight_in_tonne,
        UNLOADED_VOLUME_IN_LITRE: initialQuantities.unloaded_volume_in_litre,
        UNLOADED_VOLUME_IN_M3: initialQuantities.unloaded_volume_in_m3,
        UNLOADED_QUANTITY: initialQuantities.unloaded_quantity,
        UNLOADED_LINEAR_METERS: initialQuantities.unloaded_linear_meters,
        UNLOADED_STERES: initialQuantities.unloaded_steres,
        NB_DELIVERIES: initialQuantities.nb_deliveries,
        NB_ROUNDS: initialQuantities.nb_rounds,
    };

    if (metric in mapMetricToRealQuantities) {
        return mapMetricToRealQuantities[metric];
    }

    return "0.00";
};

export const getInitialPlannedQuantity = (
    metric: PricingMetricKey,
    initialQuantities: PlannedQuantities
): string => {
    if (metric === "FLAT") {
        return "1.00";
    }

    if (!initialQuantities) {
        return "0.00";
    }

    let initialQuantity: null | string = null;
    switch (metric) {
        case "LOADED_WEIGHT_IN_KG":
        case "UNLOADED_WEIGHT_IN_KG":
            initialQuantity = initialQuantities.planned_loaded_weight_in_kg;
            break;
        case "LOADED_WEIGHT_IN_TONNE":
        case "UNLOADED_WEIGHT_IN_TONNE":
            initialQuantity = initialQuantities.planned_loaded_weight_in_tonne;
            break;
        case "LOADED_VOLUME_IN_LITRE":
        case "UNLOADED_VOLUME_IN_LITRE":
            initialQuantity = initialQuantities.planned_loaded_volume_in_litre;
            break;
        case "LOADED_VOLUME_IN_M3":
        case "UNLOADED_VOLUME_IN_M3":
            initialQuantity = initialQuantities.planned_loaded_volume_in_m3;
            break;
        case "LOADED_QUANTITY":
        case "UNLOADED_QUANTITY":
            initialQuantity = initialQuantities.planned_loaded_quantity;
            break;
        case "LOADED_LINEAR_METERS":
        case "UNLOADED_LINEAR_METERS":
            initialQuantity = initialQuantities.planned_loaded_linear_meters;
            break;
        case "LOADED_STERES":
        case "UNLOADED_STERES":
            initialQuantity = initialQuantities.planned_loaded_steres;
            break;
        case "DURATION_IN_HOUR":
            initialQuantity = initialQuantities.planned_duration_in_hour;
            break;
        case "DURATION_IN_MINUTE":
            initialQuantity = initialQuantities.planned_duration_in_minute;
            break;
        case "DISTANCE_IN_KM":
            initialQuantity = "0.00"; // Not available for planned quantities
            break;
        case "NB_DELIVERIES":
            initialQuantity = "0.00"; // Not available for planned quantities
            break;
        case "NB_ROUNDS":
            initialQuantity = "0.00"; // Not available for planned quantities
    }

    return initialQuantity;
};

/** Used to guess the planned quantities when the transport is not yet created (e.g. at transport creation)
 */
export const getPlannedQuantitiesFromLoads = (
    loads: Partial<Load>[],
    volumeDisplayUnit: "m3" | "L"
): PlannedQuantities => {
    let initialQuantities = {
        planned_loaded_weight_in_kg: 0,
        planned_loaded_weight_in_tonne: 0,
        planned_loaded_volume_in_litre: 0,
        planned_loaded_volume_in_m3: 0,
        planned_loaded_quantity: 0,
        planned_loaded_linear_meters: 0,
        planned_loaded_steres: 0,
    };

    let weight, volume, quantity, linearMeters, steres;

    for (const load of loads) {
        weight = load.weight;
        volume = load.volume;
        quantity = load.quantity;
        linearMeters = load.linear_meters;
        steres = load.steres;

        if (weight) {
            initialQuantities.planned_loaded_weight_in_kg += weight;
            initialQuantities.planned_loaded_weight_in_tonne += weight / 1000;
        }
        if (volume) {
            initialQuantities.planned_loaded_volume_in_m3 +=
                volumeDisplayUnit === "m3" ? volume : volume / 1000;
            initialQuantities.planned_loaded_volume_in_litre +=
                volumeDisplayUnit === "m3" ? volume * 1000 : volume;
        }
        if (quantity) {
            initialQuantities.planned_loaded_quantity += quantity;
        }
        if (linearMeters) {
            initialQuantities.planned_loaded_linear_meters += linearMeters;
        }

        if (steres) {
            initialQuantities.planned_loaded_steres += steres;
        }
    }

    return {
        planned_loaded_weight_in_kg: initialQuantities.planned_loaded_weight_in_kg.toFixed(2),
        planned_loaded_weight_in_tonne:
            initialQuantities.planned_loaded_weight_in_tonne.toFixed(3),
        planned_loaded_volume_in_litre:
            initialQuantities.planned_loaded_volume_in_litre.toFixed(2),
        planned_loaded_volume_in_m3: initialQuantities.planned_loaded_volume_in_m3.toFixed(3),
        planned_loaded_quantity: initialQuantities.planned_loaded_quantity.toFixed(2),
        planned_loaded_linear_meters: initialQuantities.planned_loaded_linear_meters.toFixed(2),
        planned_loaded_steres: initialQuantities.planned_loaded_steres.toFixed(3),
        planned_duration_in_hour: "0.00", // Not available from loads
        planned_duration_in_minute: "0.00", // Not available from loads
    };
};

export const getRealQuantitiesFromNewTransportForm = (
    nbLoadings: number,
    nbUnloadings: number
): PricingQuantities => {
    const realNbDeliveries = Math.max(nbLoadings, nbUnloadings).toString();

    return {
        distance_in_km: "0.00",
        duration_in_minute: "0.00",
        duration_in_hour: "0.00",
        loaded_weight_in_kg: "0.00",
        loaded_weight_in_tonne: "0.00",
        loaded_volume_in_litre: "0.00",
        loaded_volume_in_m3: "0.00",
        loaded_quantity: "0.00",
        loaded_linear_meters: "0.00",
        loaded_steres: "0.00",
        unloaded_weight_in_kg: "0.00",
        unloaded_weight_in_tonne: "0.00",
        unloaded_volume_in_litre: "0.00",
        unloaded_volume_in_m3: "0.00",
        unloaded_quantity: "0.00",
        unloaded_linear_meters: "0.00",
        unloaded_steres: "0.00",
        nb_deliveries: realNbDeliveries,
        nb_rounds: "0.00",
    };
};

export const getPricingMetricQuantitiesFromNewTransportForm = (
    loads: Partial<Load>[],
    volumeDisplayUnit: "m3" | "L",
    nbLoadings: number,
    nbUnloadings: number
): TransportPricingMetricQuantities => {
    const plannedQuantities = getPlannedQuantitiesFromLoads(loads, volumeDisplayUnit);
    const realQuantities = getRealQuantitiesFromNewTransportForm(nbLoadings, nbUnloadings);

    return {
        distance_in_km: realQuantities.distance_in_km,
        duration_in_minute: realQuantities.distance_in_km,
        duration_in_hour: realQuantities.duration_in_hour,
        loaded_weight_in_kg: plannedQuantities.planned_loaded_weight_in_kg,
        loaded_weight_in_tonne: plannedQuantities.planned_loaded_weight_in_tonne,
        loaded_volume_in_litre: plannedQuantities.planned_loaded_volume_in_litre,
        loaded_volume_in_m3: plannedQuantities.planned_loaded_volume_in_m3,
        loaded_quantity: plannedQuantities.planned_loaded_quantity,
        loaded_linear_meters: plannedQuantities.planned_loaded_linear_meters,
        loaded_steres: realQuantities.loaded_steres,
        unloaded_weight_in_kg: realQuantities.unloaded_weight_in_kg,
        unloaded_weight_in_tonne: realQuantities.unloaded_weight_in_tonne,
        unloaded_volume_in_litre: realQuantities.unloaded_volume_in_litre,
        unloaded_volume_in_m3: realQuantities.unloaded_volume_in_m3,
        unloaded_quantity: realQuantities.unloaded_quantity,
        unloaded_linear_meters: realQuantities.unloaded_linear_meters,
        unloaded_steres: realQuantities.unloaded_steres,
        nb_deliveries: realQuantities.nb_deliveries,
        nb_rounds: realQuantities.nb_rounds,
    };
};

export function computeShipperFinalPriceBeforeSubmit(pricingForm: PricingFormData): PricingPost {
    const result: PricingPost = computePricingBeforeSubmit(pricingForm, false, true);
    result.gas_index_invoice_item_uid = null;
    result.lines.map((line) => ({
        ...line,
        invoice_item_uid: null,
        dismissed_suggested_invoice_item: false,
    }));
    let tariff_grid_to_post: undefined | null | TariffGridLinePost = undefined;
    if (pricingForm.tariff_grid_line === null || pricingForm.tariff_grid_line === undefined) {
        tariff_grid_to_post = null;
    } else if (pricingForm.tariff_grid_line.changed) {
        tariff_grid_to_post = {
            tariff_grid_version_uid: pricingForm.tariff_grid_line.tariff_grid_version_uid,

            is_gas_indexed: pricingForm.tariff_grid_line.is_gas_indexed,
            invoice_item_uid: pricingForm.tariff_grid_line.invoice_item?.uid ?? null,
            description: pricingForm.tariff_grid_line.description,
        };
    }
    result.tariff_grid_line = tariff_grid_to_post;
    if ("dismissed_automatic_fuel_surcharge_application" in result) {
        result.dismissed_automatic_fuel_surcharge_application = false;
    }
    return result;
}

//TODO: seems close to getPricingPost, a refactoring todo?
export const computePricingBeforeSubmit = (
    pricingForm: PricingFormData,
    isCarrier: boolean,
    removeId?: boolean,
    forTransportCreation?: boolean
): PricingPost & {
    dismissed_automatic_fuel_surcharge_application?: boolean;
} => {
    if (!pricingForm) {
        // TODO: this should surely be removed along with the refactoring
        return {
            gas_index: null,
            gas_index_invoice_item_uid: null,
            lines: [],
            tariff_grid_line: forTransportCreation ? null : undefined,
        };
    }

    let tariff_grid_to_post: undefined | null | TariffGridLinePost = undefined;
    if (pricingForm.tariff_grid_line === null || pricingForm.tariff_grid_line === undefined) {
        tariff_grid_to_post = null;
        // @ts-ignore
    } else if (pricingForm.tariff_grid_line.changed) {
        let invoice_item_uid: string | null = null;
        // @ts-ignore
        if (pricingForm.tariff_grid_line.invoice_item) {
            // @ts-ignore
            invoice_item_uid = pricingForm.tariff_grid_line.invoice_item.uid;
        }
        tariff_grid_to_post = {
            tariff_grid_version_uid: pricingForm.tariff_grid_line.tariff_grid_version_uid,
            is_gas_indexed: pricingForm.tariff_grid_line.is_gas_indexed,
            invoice_item_uid,
            description: pricingForm.tariff_grid_line.description,
        };
    }

    /* The transport creation web API does not allow undefined but the current typing
       is currently not able to detect this case at transport creation.
       TODO: This should be reworked by using a specific type (subtype of `PricingPost`?)
       for the transport creation form. */
    if (forTransportCreation && tariff_grid_to_post === undefined) {
        tariff_grid_to_post = null;
    }

    return {
        gas_index: pricingForm.gas_index,
        gas_index_invoice_item_uid: pricingForm.gas_index_invoice_item?.uid ?? null,
        lines: pricingForm.lines.map((line) => {
            let invoiceItemUid = null;
            if (isCarrier) {
                invoiceItemUid = line.invoice_item?.uid ?? null;
            }

            return {
                ...line,
                id: removeId ? undefined : line.id,
                invoice_item: undefined,
                invoice_item_uid: invoiceItemUid,
                quantity: !line.isOverridden && line.metric !== "FLAT" ? null : line.quantity,
                isOverridden: undefined,
            };
        }),
        tariff_grid_line: tariff_grid_to_post,
        dismissed_automatic_fuel_surcharge_application:
            pricingForm.dismissed_automatic_fuel_surcharge_application,
    };
};

export const getManualOrAutomaticIcon = (
    metric: PricingMetricKey,
    isPricingLineOverridden: boolean
) => {
    if (metric === "FLAT") {
        return null;
    }

    if (isPricingLineOverridden) {
        return "detach";
    }

    return "horizontalAttach";
};

export const getQuantityTooltipContent = (
    metric: PricingMetricKey,
    isOverridden: boolean,
    transport: Transport | null
): string => {
    if (isOverridden) {
        return t("pricingMetrics.tooltipManualValue");
    }

    if (metric === "DISTANCE_IN_KM") {
        if (transport && isTransportPartOfAPreparedTrip(transport)) {
            return t("pricingMetrics.distance.tooltipAutomaticValueForTransportInTrip");
        }
        return t("pricingMetrics.distance.tooltipAutomaticValueForTransportNotInTrip");
    }

    return t("pricingMetrics.tooltipAutomaticValue");
};

export const getPricingMetricQuantity = (
    pricingMetricQuantities: TransportPricingMetricQuantities | null,
    metric: PricingMetricKey | undefined
): string => {
    if (pricingMetricQuantities === null) {
        return "0.00";
    }

    let pricingMetricQuantity = null;
    switch (metric) {
        case "FLAT":
            pricingMetricQuantity = "1.00";
            break;
        case "DISTANCE_IN_KM":
            pricingMetricQuantity = pricingMetricQuantities.distance_in_km;
            break;
        case "DURATION_IN_MINUTE":
            pricingMetricQuantity = pricingMetricQuantities.duration_in_minute;
            break;
        case "DURATION_IN_HOUR":
            pricingMetricQuantity = pricingMetricQuantities.duration_in_hour;
            break;
        case "LOADED_WEIGHT_IN_KG":
            pricingMetricQuantity = pricingMetricQuantities.loaded_weight_in_kg;
            break;
        case "UNLOADED_WEIGHT_IN_KG":
            pricingMetricQuantity = pricingMetricQuantities.unloaded_weight_in_kg;
            break;
        case "LOADED_WEIGHT_IN_TONNE":
            pricingMetricQuantity = pricingMetricQuantities.loaded_weight_in_tonne;
            break;
        case "UNLOADED_WEIGHT_IN_TONNE":
            pricingMetricQuantity = pricingMetricQuantities.unloaded_weight_in_tonne;
            break;
        case "LOADED_VOLUME_IN_LITRE":
            pricingMetricQuantity = pricingMetricQuantities.loaded_volume_in_litre;
            break;
        case "UNLOADED_VOLUME_IN_LITRE":
            pricingMetricQuantity = pricingMetricQuantities.unloaded_volume_in_litre;
            break;
        case "LOADED_VOLUME_IN_M3":
            pricingMetricQuantity = pricingMetricQuantities.loaded_volume_in_m3;
            break;
        case "UNLOADED_VOLUME_IN_M3":
            pricingMetricQuantity = pricingMetricQuantities.unloaded_volume_in_m3;
            break;
        case "LOADED_QUANTITY":
            pricingMetricQuantity = pricingMetricQuantities.loaded_quantity;
            break;
        case "UNLOADED_QUANTITY":
            pricingMetricQuantity = pricingMetricQuantities.unloaded_quantity;
            break;
        case "LOADED_LINEAR_METERS":
            pricingMetricQuantity = pricingMetricQuantities.loaded_linear_meters;
            break;
        case "UNLOADED_LINEAR_METERS":
            pricingMetricQuantity = pricingMetricQuantities.unloaded_linear_meters;
            break;
        case "LOADED_STERES":
            pricingMetricQuantity = pricingMetricQuantities.loaded_steres;
            break;
        case "UNLOADED_STERES":
            pricingMetricQuantity = pricingMetricQuantities.unloaded_steres;
            break;
        case "NB_DELIVERIES":
            pricingMetricQuantity = pricingMetricQuantities.nb_deliveries;
            break;
        case "NB_ROUNDS":
            pricingMetricQuantity = pricingMetricQuantities.nb_rounds;
            break;
        default:
            return "0.00";
    }

    return pricingMetricQuantity;
};

/**
 * Get the final price of a pricing.
 */
export function getFinalPrice(pricing: Pricing | null) {
    let result = "";
    if (pricing?.final_price_with_gas_indexed) {
        result = pricing.final_price_with_gas_indexed;
    } else if (pricing?.final_price_without_gas_indexed) {
        // only to "robustify" the code (when final_gas_index="0.00", final_price_with_gas_indexed===final_price_without_gas_indexed)
        result = pricing.final_price_without_gas_indexed;
    }
    return result;
}

export function getPricingPost(pricing: TransportOfferPricing): PricingPost {
    const pricingWithoutIds = purgePricingIds(pricing);
    const pricingPost = getPricingPostData(pricingWithoutIds);
    const result = purgeVariableQuantity(pricingPost);
    return result;
}

/**
 * Get the transport invoiced price (as opposed to the agreed price).
 */
export function getTransportTotalInvoicedPrice(
    transport: Pick<Transport, "pricing_total_price">
): number | null {
    return transport.pricing_total_price ? parseFloat(transport.pricing_total_price) : null;
}

/**
 * Returns the pricing to display according to:
 * the transport state
 * the pricing state
 * the company role in this transport
 * features enabled carrierAndShipperPrice && shipperFinalPrice
 */
function getTransportPricing({
    transport,
    companyPk,
    agreedPrice,
    invoicedPrice,
    shipperFinalPrice,
    hasCarrierAndShipperPriceEnabled,
    hasShipperFinalPriceEnabled,
    includeEmpty = false,
    companiesFromConnectedGroupView,
}: {
    transport: Transport;
    companyPk: number | undefined;
    agreedPrice: Pricing | null;
    invoicedPrice: Pricing | null;
    shipperFinalPrice: Pricing | null;
    hasCarrierAndShipperPriceEnabled: boolean;
    hasShipperFinalPriceEnabled: boolean;
    includeEmpty?: boolean;
    companiesFromConnectedGroupView: number[];
}) {
    if (
        invoicingRightService.canReadShipperFinalPrice(
            transport,
            companyPk,
            hasShipperFinalPriceEnabled
        ) &&
        shipperFinalPrice &&
        (includeEmpty || !isPricingEmpty(shipperFinalPrice))
    ) {
        return shipperFinalPrice;
    } else if (
        invoicingRightService.canReadInvoicedPrice(
            transport,
            companyPk,
            hasCarrierAndShipperPriceEnabled,
            companiesFromConnectedGroupView
        ) &&
        invoicedPrice &&
        (includeEmpty || !isPricingEmpty(invoicedPrice))
    ) {
        return invoicedPrice;
    } else if (
        invoicingRightService.canReadPrices(transport, companiesFromConnectedGroupView) &&
        agreedPrice &&
        (includeEmpty || !isPricingEmpty(agreedPrice))
    ) {
        return agreedPrice;
    }
    return null;
}

/**
 * Fetch via the backend the transports total invoiced price (as opposed to the agreed price).
 */
export async function fetchTransportsTotalInvoicedPrice(
    currentQuery: TransportsQueryParams
): Promise<number> {
    const {total_price} = await apiService.post(
        "/transports/transports-total-price/",
        {filters: queryService.toQueryString(currentQuery)},
        {apiVersion: "web"}
    );
    return parseFloat(total_price);
}

/**
 * Copy the provided pricing as the final price, taking care of various lines conversion
 */
function copyPricingAsFinalPrice(sourcePricing: Pricing | null): Pricing | null {
    if (!sourcePricing) {
        return null;
    }

    // Normal lines
    const lines = sourcePricing.lines.map((line) => ({
        currency: line.currency,
        description: line.description,
        expected_price: line.expected_price,
        expected_quantity: line.expected_quantity,
        final_price: line.final_price,
        final_quantity_source: line.final_quantity_source,
        final_quantity: line.final_quantity,
        is_gas_indexed: line.is_gas_indexed,
        metric: line.metric,
        real_price: line.real_price,
        real_quantity: line.real_quantity,
        unit_price: line.unit_price,
        // Not applicable to shipper price
        dismissed_suggested_invoice_item: false,
        id: undefined,
        invoice_item: null,
    }));

    // Convert tariff grid line to a regular line
    if (sourcePricing.tariff_grid_line) {
        const line = sourcePricing.tariff_grid_line;

        const price: string = line.final_price ?? "";
        let quantity: string, metric: PricingMetricKey;
        if (line.pricing_policy === "flat") {
            quantity = "1";
            metric = "FLAT";
        } else {
            quantity = line.final_quantity;
            metric = line.metric;
        }

        lines.push({
            currency: line.currency,
            description: line.description,
            expected_price: price,
            expected_quantity: quantity,
            final_price: price,
            final_quantity_source: "AUTO",
            final_quantity: quantity,
            is_gas_indexed: line.is_gas_indexed,
            metric: metric,
            real_price: price,
            real_quantity: quantity,
            unit_price: line.final_unit_price ?? "",
            // Not applicable to shipper price
            dismissed_suggested_invoice_item: false,
            id: undefined,
            invoice_item: null,
        });
    }

    return {
        // Lines on this price will contain the regular lines,
        // plus the converted tariff grid and fuel surcharge lines
        lines: lines,

        // The price and quantities shouldn't have changed
        final_price_with_gas_indexed: sourcePricing.final_price_with_gas_indexed,
        final_price_without_gas_indexed: sourcePricing.final_price_without_gas_indexed,
        planned_quantities: sourcePricing.planned_quantities,
        real_quantities: sourcePricing.real_quantities,

        // Convert the fuel surcharge (from whichever source) to a manual one
        overridden_gas_index: sourcePricing.final_gas_index,
        final_gas_index: sourcePricing.final_gas_index,

        // Invoice item don't apply to shipper
        gas_index_invoice_item: null,

        // Automatic fuel surcharge was converted to a manual fuel surcharge
        fuel_surcharge_agreement: null,
        fuel_surcharge_item: null,
        dismissed_automatic_fuel_surcharge_application: false,

        // The tariff grid line was converted to a regular line and should be ignored
        tariff_grid_line: null,
    };
}

function computePriceWithoutPurchaseCosts(
    pricing: Pricing | null,
    purchaseCosts: Transport["purchase_costs"]
): number | null {
    if (isEmptyPricing(pricing)) {
        return null;
    }

    const notEmptyPricing = pricing as Pricing;
    const totalPurchaseCost = purchaseCosts?.total_without_tax;
    if (!totalPurchaseCost) {
        return parseFloat(notEmptyPricing.final_price_with_gas_indexed);
    }

    return (
        parseFloat(notEmptyPricing.final_price_with_gas_indexed) - parseFloat(totalPurchaseCost)
    );
}

export function getPricingCurrency(
    pricing: {
        lines: Array<{currency: string}>;
        tariff_grid_line?: {currency: string} | null;
    } | null
): string | undefined {
    return pricing?.lines[0]?.currency ?? pricing?.tariff_grid_line?.currency;
}

export const pricingService = {
    getTransportPricing,
    copyPricingAsFinalPrice,
    computePriceWithoutPurchaseCosts,
};
