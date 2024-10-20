import {t} from "@dashdoc/web-core";
import {Box, ClickableUpdateRegion, Card, Flex, Icon, Text} from "@dashdoc/web-ui";
import {RequestedVehicle, formatNumber} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {carbonFootprintConstants} from "app/services/carbon-footprint/constants.service";

type UpdateRequestedVehicleProps = {
    requested_vehicle: RequestedVehicle | null;
    updateAllowed: boolean;
    onClick: () => void;
};
export const UpdateRequestedVehicle: FunctionComponent<UpdateRequestedVehicleProps> = ({
    requested_vehicle,
    updateAllowed,
    onClick,
}) => {
    return (
        <Card p={3} mt={1} display="inline-block" maxWidth="100%">
            <Box>
                <Text variant="captionBold">{t("components.requestedVehicle")}</Text>
            </Box>
            <ClickableUpdateRegion
                clickable={updateAllowed}
                onClick={onClick}
                data-testid="transport-details-requested-vehicle"
            >
                <RequestedVehicleContent requested_vehicle={requested_vehicle} />
            </ClickableUpdateRegion>
        </Card>
    );
};

const RequestedVehicleContent: FunctionComponent<{
    requested_vehicle: RequestedVehicle | null;
}> = ({requested_vehicle}) => {
    if (!requested_vehicle) {
        return (
            <Text color="grey.dark" pr={10}>
                {t("settings.countVehicles", {smart_count: 0})}
            </Text>
        );
    }

    return (
        <Box maxWidth="450px">
            <Flex pr={10} my={2}>
                <Icon name="truck" mr={2} />
                <Text>{requested_vehicle.label}</Text>
            </Flex>
            <Flex pr={10} my={2}>
                <Icon name="ecologyLeaf" mr={2} />
                <Text>
                    {formatNumber(requested_vehicle.emission_rate, {
                        maximumFractionDigits: carbonFootprintConstants.emissionRateMaxDigits,
                    })}{" "}
                    {t("components.requestedVehicle.emissionRateUnit")}
                </Text>
            </Flex>
            {requested_vehicle.complementary_information && (
                <Flex pr={10} my={2}>
                    <Icon
                        name="commonTextFileInfo"
                        mr={2}
                        mt={1}
                        css={{
                            alignSelf: "flex-start",
                        }}
                    />
                    <Text>{requested_vehicle.complementary_information}</Text>
                </Flex>
            )}
        </Box>
    );
};
