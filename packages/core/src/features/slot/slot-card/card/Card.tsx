import {Box, ClickableBox, Flex, Text} from "@dashdoc/web-ui";
import React from "react";

export type Props = {
    start: string;
    end?: React.ReactNode;
    topText: string;
    additionalTopTexts: string[];
    bottomText: string;
    rightComponent: React.ReactNode;
    backgroundColor?: string;
    width?: string;
    overload?: boolean;
    onClick?: () => void;
    ["data-testid"]?: string;
};

export function Card({
    start,
    end,
    topText,
    additionalTopTexts,
    bottomText,
    rightComponent,
    backgroundColor,
    width,
    overload,
    onClick,
    ...props
}: Props) {
    return (
        <ClickableBox
            backgroundColor={backgroundColor ?? "grey.white"}
            borderRadius={1}
            borderLeft={"2px solid"}
            borderLeftColor={overload ? "red.default" : "transparent"}
            hoverStyle={{backgroundColor: "grey.ultralight"}}
            width={width}
            boxShadow="small"
            onClick={onClick}
            data-testid={props["data-testid"] ?? "slot-card"}
        >
            <Box style={{display: "grid", gridTemplateColumns: "min-content 1fr"}}>
                <Flex
                    flexDirection="column"
                    p={2}
                    borderRight="1px solid"
                    borderColor="grey.light"
                    alignItems="flex-end"
                    justifyContent="space-around"
                    width={50}
                    minHeight={50}
                >
                    <Text variant="caption" textAlign="center" width="100%">
                        {start}
                    </Text>
                    {end !== undefined && (
                        <Text
                            variant="caption"
                            color="grey.ultradark"
                            textAlign="center"
                            mt={1}
                            width="100%"
                        >
                            {end}
                        </Text>
                    )}
                </Flex>
                <Flex flexDirection="column" justifyContent="center">
                    <Flex>
                        <Flex
                            flexDirection="column"
                            flex={2}
                            alignItems="flex-start"
                            py={2}
                            pl={2}
                        >
                            {topText && (
                                <Text
                                    textAlign="left"
                                    variant="h2"
                                    color="grey.ultradark"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                    width="100%"
                                    data-testid="slot-card-top-text"
                                >
                                    {topText}&nbsp;
                                </Text>
                            )}
                            <Box data-testid="slot-card-additional-top-text" width="100%">
                                {additionalTopTexts.map((additionalTopText, index) => (
                                    <Text
                                        key={additionalTopText + index}
                                        variant="captionBold"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        whiteSpace="nowrap"
                                        width="100%"
                                    >
                                        {additionalTopText}
                                    </Text>
                                ))}
                            </Box>
                            <Text
                                textAlign="left"
                                color="grey.dark"
                                lineHeight="20px"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                                width="100%"
                                data-testid="slot-card-bottom-text"
                            >
                                {bottomText}&nbsp;
                            </Text>
                        </Flex>
                        {rightComponent && (
                            <Flex alignItems="center" justifyContent="flex-end" flex={1} pr={2}>
                                {rightComponent}
                            </Flex>
                        )}
                    </Flex>
                </Flex>
            </Box>
        </ClickableBox>
    );
}
