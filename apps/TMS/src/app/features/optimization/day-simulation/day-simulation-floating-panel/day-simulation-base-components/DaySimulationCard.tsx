import {Box} from "@dashdoc/web-ui";
import React, {FunctionComponent, ReactNode} from "react";

interface DaySimulationCardProps {
    children: ReactNode;
}

export const DaySimulationCard: FunctionComponent<DaySimulationCardProps> = ({children}) => {
    return (
        <Box
            backgroundColor="grey.white"
            borderRadius={1}
            border="1px solid"
            borderColor="grey.light"
            mx={3}
        >
            {children}
        </Box>
    );
};
