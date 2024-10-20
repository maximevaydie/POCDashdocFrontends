import {t} from "@dashdoc/web-core";
import {Box, ClickableFlex, Flex, IconButton, Text} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React, {ReactNode, useContext} from "react";

import {ExpandContext} from "../contexts/ExpandContext";
import {LineContext} from "../contexts/LineContext";

type LineProps = {
    content: ReactNode;
    grossPrice: number;
    currency: string;
    "data-testid"?: string;
};

type ExpandableLineProps = LineProps & {
    lineId: number;
    children?: ReactNode; // expanded content
};

export const Line = ({
    content,
    grossPrice,
    currency,
    ...props
}: LineProps | ExpandableLineProps) => {
    const {lineExpanded} = useContext(LineContext);
    const {onClickOnLine} = useContext(ExpandContext);

    const testid = props["data-testid"] ?? "line";
    const price = formatNumber(grossPrice, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    });

    if ("children" in props) {
        return (
            <>
                <ClickableFlex
                    hoverStyle={{bg: "grey.ultralight"}}
                    py={2}
                    alignItems="center"
                    justifyContent="space-between"
                    data-testid={testid}
                    style={{cursor: "pointer"}}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClickOnLine(props.lineId);
                    }}
                >
                    <IconButton
                        data-testid={lineExpanded ? testid + "-fold" : testid + "-expand"}
                        name={lineExpanded ? "arrowDown" : "arrowRight"}
                    />
                    <Flex flex={1}>{content}</Flex>
                    <Flex alignItems="center" justifyContent="space-between" mx={4}>
                        <Text
                            variant="h1"
                            color="grey.ultradark"
                            fontWeight="bold"
                            textAlign="right"
                            flexGrow={1}
                            data-testid="line-price"
                        >
                            {t("common.priceWithoutTaxes", {price})}
                        </Text>
                    </Flex>
                </ClickableFlex>
                {lineExpanded && (
                    <Box
                        border="1px solid transparent"
                        borderLeftColor="grey.ultralight"
                        borderRightColor="grey.ultralight"
                    >
                        {props.children}
                    </Box>
                )}
            </>
        );
    } else {
        return (
            <Flex py={2} alignItems="center" justifyContent="space-between" data-testid={testid}>
                <Flex pl={5} flex={1}>
                    {content}
                </Flex>
                <Flex alignItems="center" justifyContent="space-between" width="auto" mx={4}>
                    <Text
                        variant="h1"
                        color="grey.ultradark"
                        fontWeight="bold"
                        textAlign="right"
                        flexGrow={1}
                        data-testid="line-price"
                    >
                        {t("common.priceWithoutTaxes", {price})}
                    </Text>
                </Flex>
            </Flex>
        );
    }
};
