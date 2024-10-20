import {CarrierCard} from "../types";

import type {Transport} from "app/types/transport";

function getCarrierCard(transport: Transport): CarrierCard | null {
    if (transport.carrier) {
        const carrier = transport.carrier;
        return {
            id: carrier.pk,
            title: carrier.name,
            subTitle: undefined,
            carrierPk: carrier.pk,
        };
    } else if (transport.carrier_draft_assigned) {
        const carrier = transport.carrier_draft_assigned;
        return {
            id: carrier.pk,
            title: carrier.name,
            subTitle: undefined,
            carrierPk: carrier.pk,
        };
    }

    return null;
}

export const carrierCardService = {
    getCarrierCard,
};
