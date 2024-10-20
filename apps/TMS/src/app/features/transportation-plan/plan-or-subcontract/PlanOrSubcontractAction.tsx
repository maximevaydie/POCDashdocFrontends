import {guid} from "@dashdoc/core";
import {useExtensionWithTripSendToNetworkTrigger} from "@dashdoc/web-common";
import {Box, Flex, Popover} from "@dashdoc/web-ui";
import {Pricing} from "dashdoc-utils";
import React, {useState, PropsWithChildren} from "react";

import {SendToNetworkAction} from "app/features/extensions/SendToNetworkAction";
import {TripMeans} from "app/features/trip/trip.types";

import {PlanAction} from "./plan/PlanAction";
import {SubcontractAction} from "./subcontract/SubcontractAction";

import type {Transport} from "app/types/transport";

type Props = {
    means: TripMeans;
    disabled: boolean;
    transport?: Transport;
    sentToTrucker: boolean;
    tripUid: string;
    isPlanningPreparedTrip?: boolean;
    // TODO: Remove segmentsUidsToCharter prop when we remove the ff subcontractTrip
    segmentsUidsToCharter?: string[];
    parentTransportPricing?: Pricing | null;
    canSubcontract: boolean;
    isSubcontractingTheWholeTransport?: boolean;
    onPlanned?: () => void;
    onSubcontracted?: () => void;
};

export function PlanOrSubcontractAction(props: PropsWithChildren<Props>) {
    const {
        children,
        means,
        disabled,
        transport,
        sentToTrucker,
        tripUid,
        isPlanningPreparedTrip = false,
        segmentsUidsToCharter = [],
        parentTransportPricing,
        canSubcontract,
        isSubcontractingTheWholeTransport,
        onPlanned,
        onSubcontracted,
    } = props;

    const extensionsWithTripSendToNetworkTrigger = useExtensionWithTripSendToNetworkTrigger();

    const [key, setKey] = useState("_");
    const clearPopoverState = () => setKey(guid());
    return (
        <Flex>
            <Popover key={key}>
                <Popover.Trigger width="100%">{children}</Popover.Trigger>
                <Popover.Content>
                    <Flex justifyContent="center" flexDirection="column" style={{gap: "4px"}}>
                        <PlanAction
                            means={means}
                            disabled={disabled}
                            transport={transport}
                            sentToTrucker={sentToTrucker}
                            tripUid={tripUid}
                            isPlanningPreparedTrip={isPlanningPreparedTrip}
                            onPlanned={() => {
                                onPlanned?.();
                                clearPopoverState();
                            }}
                            onClose={clearPopoverState}
                        />
                        {canSubcontract && (
                            <>
                                <Box height={1} bg="grey.light" />
                                <SubcontractAction
                                    disabled={disabled}
                                    transport={transport}
                                    segmentsUids={segmentsUidsToCharter}
                                    isSubcontractingTheWholeTransport={
                                        isSubcontractingTheWholeTransport
                                    }
                                    parentTransportPricing={parentTransportPricing}
                                    onSubcontracted={() => {
                                        onSubcontracted?.();
                                        clearPopoverState();
                                    }}
                                    onClose={clearPopoverState}
                                    isSubcontractingTrip={isPlanningPreparedTrip}
                                    tripUid={tripUid}
                                />
                            </>
                        )}
                        {transport && (
                            <>
                                {extensionsWithTripSendToNetworkTrigger.length > 0 && (
                                    <Box height={1} bg="grey.light" />
                                )}

                                {extensionsWithTripSendToNetworkTrigger.map((extension) => (
                                    <SendToNetworkAction
                                        key={extension.uid}
                                        disabled={disabled}
                                        extension={extension}
                                        onClose={clearPopoverState}
                                        onSentToNetwork={clearPopoverState}
                                        tripUid={tripUid}
                                    />
                                ))}
                            </>
                        )}
                    </Flex>
                </Popover.Content>
            </Popover>
        </Flex>
    );
}
