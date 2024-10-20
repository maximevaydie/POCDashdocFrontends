import {Flex, Text, IconNames, Box} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import isSameDay from "date-fns/isSameDay";
import React, {FunctionComponent} from "react";

import {DaySimulationActivityMarker} from "./DaySimulationActivityMarker";

type DaySimulationStartDateProps = {
    startDate: Date | null;
    selectedDate: Date;
    isReal: boolean;
} & ({text: string | number} | {iconName: IconNames});

export const DaySimulationStartDate: FunctionComponent<DaySimulationStartDateProps> = ({
    startDate,
    selectedDate,
    isReal,
    ...props
}) => {
    const color = isReal ? "green" : "blue";
    return (
        <Flex
            borderRight="1px solid"
            borderColor="grey.light"
            p={2}
            alignItems="center"
            flex={1}
            maxWidth="72px"
            minWidth="72px"
            flexDirection="column"
        >
            <Box m={1}>
                <DaySimulationActivityMarker color={color} diameter="24px" {...props} />
            </Box>
            <>
                {startDate !== null && !isSameDay(selectedDate, startDate) && (
                    <Text variant="h2">{formatDate(startDate, "P").substring(0, 5)}</Text>
                )}
                <Text variant="h2">{formatDate(startDate, "HH:mm")}</Text>
            </>
        </Flex>
    );
};
