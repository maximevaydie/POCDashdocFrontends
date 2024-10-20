import {t} from "@dashdoc/web-core";
import {Box, Callout, Link, Text} from "@dashdoc/web-ui";
import React from "react";

import type {Transport} from "app/types/transport";

export function RentalLinkedToTransportsBanner({
    linkedTransports,
}: {
    linkedTransports: Transport["linked_transports"] | undefined;
}) {
    if (!linkedTransports || linkedTransports.length === 0) {
        return null;
    }
    return (
        <Callout variant="warning" iconDisabled my={3}>
            <Text display="inline">
                {t("rental.linkedToTransports", {smart_count: linkedTransports.length})}
            </Text>
            {linkedTransports.map(({uid: transportUid, sequential_id}) => (
                <Box as="li" key={sequential_id} marginX={3}>
                    <Link
                        color="black.default"
                        href={`/app/transports/${transportUid}/`}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        {t("components.transportNumber", {number: sequential_id})}
                    </Link>
                </Box>
            ))}
        </Callout>
    );
}
