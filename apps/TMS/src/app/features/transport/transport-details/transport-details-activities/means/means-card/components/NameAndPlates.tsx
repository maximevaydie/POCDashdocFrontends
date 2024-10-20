import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import React, {Fragment} from "react";

import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";
import {ActivityMeans} from "app/types/transport";

type Props = {
    displayDetailedMeans: boolean;
    means: ActivityMeans;
};

export function NameAndPlates({displayDetailedMeans, means: {trucker, vehicle, trailers}}: Props) {
    const unspecified = (
        <Text as="i" fontStyle="italic">
            {t("common.unspecified")}
        </Text>
    );

    return (
        <Box maxWidth={570}>
            {displayDetailedMeans && (
                <Flex>
                    <Icon name="trucker" mr={1} />
                    {trucker ? (
                        <Text overflowWrap="break-word" data-testid="trucker-name">
                            {trucker.display_name}
                        </Text>
                    ) : (
                        unspecified
                    )}
                </Flex>
            )}
            <Flex>
                <Icon name="truck" mr={1} />
                {vehicle ? (
                    <VehicleLabel
                        vehicle={{
                            ...vehicle,
                            // @ts-ignore
                            fleet_number: displayDetailedMeans ? vehicle.fleet_number : null,
                        }}
                        data-testid="vehicle-license-plate"
                    />
                ) : (
                    unspecified
                )}
            </Flex>
            <Flex>
                <Icon name="trailer" mr={1} />
                {trailers.length
                    ? trailers.map((trailer, index) => (
                          <Fragment key={trailer.license_plate}>
                              <VehicleLabel
                                  vehicle={{
                                      ...trailer,
                                      // @ts-ignore
                                      fleet_number: displayDetailedMeans
                                          ? trailer.fleet_number
                                          : null,
                                  }}
                                  data-testid="trailer-license-plate"
                              />
                              {trailers.length > 1 && index < trailers.length - 1 ? ", " : ""}
                          </Fragment>
                      ))
                    : unspecified}
            </Flex>
        </Box>
    );
}
