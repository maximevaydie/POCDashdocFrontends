import {transportViewerService} from "app/services/transport/transportViewer.service";

import type {TransportWithCarrierPk} from "app/types/transport";

export const canReadPurchaseCost = (
    transport: TransportWithCarrierPk,
    companyPks: number[]
): boolean => {
    const isCarrierGroupOf = transportViewerService.isCarrierGroupOf(transport, companyPks);

    return isCarrierGroupOf;
};

export const canUpsertPurchaseCost = (
    transport: TransportWithCarrierPk,
    companyPks: number[]
): boolean => {
    const isCarrierGroupOf = transportViewerService.isCarrierGroupOf(transport, companyPks);

    return isCarrierGroupOf;
};
