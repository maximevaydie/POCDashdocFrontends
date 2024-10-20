import {useMemo} from "react";

import {carrierCardService} from "app/features/transportation-plan/services/carrierCard.service";
import {CarrierCard} from "app/features/transportation-plan/types";

import type {Transport} from "app/types/transport";

/**
 * Return a carrierCard according to the given transport.
 */
export function useCarrierCard(transport: Transport): CarrierCard | null {
    const carrierCard = useMemo(
        () => {
            let result: CarrierCard | null = carrierCardService.getCarrierCard(transport);

            return result;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [transport, transport?.carrier?.pk, transport?.carrier_draft_assigned?.pk]
    );
    return carrierCard;
}
