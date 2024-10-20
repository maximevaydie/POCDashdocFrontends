import {t} from "@dashdoc/web-core";
import {Badge, Box, Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    title: string;
    used: number | null;
    softLimit?: number | null;
    tooltipContent?: React.ReactNode;
};

export function UsageCard({title, used, softLimit, tooltipContent}: Props) {
    const included =
        used !== null && used !== undefined && softLimit !== null && softLimit !== undefined
            ? Math.min(used, softLimit)
            : null;
    const overage =
        used !== null && used !== undefined && softLimit !== null && softLimit !== undefined
            ? used - softLimit
            : null;

    return (
        <Box
            minWidth={"270px"}
            borderColor="grey.light"
            borderWidth={1}
            borderStyle="solid"
            px={5}
            py={4}
        >
            <Flex mb={1}>
                <Text>{title}</Text>
                {tooltipContent !== undefined && (
                    <TooltipWrapper content={tooltipContent} boxProps={{lineHeight: "30px"}}>
                        <Icon name={"info"} ml={2} />
                    </TooltipWrapper>
                )}
            </Flex>
            <Box py={1}>
                <Text variant="h1">{used}</Text>
            </Box>
            <Flex mt={2} style={{gap: "10px"}}>
                {included !== null && included !== 0 && (
                    <Badge variant="neutral">
                        <Text variant="caption">
                            {t("subscription.countIncluded", {
                                included: included,
                                soft_limit: softLimit,
                            })}
                        </Text>
                    </Badge>
                )}
                {overage !== null && overage > 0 && (
                    <Badge variant="warning">
                        <Text variant="caption">
                            {t("subscription.countOverage", {smart_count: overage})}
                        </Text>
                    </Badge>
                )}
            </Flex>
        </Box>
    );
}
