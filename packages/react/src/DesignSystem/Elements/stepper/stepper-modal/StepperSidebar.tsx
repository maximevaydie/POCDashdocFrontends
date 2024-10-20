import {Badge, Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

export function StepperSidebar({
    currentStep,
    stepTitles,
}: {
    currentStep: number;
    stepTitles: string[];
}) {
    return (
        <Flex
            flexDirection={"column"}
            alignItems={"left"}
            p={7}
            py={8}
            width={"340px"}
            borderRight={"1px solid"}
            borderRightColor="grey.light"
        >
            {stepTitles.map((stepTitle, index) => (
                <Flex key={stepTitle} flexDirection={"column"} alignItems={"left"}>
                    <Flex alignItems={"center"} minHeight={"50px"}>
                        <Badge
                            minWidth={"40px"}
                            minHeight={"40px"}
                            mr={4}
                            variant={index === currentStep ? "blueDark" : "blue"}
                        >
                            {index < currentStep ? (
                                <Icon name="check" py={2} />
                            ) : (
                                <Flex fontSize={3} alignItems={"center"} pl={"3.5px"}>
                                    <Box>{index + 1}</Box>
                                </Flex>
                            )}
                        </Badge>
                        <Text>{stepTitle}</Text>
                    </Flex>
                    {index !== stepTitles.length - 1 && (
                        <Box
                            height={"30px"}
                            width={"2px"}
                            bg={"blue.ultralight"}
                            my={"3px"}
                            ml={"18px"}
                        />
                    )}
                </Flex>
            ))}
        </Flex>
    );
}
