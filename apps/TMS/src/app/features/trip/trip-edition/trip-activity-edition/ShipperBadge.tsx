import {Box, Badge} from "@dashdoc/web-ui";
import {BADGE_COLOR_VARIANTS} from "@dashdoc/web-ui";
import React from "react";

import {TripTransport, TransportBadgeVariant} from "../../trip.types";

export const ShipperBadge = ({
    transports,
    getBadgeVariantByTransportUid,
}: {
    transports: TripTransport[];
    getBadgeVariantByTransportUid: (transportUid: string) => TransportBadgeVariant;
}) => {
    const transportsFactorises = transports.reduce(
        (acc, transport) => {
            if (acc[transport.shipper.name]) {
                acc[transport.shipper.name].push(transport);
            } else {
                acc[transport.shipper.name] = [transport];
            }
            return acc;
        },
        {} as {[key: string]: TripTransport[]}
    );

    return (
        <>
            {
                // iterates key index of transportsFactorises
                Object.keys(transportsFactorises).map((key) => {
                    const transports = transportsFactorises[key];
                    return (
                        <Badge
                            variant="none"
                            backgroundColor="white"
                            shape="squared"
                            mb={1}
                            alignItems="center"
                            data-testid="shipper-name"
                            key={transports[0].uid}
                        >
                            {transports[0].shipper.name}
                            {transports.map((transport) => (
                                <Box
                                    key={transport.uid}
                                    ml={2}
                                    borderRadius={99}
                                    backgroundColor={
                                        BADGE_COLOR_VARIANTS[
                                            getBadgeVariantByTransportUid(transport.uid) ??
                                                "default"
                                        ].color?.split(".")[0] + ".light"
                                    }
                                    minWidth={10}
                                    height={10}
                                />
                            ))}
                        </Badge>
                    );
                })
            }
        </>
    );
};
