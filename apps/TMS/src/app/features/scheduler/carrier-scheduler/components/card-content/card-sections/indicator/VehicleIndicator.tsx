import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";

export function VehicleIndicator({
    vehicle,
    withWarning,
}: {
    vehicle?: {license_plate: string; fleet_number?: string};
    withWarning?: boolean;
}) {
    return vehicle?.license_plate ? (
        <VehicleLabel color="grey.dark" lineHeight={0} vehicle={vehicle} />
    ) : (
        <Flex alignItems="center">
            <Text color="red.dark" variant="subcaption" lineHeight={0}>
                {t("scheduler.segmentCardExclamation")}
            </Text>
            {withWarning && <Icon name="alert" color="red.dark" ml={1} />}
        </Flex>
    );
}
