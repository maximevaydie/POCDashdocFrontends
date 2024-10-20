import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {RequestedVehicle, SiteSlot, zoneDateToISO, type SlimCompany} from "dashdoc-utils";
import isNil from "lodash.isnil";

import {
    TariffGridApplicationInfo,
    TariffGridRequestedVehicle,
    TransportForTariffGridsMatching,
} from "app/features/pricing/tariff-grids/types";
import {
    FormLoad,
    TransportFormDeliveryOption,
} from "app/features/transport/transport-form/transport-form.types";
import {TariffGridLineForm} from "app/services/invoicing/pricing.service";

/** Turns a grid application info (as sent by the api when requesting a transport matching tariff grids)
 * into a tariff grid line as represented in the pricing form
 */
function gridApplicationInfoToGridLineForm(
    gridApplicationInfo: TariffGridApplicationInfo
): TariffGridLineForm {
    return {
        changed: true,
        owner_type: gridApplicationInfo.owner_type,
        tariff_grid_creator_company_id: gridApplicationInfo.created_by.pk,
        tariff_grid_creator_group_view_id: gridApplicationInfo.created_by.group_view_id,
        tariff_grid_version_uid: gridApplicationInfo.tariff_grid_version_uid,
        tariff_grid_name: gridApplicationInfo.name,
        final_quantity: gridApplicationInfo.quantity_in_metric,
        final_unit_price: gridApplicationInfo.unit_price,
        final_price:
            gridApplicationInfo.pricing_policy === "flat"
                ? gridApplicationInfo.unit_price
                : (
                      parseFloat(gridApplicationInfo.unit_price) *
                      parseFloat(gridApplicationInfo.quantity_in_metric)
                  ).toString(),
        gas_index: "",
        metric: gridApplicationInfo.pricing_metric,
        pricing_policy: gridApplicationInfo.pricing_policy,
        is_gas_indexed: false,
        invoice_item: gridApplicationInfo.invoice_item || null,
        description:
            gridApplicationInfo.invoice_item?.description ||
            t("common.transport") /* set a default description when no invoice_item */,
        currency: "EUR",
    };
}

async function fetchMatchingTariffGrids(
    payload: TransportForTariffGridsMatching | null
): Promise<TariffGridApplicationInfo[]> {
    let response: TariffGridApplicationInfo[] = [];
    try {
        response = await apiService.post("tariff-grids/match/", payload, {
            apiVersion: "web",
        });
        if (!Array.isArray(response)) {
            response = [];
        }
    } catch (error) {
        return [];
    }
    return response;
}

async function fetchMatchingTariffGridsFromTransport(
    transportUid: string,
    pricingType: "QUOTATION" | "PRICING" | "SHIPPER_FINAL_PRICE"
): Promise<TariffGridApplicationInfo[]> {
    let response: TariffGridApplicationInfo[] = [];
    try {
        response = await apiService.post(
            "tariff-grids/transport-match/",
            {transport_uid: transportUid, pricing_type: pricingType},
            {
                apiVersion: "web",
            }
        );
        if (!Array.isArray(response)) {
            response = [];
        }
    } catch (error) {
        return [];
    }
    return response;
}

async function fetchMatchingTariffGridsForChartering({
    transportUid,
    carrierPk,
    requestedVehicleUid,
    type,
}: {
    transportUid: string;
    carrierPk: number;
    requestedVehicleUid: string | null | undefined;
    type: "subcontracting" | "assignation";
}): Promise<TariffGridApplicationInfo[]> {
    let response: TariffGridApplicationInfo[] = [];
    try {
        response = await apiService.post(
            type === "subcontracting"
                ? "tariff-grids/transport-subcontracting-match/"
                : "tariff-grids/transport-assignation-match/",
            {
                transport_uid: transportUid,
                carrier_pk: carrierPk,
                requested_vehicle_uid: requestedVehicleUid,
            },
            {apiVersion: "web"}
        );
        if (!Array.isArray(response)) {
            response = [];
        }
    } catch (error) {
        return [];
    }
    return response;
}

