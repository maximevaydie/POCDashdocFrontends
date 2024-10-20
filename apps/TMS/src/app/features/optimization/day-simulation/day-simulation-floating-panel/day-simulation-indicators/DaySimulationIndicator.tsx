import {Box, Flex, Icon, IconNames} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

interface DaySimulationIndicatorProps {
    iconName: IconNames;
    label: string;
    value: string | null;
    testid: string;
}

export const DaySimulationIndicator: FunctionComponent<DaySimulationIndicatorProps> = ({
    iconName,
    label,
    value,
    testid = "",
}) => {
    return (
        <Box mx={2} flex={1} data-testid={`day-simulation-indicator-${testid}`}>
            <Flex color="grey.dark" mb={1}>
                <Icon name={iconName} mr={1} />
                {label}
            </Flex>
            {value ?? "—"}
        </Box>
    );
};
