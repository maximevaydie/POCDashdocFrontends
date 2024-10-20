import {t} from "@dashdoc/web-core";
import {Flex, Text, UserAvatar} from "@dashdoc/web-ui";
import {MeansTurnoverData, ChildTransportData} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";

interface MeanDetailsProps {
    means: MeansTurnoverData | null;
    childTransport: ChildTransportData | null;
}

export const MeanDetails: FunctionComponent<MeanDetailsProps> = ({means, childTransport}) => {
    if (childTransport !== null) {
        return (
            <Text variant="h2" color="grey.ultradark">{`${t("transportDetails.newOrderNumber", {
                number: childTransport.id,
            })} ${childTransport.carrier_name}`}</Text>
        );
    }

    if (means === null) {
        return (
            <Text variant="h2" color="grey.ultradark">
                {t("splitMeansTurnoverModal.noMeansGiven")}
            </Text>
        );
    }

    return (
        <>
            {means.trucker && (
                <Flex alignItems={"center"}>
                    <UserAvatar name={means.trucker.name} size="xsmall" />
                    <Text ml={1}>{means.trucker.name}</Text>
                </Flex>
            )}
            {(means.vehicle || means.trailer) && (
                <Flex mt={2}>
                    {means.vehicle && <VehicleLabel vehicle={means.vehicle} icon={"truck"} />}
                    {means.trailer && (
                        <VehicleLabel vehicle={means.trailer} icon={"trailer"} ml={2} />
                    )}
                </Flex>
            )}
        </>
    );
};
