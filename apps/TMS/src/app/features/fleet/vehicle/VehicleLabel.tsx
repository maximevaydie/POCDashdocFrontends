import {Flex, Icon, BoxProps, Text, TextProps} from "@dashdoc/web-ui";
import {Trailer, Vehicle} from "dashdoc-utils";
import React from "react";

import IDTFBadge from "../IDTFBadge";

type VehicleLabelProps = {
    vehicle: Partial<Trailer | Vehicle>;
    color?: string;
    fontSize?: TextProps["fontSize"];
    icon?: "trailer" | "truck";
    testId?: string;
} & BoxProps &
    TextProps;

const VehicleLabel = ({vehicle, color, fontSize, icon, testId, ...props}: VehicleLabelProps) => {
    return (
        <Flex {...props}>
            {icon ? <Icon name={icon} mr={1} color={color ?? "inherit"} /> : null}
            <Text
                mr={1}
                style={{lineHeight: "inherit"}}
                color={color ?? "inherit"}
                fontSize={fontSize}
                variant="subcaption"
                display="inline-block"
                overflow="hidden"
                textOverflow="ellipsis"
                data-testid={testId}
            >
                {vehicle.license_plate}
            </Text>
            {vehicle.fleet_number && (
                <Text
                    mr={1}
                    style={{lineHeight: "inherit"}}
                    color={color ?? "inherit"}
                    fontSize={fontSize}
                    variant="subcaption"
                    fontStyle="italic"
                    display="inline-block"
                    overflow="hidden"
                    textOverflow="ellipsis"
                >
                    {"(" + vehicle.fleet_number + ")"}
                </Text>
            )}
            {vehicle.used_for_qualimat_transports && <IDTFBadge size="small" ml={1} />}
        </Flex>
    );
};
export {VehicleLabel};
