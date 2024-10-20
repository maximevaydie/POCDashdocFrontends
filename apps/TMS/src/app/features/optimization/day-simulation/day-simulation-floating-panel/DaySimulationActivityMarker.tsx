import {Flex, Text, IconNames, Icon} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

type Props = {
    color: string;
    diameter: string;
    withBorder?: boolean;
} & ({text: string | number} | {iconName: IconNames});

export const DaySimulationActivityMarker: FunctionComponent<Props> = ({
    color,
    diameter,
    withBorder = false,
    ...props
}) => {
    return (
        <Flex
            borderRadius="50%"
            width={diameter}
            height={diameter}
            backgroundColor={`${color}.ultralight`}
            justifyContent="center"
            alignItems="center"
            border={withBorder ? "2px solid" : null}
            borderColor={`${color}.default`}
        >
            {"text" in props ? (
                <Text variant="h2" color={`${color}.dark`}>
                    {props.text}
                </Text>
            ) : (
                <Icon name={props.iconName} color={`${color}.dark`} size="12px" />
            )}
        </Flex>
    );
};
