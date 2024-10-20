import {t} from "@dashdoc/web-core";
import {Flex, Icon, Link, Text} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";

import {DeleteSubcontractAction} from "app/features/transportation-plan/plan-or-subcontract/subcontract/DeleteSubcontractAction";
import {fetchRetrieveTrip} from "app/redux/actions/trips";

import type {TripChildTransport} from "app/features/trip/trip.types";

type Props = {
    childTransport: TripChildTransport;
    tripUid: string;
};

export function TripSubcontractingOverview({childTransport, tripUid}: Props) {
    const dispatch = useDispatch();

    return (
        <Flex
            flexDirection="column"
            border="1px solid"
            borderColor="grey.light"
            data-testid="trip-subcontracting-details"
        >
            <Flex
                backgroundColor="grey.lighter"
                paddingX={2}
                paddingY={1}
                alignContent="center"
                justifyContent="space-between"
            >
                <Link
                    display="flex"
                    alignItems="center"
                    href={`/app/orders/${childTransport.uid}`}
                    target="_blank"
                >
                    <Icon name="cart" mr={3} color="blue.default" />
                    <Text color="blue.default" mr={2}>
                        {t("transportDetails.newOrderNumber", {
                            number: childTransport.sequential_id,
                        })}
                    </Text>
                    <Icon name="openInNewTab" color="blue.default" />
                </Link>

                <DeleteSubcontractAction
                    childTransportUid={childTransport.uid}
                    isDeclined={childTransport.status === "declined"}
                    isDraftAssigned={!childTransport.sent_to_carrier}
                    onSuccess={async () => {
                        await dispatch(fetchRetrieveTrip(tripUid));
                    }}
                />
            </Flex>
            <Flex flexDirection="column" style={{gap: 8}} padding={2}>
                <Flex flexDirection="row">
                    <Icon name="carrier" mr={3} />
                    <Text variant="h2">{childTransport.carrier_name}</Text>
                </Flex>

                {childTransport.price && (
                    <Flex flexDirection="row">
                        <Icon name="euro" mr={3} />
                        <Text>{`${t("components.cost")} ${childTransport.price}`}</Text>
                    </Flex>
                )}

                <Flex flexDirection="row">
                    <Icon name="instructions" mr={3} />
                    <Text>
                        {childTransport.instructions
                            ? childTransport.instructions
                            : t("components.noInstructions")}
                    </Text>
                </Flex>

                {childTransport.chartering_confirmation_document_url && (
                    <Flex flexDirection="row" data-testid="trip-subcontracting-confirmation-link">
                        <Link
                            display="flex"
                            href={childTransport.chartering_confirmation_document_url}
                            target="_blank"
                        >
                            <Icon name="document" mr={3} color="blue.default" />
                            <Text color="blue.default" mr={2}>
                                {t("settings.charterConfirmation")}
                            </Text>
                            <Icon name="openInNewTab" color="blue.default" />
                        </Link>
                    </Flex>
                )}
            </Flex>
        </Flex>
    );
}
