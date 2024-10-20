import {Box, Card, Flex, Icon, Text} from "@dashdoc/web-ui";
import React, {useState} from "react";

import type {ColorIcon} from "moderation/components/network/NetworkMapMarker";

interface IconRowProps {
    marker: ColorIcon;
    text: string;
    pinColor?: string;
}

const LegendRow = ({marker, text, pinColor}: IconRowProps) => {
    return (
        <Flex
            alignItems="center"
            justifyContent="space-between"
            width="300px"
            position={"relative"}
        >
            <Flex alignItems="center">
                <Flex
                    width="30px"
                    height="30px"
                    fontSize={1}
                    lineHeight={"12px"}
                    borderRadius="50%"
                    border="1px solid"
                    borderColor={marker.color}
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor={marker.backgroundColor}
                    position={"relative"}
                >
                    <Icon name={marker.icon} strokeWidth={1.5} color={marker.color} />
                    <Box
                        position={"absolute"}
                        right={0}
                        top={0}
                        width={"10px"}
                        height={"10px"}
                        backgroundColor={pinColor ? pinColor : "transparent"}
                        borderRadius={"50%"}
                    />
                </Flex>
                <Box p={2}>{text}</Box>
            </Flex>
        </Flex>
    );
};

const LegendContent = () => {
    return (
        <Box p={2}>
            <Box pb={3}>
                <LegendRow
                    marker={{
                        color: "grey.dark",
                        backgroundColor: "grey.white",
                        icon: "truck",
                    }}
                    text={`No data`}
                />
                <LegendRow
                    marker={{
                        color: "grey.ultradark",
                        backgroundColor: "blue.ultralight",
                        icon: "truck",
                    }}
                    text={`0 - 5`}
                />
                <LegendRow
                    marker={{
                        color: "grey.white",
                        backgroundColor: "blue.light",
                        icon: "truck",
                    }}
                    text={`6 - 20`}
                />
                <LegendRow
                    marker={{
                        color: "grey.ultralight",
                        backgroundColor: "blue.default",
                        icon: "truck",
                    }}
                    text={`20 - 50`}
                />
                <LegendRow
                    marker={{
                        color: "grey.ultralight",
                        backgroundColor: "blue.dark",
                        icon: "truck",
                    }}
                    text={`50 - 100`}
                />
                <LegendRow
                    marker={{
                        color: "grey.ultralight",
                        backgroundColor: "blue.dark",
                        icon: "truck",
                    }}
                    text={`100 - 200`}
                />
                <LegendRow
                    marker={{
                        color: "grey.ultralight",
                        backgroundColor: "grey.ultradark",
                        icon: "truck",
                    }}
                    text={`> 200`}
                />
                <LegendRow
                    marker={{
                        color: "grey.default",
                        backgroundColor: "grey.white",
                        icon: "truck",
                    }}
                    text={`Customer`}
                    pinColor={"green.default"}
                />
                <LegendRow
                    marker={{
                        color: "grey.default",
                        backgroundColor: "grey.white",
                        icon: "truck",
                    }}
                    text={`Register`}
                    pinColor={"purple.light"}
                />
                <LegendRow
                    marker={{
                        color: "grey.default",
                        backgroundColor: "grey.white",
                        icon: "truck",
                    }}
                    text={`Active (last 15 days)`}
                    pinColor={"purple.dark"}
                />
            </Box>
        </Box>
    );
};
export const NetworkMapLegend = () => {
    const [isLegendOpen, setLegendOpen] = useState(false);
    return (
        <Box position="relative" zIndex="networkMap">
            <Icon
                name="info"
                style={{
                    cursor: "pointer",
                }}
                width="30px"
                height="30px"
                fontSize={1}
                lineHeight={"12px"}
                borderRadius="50%"
                alignItems="center"
                justifyContent="center"
                backgroundColor={"grey.white"}
                color="grey.dark"
                onClick={() => setLegendOpen(!isLegendOpen)}
            />

            {isLegendOpen && (
                <Card
                    backgroundColor="grey.white"
                    position="absolute"
                    bottom="29px"
                    left={"30px"}
                    zIndex="loadingOverlay"
                >
                    <Text fontWeight="bold" mx={3} mt={2}>
                        {"Legend / Number of trucks"}
                    </Text>
                    <LegendContent />
                </Card>
            )}
        </Box>
    );
};
