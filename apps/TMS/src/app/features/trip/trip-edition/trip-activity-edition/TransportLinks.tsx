import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Link} from "@dashdoc/web-ui";
import {BADGE_COLOR_VARIANTS} from "@dashdoc/web-ui";
import React from "react";

import {TripTransport, TransportBadgeVariant} from "app/features/trip/trip.types";

export const TransportLinks = ({
    transport,
    getBadgeVariantByTransportUid,
    ...props
}: {
    transport: TripTransport;
    getBadgeVariantByTransportUid: (transportUid: string) => TransportBadgeVariant;
}) => {
    return (
        <Flex bg="white" alignItems="center" key={transport.uid} {...props}>
            <Box
                mr={2}
                borderRadius={99}
                backgroundColor={
                    BADGE_COLOR_VARIANTS[
                        getBadgeVariantByTransportUid(transport.uid) ?? "blue"
                    ].color?.split(".")[0] + ".light"
                }
                width={10}
                height={10}
            />
            <Link
                href={`/app/transports/${transport?.uid}`}
                rel="noopener noreferrer"
                target="_blank"
                m={1}
            >
                {t("transportDetails.transportNumber", {number: transport.sequential_id})}
                <Icon name="openInNewTab" ml={2} />
            </Link>
        </Flex>
    );
};
