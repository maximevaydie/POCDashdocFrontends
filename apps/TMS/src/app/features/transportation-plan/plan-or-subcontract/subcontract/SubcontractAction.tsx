import {apiService, useFeatureFlag} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Box, ClickableFlex, Icon, Text, toast} from "@dashdoc/web-ui";
import {Pricing, useToggle} from "dashdoc-utils";
import React from "react";

import {SubcontractSubmit} from "app/features/transportation-plan/types";
import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {fetchRetrieveTransport} from "app/redux/actions/transports";
import {fetchRetrieveTrip} from "app/redux/actions/trips";
import {useDispatch} from "app/redux/hooks";

import {SubcontractModal} from "./components/SubcontractModal";

import type {Transport} from "app/types/transport";

type Props = {
    disabled: boolean;
    transport?: Transport;
    tripUid: string;
    segmentsUids: string[];
    parentTransportPricing?: Pricing | null;
    isSubcontractingTrip: boolean;
    forceEdit?: boolean;
    isSubcontractingTheWholeTransport?: boolean;
    onSubcontracted: () => void;
    onClose: () => void;
};

export function SubcontractAction({
    disabled,
    transport,
    tripUid,
    isSubcontractingTrip,
    segmentsUids,
    parentTransportPricing,
    isSubcontractingTheWholeTransport,
    onSubcontracted,
    onClose,
}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();

    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting, setIsSubmitted] = useToggle();
    const transportListRefresher = useRefreshTransportLists();
    const subcontractTripEnabled = useFeatureFlag("subcontractTrip");

    return (
        <>
            <ClickableFlex
                p={3}
                borderColor="grey.light"
                onClick={disabled ? () => {} : openModal}
                data-testid="charter-button"
                disabled={disabled || isSubmitting}
            >
                <Icon name="charter" mr={3} />
                <Box>
                    <Text color={disabled ? "grey.default" : "inherit"}>
                        {t("chartering.actions.charter")}
                    </Text>
                </Box>
            </ClickableFlex>

            {isModalOpen && (
                <SubcontractModal
                    onClose={() => {
                        closeModal();
                        onClose();
                    }}
                    transport={transport}
                    isSubmitting={isSubmitting}
                    parentTransportPricing={parentTransportPricing}
                    onSubcontract={handleSubcontract}
                    isSubcontractingTrip={isSubcontractingTrip}
                    isSubcontractingTheWholeTransport={isSubcontractingTheWholeTransport}
                />
            )}
        </>
    );

    async function handleSubcontract(subcontractProps: SubcontractSubmit) {
        try {
            setIsSubmitting();
            if (subcontractTripEnabled) {
                await apiService.post(
                    `trips/${tripUid}/subcontract/`,
                    {
                        carrier_id: subcontractProps.carrier.pk,
                        instructions: subcontractProps.instructions,
                        carrier_contact_uids: subcontractProps.carrier_contacts ?? [],
                        quotation: subcontractProps.quotation,
                        send_to_carrier: subcontractProps.send_to_carrier,
                        requested_vehicle_uid: subcontractProps.requested_vehicle_uid,
                    },
                    {
                        apiVersion: "web",
                    }
                );
            } else {
                await apiService.Segments.subcontract(segmentsUids, subcontractProps, {
                    apiVersion: "v4",
                });
            }
            toast.success(t("chartering.charterSuccess"));

            if (isSubcontractingTrip) {
                dispatch(fetchRetrieveTrip(tripUid));
            } else if (transport) {
                dispatch(fetchRetrieveTransport(transport.uid));
                transportListRefresher();
            }

            onSubcontracted();
        } catch (error) {
            Logger.error(error);
            const text = await error.json();
            toast.error(t("chartering.charterError") + ": " + text.non_field_errors.detail[0]);
        } finally {
            setIsSubmitted();
        }
    }
}
