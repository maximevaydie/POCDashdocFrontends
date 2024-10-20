import {Badge, Box, Flex, Icon, Text, TooltipWrapper, theme} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    label: string;
    price: string;
    tag?: string;
    tooltip?: React.ReactNode;
    variant?: "default" | "error" | "highlight";
};
export function PriceLabel({price, tag, label, tooltip, variant = "default"}: Props) {
    let color: string = theme.colors.grey.dark;
    if (variant === "error") {
        color = theme.colors.red.default;
    } else if (variant === "highlight") {
        color = theme.colors.blue.default;
    }
    return (
        <>
            {tag && (
                <Flex justifyContent="center">
                    <Flex position="absolute">
                        <Box position="relative" top="-14px">
                            <Badge
                                variant="neutral"
                                border="1px solid"
                                borderColor="grey.light"
                                shape="squared"
                            >
                                {tag}
                            </Badge>
                        </Box>
                    </Flex>
                </Flex>
            )}
            <Flex
                flexDirection="column"
                py={5}
                px={6}
                borderLeft="1px solid"
                borderTop="1px solid"
                borderRight="1px solid"
                borderColor="grey.light"
                minWidth="200px"
                height="100%"
            >
                <Flex justifyContent="center" alignItems="center">
                    <Text
                        color="grey.dark"
                        variant="h1"
                        display="flex"
                        textAlign="center"
                        alignItems="center"
                        mt={1}
                    >
                        {label}
                    </Text>
                    {tooltip && (
                        <TooltipWrapper
                            boxProps={{display: "inline-block"}}
                            content={<Box width="400px">{tooltip}</Box>}
                        >
                            <Icon
                                name="info"
                                scale={1.2}
                                color="grey.dark"
                                ml={2}
                                verticalAlign="middle"
                            />
                        </TooltipWrapper>
                    )}
                </Flex>
                <Flex mt={2} justifyContent="center" alignItems="center">
                    {variant === "error" && (
                        <Icon
                            scale={1.4}
                            name="alert"
                            mr={2}
                            verticalAlign="middle"
                            color={color}
                        />
                    )}
                    <Text
                        variant="title"
                        fontWeight={400}
                        textAlign="center"
                        alignItems="center"
                        color={color}
                        data-testid={`price-label-value-${variant}`}
                    >
                        {price}
                    </Text>
                </Flex>
            </Flex>
        </>
    );
}
