import {Box, Flex} from "@dashdoc/web-ui";
import React, {FunctionComponent, ReactNode} from "react";

interface Props {
    color: string;
    children: ReactNode;
}

export const DaySimulationLabel: FunctionComponent<Props> = ({color, children}) => {
    return (
        <Flex>
            <Box width="36px" borderRight="1px solid" borderColor="grey.light"></Box>
            <Box borderRadius="50%" backgroundColor="grey.light" alignSelf="center" ml="-6px">
                <Box
                    borderRadius="50%"
                    width="8px"
                    height="8px"
                    backgroundColor={`${color}.default`}
                    m="2px"
                />
            </Box>
            <Flex
                backgroundColor={`${color}.ultralight`}
                borderRadius={1}
                my={3}
                mx={2}
                px={1}
                fontSize={1}
                color={`${color}.dark`}
            >
                {children}
            </Flex>
        </Flex>
    );
};
