import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, LoadingWheel, VehicleTypePicker} from "@dashdoc/web-ui";
import {Pricing, SimpleContact, useToggle} from "dashdoc-utils";
import React, {useEffect} from "react";

import {OffersHeaderModal} from "app/features/transportation-plan/carrier-offer/components/OffersHeaderModal";
import {CarrierOffer} from "app/features/transportation-plan/types";

import {useCarrierOffers} from "../hooks/useCarrierOffers";

import {CarrierOfferPicker} from "./carrier-offer-picker/CarrierOfferPicker";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    agreedPrice: Pricing | null;
    onSelectOffer: (
        offer: CarrierOffer,
        contacts: SimpleContact[],
        sendToCarrier: boolean
    ) => Promise<unknown>;
    onSelectVehicleType: (vehicleType: string) => Promise<unknown>;
    onSelectAnotherCarrier?: () => void;
};
export const OffersSelector = ({
    transport,
    agreedPrice,
    onSelectOffer,
    onSelectVehicleType,
    onSelectAnotherCarrier,
}: Props) => {
    const {vehicleTypes, carrierOffers, carrierOffersCount, isRetrievingOffers} = useCarrierOffers(
        transport,
        agreedPrice
    );
    const {carrier, requested_vehicle} = transport;
    const [mutationVehiclePending, setMutationVehiclePending, setMutationVehicleFinished] =
        useMutationOn(requested_vehicle?.label ?? ""); // track the requested_vehicle update

    const [mutationCarrierPending, setMutationCarrierPending, setMutationCarrierFinished] =
        useMutationOn(carrier?.pk ?? -1); // track the carrier update

    const isLoading = isRetrievingOffers || mutationVehiclePending || mutationCarrierPending;

    if (isLoading) {
        return <LoadingWheel />;
    }

    if (carrierOffers.length === 0 || transport.requested_vehicle) {
        const selectedOffer = carrierOffers.find(
            (offer) => offer.carrierPk === transport.carrier?.pk
        );
        return (
            <CarrierOfferPicker
                offers={carrierOffers}
                selectedOffer={selectedOffer}
                count={carrierOffersCount}
                onSelectAnotherCarrier={onSelectAnotherCarrier}
                onSelectOffer={async (offer, contacts, sendToCarrier) => {
                    setMutationCarrierPending();
                    try {
                        await onSelectOffer(offer, contacts, sendToCarrier);
                    } finally {
                        setMutationCarrierFinished();
                    }
                }}
                defaultCollapsed={false}
            />
        );
    }
    return (
        <Box flexGrow={1}>
            <OffersHeaderModal offersCount={carrierOffersCount} />
            <VehicleTypePicker
                label={t("shipper.selectVehicleType")}
                vehicleTypes={vehicleTypes}
                onSelectVehicleType={async (vehicleType: string) => {
                    setMutationVehiclePending();
                    try {
                        await onSelectVehicleType(vehicleType);
                    } catch (e) {
                        setMutationVehicleFinished();
                        throw e; // rethrow
                    }
                }}
            />
            {onSelectAnotherCarrier && (
                <Flex justifyContent="flex-end" mt={4}>
                    <Button
                        variant="plain"
                        onClick={onSelectAnotherCarrier}
                        data-testid="select-another-carrier-button"
                    >
                        {t("shipper.selectAnotherCarrier")}
                    </Button>
                </Flex>
            )}
        </Box>
    );
};

/**
 * Hook to notify when a pending mutation is finished.
 * The hook user decide when the pending detection should be enable with setMutationPending.
 */
function useMutationOn(field: string | number): [boolean, () => void, () => void] {
    const [mutationPending, setMutationPending, setMutationFinished] = useToggle();

    useEffect(() => {
        setMutationFinished();
    }, [setMutationFinished, field]);

    return [mutationPending, setMutationPending, setMutationFinished];
}
