import {Box, Flex, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {GenericChart} from "./components/GenericChart";
import {VerticalChart} from "./types";

export const VerticalBarChart: FunctionComponent<VerticalChart> = (props) => {
    const {title, legends, height} = props;
    return (
        <>
            <Flex justifyContent="space-between" mb={4}>
                {typeof title === "string" ? (
                    <Text color="grey.dark" fontWeight="600" ml={2}>
                        {title}
                    </Text>
                ) : (
                    title
                )}
                <Box ml={2}>
                    {legends?.length > 1 && (
                        <>
                            {legends.map((legend, index) => (
                                <Flex key={index} alignItems="baseline">
                                    <Box
                                        mr={2}
                                        backgroundColor={legend.color}
                                        width={10}
                                        height={10}
                                        borderRadius={5}
                                    ></Box>
                                    <Text color="grey.dark" variant="subcaption">
                                        {legend.label}
                                    </Text>
                                </Flex>
                            ))}
                        </>
                    )}
                </Box>
            </Flex>
            <Box height={height ?? 200}>
                <GenericChart {...props} />
            </Box>
        </>
    );
};