const getMinimumStartDatetime = (slots: SiteSlot[]): string | null => {
    return slots.reduce(
        (min: string | null, slot: SiteSlot) => {
            if (min === null) {
                return slot.start;
            }
            const dmin = new Date(min);
            const dslot = new Date(slot.start);
            return dmin < dslot ? min : slot.start;
        },
        null as string | null
    );
};

const getMaximumEndDatetime = (slots: SiteSlot[]): string | null => {
    return slots.reduce(
        (max: string | null, slot: SiteSlot) => {
            if (max === null) {
                return slot.end;
            }
            const dmax = new Date(max);
            const dslot = new Date(slot.end);
            return dmax > dslot ? max : slot.end;
        },
        null as string | null
    );
};

function getMatchingGridArgumentsForTransportCreation(
    pricing_type: "QUOTATION" | "PRICING" | "SHIPPER_FINAL_PRICE",
    shipper: SlimCompany | undefined,
    carrier: SlimCompany | undefined,
    invoiceCompanyPk: number | undefined,
    deliveries: TransportFormDeliveryOption[],
    loads: FormLoad[],
    timezone: string,
    requestedVehicle: RequestedVehicle | null | undefined
): TransportForTariffGridsMatching | null {
    const delivery = deliveries?.length === 1 ? deliveries[0] : undefined;
    if (delivery === undefined) {
        return null;
    }

    if (isNil(delivery.loadingActivity?.address) || isNil(delivery.unloadingActivity?.address)) {
        return null;
    }

    const loading_slots = delivery.loadingActivity?.slots;
    let asked_loading_date: string | null = null;
    if (loading_slots !== undefined) {
        asked_loading_date = getMinimumStartDatetime(loading_slots);
    }
    const unloading_slots = delivery.unloadingActivity?.slots;
    let asked_unloading_date: string | null = null;
    if (unloading_slots !== undefined) {
        asked_unloading_date = getMaximumEndDatetime(unloading_slots);
    }

    const creation_date = zoneDateToISO(new Date(), timezone);

    const estimatedDuration = 0; // For now we don't handle estimated duration at transport creation

    const loadsDetails = loads
        ? loads.map((load) => ({
              category: load.category,
              weight: load.weight ?? undefined,
              volume: load.volume ?? undefined,
              steres: load.steres ?? undefined,
              linear_meters: load.linear_meters ?? undefined,
              quantity: load.quantity ?? undefined,
          }))
        : [];

    const matchingRequestedVehicle: TariffGridRequestedVehicle | null = requestedVehicle
        ? {
              uid: requestedVehicle.uid,
              label: requestedVehicle.label,
          }
        : null;

    return {
        pricing_type,
        carrier_pk: carrier?.pk ?? null,
        shipper_pk: shipper?.pk ?? null,
        customer_to_invoice_pk: invoiceCompanyPk ?? null,
        origin: {
            id: delivery.loadingActivity.address.pk ?? null,
            name: delivery.loadingActivity.address.name ?? "",
            address: delivery.loadingActivity.address.address,
            city: delivery.loadingActivity.address.city,
            country: delivery.loadingActivity.address.country,
            postcode: delivery.loadingActivity.address.postcode,
        },
        destination: {
            id: delivery.unloadingActivity.address.pk ?? null,

            name: delivery.unloadingActivity.address.name ?? "",
            address: delivery.unloadingActivity.address.address,
            city: delivery.unloadingActivity.address.city,
            country: delivery.unloadingActivity.address.country,
            postcode: delivery.unloadingActivity.address.postcode,
        },
        loaded_loads: loadsDetails,
        unloaded_loads: loadsDetails,
        duration_in_minutes: estimatedDuration,
        distance_in_km: "0", // TODO: compute distance
        dates: {
            creation_date: creation_date,
            asked_loading_date: asked_loading_date,
            planned_loading_date: null,
            real_loading_date: null,
            asked_unloading_date: asked_unloading_date,
            planned_unloading_date: null,
            real_unloading_date: null,
        },
        requested_vehicle: matchingRequestedVehicle,
    };
}

export const tariffGridMatchingService = {
    gridApplicationInfoToGridLineForm,
    fetchMatchingTariffGrids,
    fetchMatchingTariffGridsFromTransport,
    fetchMatchingTariffGridsForChartering,
    getMatchingGridArgumentsForTransportCreation,
};
