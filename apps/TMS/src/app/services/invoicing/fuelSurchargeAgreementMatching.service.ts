import {apiService} from "@dashdoc/web-common";

import {FuelSurchargeAgreementTransportMatch} from "app/features/pricing/fuel-surcharges/types";

export async function fetchMatchingFuelSurchargeAgreementFromTransport(
    transportUid: string,
    pricingType: "quotation" | "pricing"
): Promise<FuelSurchargeAgreementTransportMatch | null> {
    try {
        const response: FuelSurchargeAgreementTransportMatch = await apiService.post(
            `fuel-surcharge-agreements/transport-match/${transportUid}/`,
            {
                pricing_type: pricingType,
            },
            {
                apiVersion: "web",
            }
        );
        return response;
    } catch (error) {
        return null;
    }
}

export type DatesForFuelSurchargeAgreementTransportMatch = {
    creation_date: string | undefined;
    asked_loading_date: string | undefined;
    planned_loading_date: string | undefined;
    real_loading_date: string | undefined;
    asked_unloading_date: string | undefined;
    planned_unloading_date: string | undefined;
    real_unloading_date: string | undefined;
};

export async function fetchMatchingFuelSurchargeAgreementFromNewTransport(
    carrierId: number | undefined,
    draftAssignedCarrierId: number | undefined,
    shipperId: number | undefined,
    dates: DatesForFuelSurchargeAgreementTransportMatch
): Promise<FuelSurchargeAgreementTransportMatch | null> {
    try {
        const response: FuelSurchargeAgreementTransportMatch = await apiService.post(
            `fuel-surcharge-agreements/chartering-match/`,
            {
                carrier_id: carrierId,
                draft_assigned_carrier_id: draftAssignedCarrierId,
                shipper_id: shipperId,
                dates,
            },
            {
                apiVersion: "web",
            }
        );
        return response;
    } catch (error) {
        return null;
    }
}
