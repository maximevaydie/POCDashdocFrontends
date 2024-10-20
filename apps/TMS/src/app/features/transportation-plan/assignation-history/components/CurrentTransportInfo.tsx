import {getLoadCategoryLabel, t} from "@dashdoc/web-core";
import {Callout, Flex, Text} from "@dashdoc/web-ui";
import React from "react";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
};

export function CurrentTransportInfo({transport}: Props) {
    let plannedLoadCategories = new Set();
    let loadingAddresses = new Set();
    let unloadingAddresses = new Set();
    if (transport !== null) {
        for (const delivery of transport.deliveries) {
            loadingAddresses.add(
                `${delivery.origin?.address?.city} (${delivery.origin?.address?.postcode})`
            );
            unloadingAddresses.add(
                `${delivery.destination?.address?.city} (${delivery.destination?.address?.postcode})`
            );
            // May happen when the transport has not been fully loaded. (loaded from transport list)
            if (delivery.planned_loads) {
                for (const plannedLoad of delivery.planned_loads) {
                    plannedLoadCategories.add(getLoadCategoryLabel(plannedLoad.category));
                }
            }
        }

        loadingAddresses.delete(null);
        loadingAddresses.delete(undefined);
        unloadingAddresses.delete(null);
        unloadingAddresses.delete(undefined);
    }

    return (
        <Callout iconDisabled p={3} borderRadius={2} mb={5} backgroundColor="grey.ultralight">
            <Flex flexDirection="column">
                <Text variant="h2">{t("common.transport")}</Text>
                <Flex justifyContent="space-between">
                    <Text mr={2}>
                        {Array.from(loadingAddresses).join(",")} ➡️{" "}
                        {Array.from(unloadingAddresses).join(",")}
                    </Text>
                    <Text>{Array.from(plannedLoadCategories).join(",")}</Text>
                </Flex>
            </Flex>
        </Callout>
    );
}
