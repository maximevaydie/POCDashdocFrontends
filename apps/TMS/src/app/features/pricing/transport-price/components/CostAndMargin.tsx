import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text, TooltipWrapper, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {formatNumber} from "dashdoc-utils";
import React from "react";

import type {Transport} from "app/types/transport";

export type Props = {
    transport: Transport;
};

export function CostAndMargin({transport}: Props) {
    if (
        transport.split_turnover === null ||
        transport.split_turnover.subcontracting_cost === null ||
        transport.split_turnover.subcontracting_margin === null
    ) {
        return null;
    }

    const cost = Number(transport.split_turnover.subcontracting_cost);
    const margin = Number(transport.split_turnover.subcontracting_margin);

    if (cost === 0) {
        return null;
    }

    const formattedMargin = formatNumber(margin, {
        style: "currency",
        currency: "EUR",
        signDisplay: "exceptZero",
    });

    return (
        <Flex
            mt={2}
            p={3}
            style={{gap: "12px"}}
            alignItems="baseline"
            backgroundColor="yellow.ultralight"
            borderRadius={1}
        >
            <Flex style={{gap: "4px"}} alignItems="baseline">
                <Text color="yellow.dark" variant="caption">
                    {t("chartering.cost")}
                </Text>
                <Text color="yellow.dark" fontWeight="bold" data-testid="subcontracting-cost">
                    {formatNumber(cost, {style: "currency", currency: "EUR"})}
                </Text>
            </Flex>
            <Flex style={{gap: "4px"}} alignItems="baseline">
                <Text color="yellow.dark" variant="caption">
                    {t("common.margin")}
                    {t("common.colon")}
                </Text>
                <MarginValue
                    noMargin={!margin}
                    isPositive={!!margin && margin >= 0}
                    data-testid="subcontracting-margin"
                >
                    {formattedMargin}
                </MarginValue>
            </Flex>
            <TooltipWrapper
                content={
                    margin ? t("chartering.margin.tooltip") : t("chartering.noMargin.tooltip")
                }
                boxProps={{position: "relative"}}
            >
                <Icon name={"info"} color={"yellow.dark"} position="relative" top="3px" />
            </TooltipWrapper>
        </Flex>
    );
}
const MarginValue = styled.span<{noMargin: boolean; isPositive: boolean}>`
    color: ${({noMargin, isPositive}) => {
        if (noMargin) {
            return theme.colors.yellow.dark;
        }
        return isPositive ? theme.colors.green.dark : theme.colors.red.dark;
    }};
    font-weight: bold;
`;
