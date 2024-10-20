import {t} from "@dashdoc/web-core";
import {Callout, Flex, Link, Text} from "@dashdoc/web-ui";
import React from "react";

import type {Transport} from "app/types/transport";

export function ParentRentalTransportsBanner({
    parentRentalTransports,
}: {
    parentRentalTransports: Transport["parent_rental_transports"] | undefined;
}) {
    if (!parentRentalTransports || parentRentalTransports.length === 0) {
        return null;
    }
    return (
        <Callout variant="warning" iconDisabled my={3}>
            <Flex alignItems="baseline">
                <Text display="inline">
                    {t("transport.parentRentalTransports", {
                        smart_count: parentRentalTransports.length,
                    })}
                </Text>
                {parentRentalTransports.map(({uid: transportUid, sequential_id}, idx) => (
                    <Flex key={sequential_id} alignItems="baseline" ml={1}>
                        <Link
                            color="black.default"
                            href={`/app/transports/${transportUid}/`}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            {t("components.transportNumber", {number: sequential_id})}
                        </Link>
                        {idx + 1 !== parentRentalTransports.length && <Text>,</Text>}
                    </Flex>
                ))}
            </Flex>
        </Callout>
    );
}
