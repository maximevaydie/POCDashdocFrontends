import {guid} from "@dashdoc/core";
import {apiService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {SelectOption, toast} from "@dashdoc/web-ui";
import {Pricing} from "dashdoc-utils";
import {useEffect, useMemo, useState} from "react";

import {CarrierOffer, DEFAULT_CURRENCY} from "app/features/transportation-plan/types";

import {offerService} from "../offer.service";

import type {Transport} from "app/types/transport";

export function useCarrierOffers(transport: Transport, transportQuotation: Pricing | null) {
    const {uid: transportUid, requested_vehicle} = transport;
    const [state, setState] = useState(() => ({
        vehicleTypes: [] as SelectOption<string>[],
        carrierOffers: [] as CarrierOffer[],
        carrierOffersCount: 0,
        isRetrievingOffers: true,
    }));
    const {vehicleTypes, carrierOffers, carrierOffersCount, isRetrievingOffers} = state;
    const validTransportForOffers = offerService.isValidForOffers(transport);

    // quotationHash is a primitive string that represents transportQuotation updates
    const quotationHash = useMemo(() => (transportQuotation ? guid() : "_"), [transportQuotation]);

    // should change when offers should be re-fetched
    const fetchHash = useMemo(
        () => `${transportUid}_${requested_vehicle?.uid ?? ""}_${quotationHash}`,
        [
            transportUid,
            // The requested_vehicle is important here, this props is derived from the transport on the server.
            // It does not be used in the useEffect but must retrigger the fetch when it changes!
            requested_vehicle,
            // The transportQuotation is important here, offers have related price computation on the server.
            quotationHash,
        ]
    );

    useEffect(() => {
        // TODO: create a redux thunk to handle this
        const fetchTransportOffers = async () => {
            setState((prev) => ({...prev, isRetrievingOffers: true}));
            try {
                if (!validTransportForOffers) {
                    setState((prev) => ({
                        ...prev,
                        carrierOffers: [],
                        carrierOffersCount: 0,
                        vehicleTypes: [],
                    }));
                    return;
                }
                const offers = await apiService.Companies.getTransportOffers(transportUid);
                if (offers.results) {
                    const carrierOffers = offerService.getCarrierOffers(
                        offers.results,
                        DEFAULT_CURRENCY
                    );
                    const vehicleTypes = offers.results.map(
                        ({requested_vehicle}) =>
                            ({
                                label: requested_vehicle.label,
                                value: requested_vehicle.label,
                            }) as SelectOption<string>
                    );
                    const carrierOffersCount = offers.count;
                    setState((prev) => ({
                        ...prev,
                        carrierOffers,
                        carrierOffersCount,
                        vehicleTypes,
                    }));
                }
            } catch (error) {
                Logger.error(error);
                toast.error(t("shipper.error.couldNotFetchTransportOffer"));
            } finally {
                setState((prev) => ({...prev, isRetrievingOffers: false}));
            }
        };
        fetchTransportOffers();
    }, [transportUid, fetchHash, validTransportForOffers]);
    return {
        carrierOffers,
        carrierOffersCount,
        vehicleTypes,
        isRetrievingOffers,
    };
}
