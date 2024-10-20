import {useFeatureFlag} from "@dashdoc/web-common";
import {useEffect, useState} from "react";

import {FuelSurchargeAgreementTransportMatch} from "app/features/pricing/fuel-surcharges/types";
import {fetchMatchingFuelSurchargeAgreementFromTransport} from "app/services/invoicing/fuelSurchargeAgreementMatching.service";

export function useMatchingFuelSurchargeAgreementFromTransportUid(
    transportUid: string | undefined,
    pricingType: "quotation" | "pricing"
) {
    const [fuelSurchargeAgreement, setFuelSurchargeAgreement] =
        useState<FuelSurchargeAgreementTransportMatch | null>(null);
    const hasFuelSurchargesAndTariffGridsManagement = useFeatureFlag(
        "fuelSurchargesAndTariffGridsManagement"
    );

    useEffect(() => {
        if (hasFuelSurchargesAndTariffGridsManagement && transportUid) {
            rematch();
        } else {
            setFuelSurchargeAgreement(null);
        }
    }, [transportUid, hasFuelSurchargesAndTariffGridsManagement]);

    async function rematch() {
        const matchResult = await fetchMatchingFuelSurchargeAgreementFromTransport(
            transportUid!,
            pricingType
        );
        setFuelSurchargeAgreement(
            matchResult?.fuel_surcharge_agreement && matchResult?.fuel_surcharge_item
                ? matchResult
                : null
        );
    }

    return fuelSurchargeAgreement;
}
