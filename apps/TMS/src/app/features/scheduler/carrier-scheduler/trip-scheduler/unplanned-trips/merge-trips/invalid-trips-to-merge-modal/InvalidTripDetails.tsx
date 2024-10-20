import {t} from "@dashdoc/web-core";
import {Box, ClickableFlex, Text} from "@dashdoc/web-ui";
import React from "react";
import {useHistory} from "react-router";

import {getFirstTransport} from "app/features/trip/trip.service";
import {CompactTrip, InvalidTripType} from "app/features/trip/trip.types";

type InvalidTripDetailsProps = {
    trip: CompactTrip;
    reason: InvalidTripType;
};

export function InvalidTripDetails({trip, reason}: InvalidTripDetailsProps) {
    const getInvalidReasonLabel = (type: InvalidTripType): string => {
        switch (type) {
            case "round":
                return t("trip.invalidMerge.types.round");
            case "rental":
                return t("trip.invalidMerge.types.rental");
            case "multiCompartments":
                return t("trip.invalidMerge.types.multiCompartments");
            case "businessPrivacy":
                return t("trip.invalidMerge.types.businessPrivacy");
        }
    };
    const history = useHistory();
    const transport = getFirstTransport(trip); // invalid trip are not prepared so they are related to only one transport
    return (
        <Box border="1px solid" borderColor="grey.light" borderRadius={1} mt={2} pt={2}>
            <Text px={3}>
                {t("common.transport") + " "}
                {transport.sequential_id}
            </Text>
            <Text px={3} color="red.default" data-testid="invalid-trip-reason">
                {getInvalidReasonLabel(reason)}
            </Text>
            <ClickableFlex
                key={transport.uid}
                color="grey.dark"
                width="100%"
                p={1}
                mt={1}
                justifyContent="center"
                borderTop="1px solid"
                borderColor="grey.light"
                onClick={() => history.push(`/app/transports/${transport.uid}/`)}
            >
                {t("components.goToTransportDetail")}
            </ClickableFlex>
        </Box>
    );
}
