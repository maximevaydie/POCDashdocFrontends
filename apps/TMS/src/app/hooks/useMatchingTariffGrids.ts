import {useFeatureFlag} from "@dashdoc/web-common";
import isNil from "lodash.isnil";
import {useEffect, useState} from "react";

import {tariffGridMatchingService} from "app/services/invoicing/tariffGridMatching.service";

import type {
    TariffGridApplicationInfo,
    TransportForTariffGridsMatching,
} from "app/features/pricing/tariff-grids/types";

export function useMatchingTariffGrids(
    payload: TransportForTariffGridsMatching | undefined | null
) {
    const [tariffGrids, setTariffGrids] = useState<TariffGridApplicationInfo[]>([]);
    const hasFuelSurchargesAndTariffGridsManagementEnabled = useFeatureFlag(
        "fuelSurchargesAndTariffGridsManagement"
    );

    useEffect(() => {
        if (isNil(payload)) {
            setTariffGrids([]);
        }
        if (
            hasFuelSurchargesAndTariffGridsManagementEnabled &&
            payload !== undefined &&
            payload !== null
        ) {
            tariffGridMatchingService
                .fetchMatchingTariffGrids(payload)
                .then((grids) => setTariffGrids(grids));
        }
    }, [payload, hasFuelSurchargesAndTariffGridsManagementEnabled]);

    return tariffGrids;
}

export function useMatchingTariffGridsFromTransportUid(
    transportUid: string | undefined,
    pricingType: "QUOTATION" | "PRICING" | "SHIPPER_FINAL_PRICE"
) {
    const [tariffGrids, setTariffGrids] = useState<TariffGridApplicationInfo[]>([]);
    const hasFuelSurchargesAndTariffGridsManagementEnabled = useFeatureFlag(
        "fuelSurchargesAndTariffGridsManagement"
    );

    useEffect(() => {
        if (!hasFuelSurchargesAndTariffGridsManagementEnabled || transportUid === undefined) {
            setTariffGrids([]);
        } else {
            tariffGridMatchingService
                .fetchMatchingTariffGridsFromTransport(transportUid, pricingType)
                .then((grids) => setTariffGrids(grids));
        }
    }, [transportUid, pricingType, hasFuelSurchargesAndTariffGridsManagementEnabled]);

    return tariffGrids;
}

export function useMatchingTariffGridsWhenCharteringTransport({
    transportUid,
    carrierPk,
    type,
    requestedVehicleUid,
}: {
    transportUid: string | undefined;
    carrierPk: number | undefined;
    type: "subcontracting" | "assignation";
    requestedVehicleUid: string | null | undefined;
}) {
    const [tariffGrids, setTariffGrids] = useState<TariffGridApplicationInfo[]>([]);
    const hasFuelSurchargesAndTariffGridsManagementEnabled = useFeatureFlag(
        "fuelSurchargesAndTariffGridsManagement"
    );
    const hasPurchaseTariffGridsEnabled = useFeatureFlag("purchaseTariffGrids");

    useEffect(() => {
        if (
            !hasFuelSurchargesAndTariffGridsManagementEnabled ||
            !hasPurchaseTariffGridsEnabled ||
            transportUid === undefined ||
            carrierPk === undefined
        ) {
            setTariffGrids([]);
        } else {
            tariffGridMatchingService
                .fetchMatchingTariffGridsForChartering({
                    transportUid,
                    carrierPk,
                    type,
                    requestedVehicleUid,
                })
                .then((grids) => setTariffGrids(grids));
        }
    }, [
        transportUid,
        carrierPk,
        hasFuelSurchargesAndTariffGridsManagementEnabled,
        hasPurchaseTariffGridsEnabled,
        type,
        requestedVehicleUid,
    ]);

    return tariffGrids;
}
