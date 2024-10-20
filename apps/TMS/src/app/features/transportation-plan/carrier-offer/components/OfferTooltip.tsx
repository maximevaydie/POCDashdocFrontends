import {t} from "@dashdoc/web-core";
import {Badge, Box, Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {PricingDetails} from "../../types";

export const PricingDetailTooltipContent: FunctionComponent<PricingDetails & {title: string}> = ({
    title,
    rows,
    value,
}) => {
    return (
        <Box>
            <Text variant="h1" mb={1}>
                {title}
            </Text>
            {rows.map(({label, subValue}, index) => (
                <Flex alignItems="center" key={`row-${index}`}>
                    <Text variant="caption">{label}</Text>
                    <Box flexGrow={1}>
                        <Box
                            flexGrow={1}
                            minWidth="30px"
                            borderBottom="1px dashed"
                            borderColor="grey.light"
                            ml={2}
                            mr={2}
                        ></Box>
                    </Box>
                    <Text flex-basis="25%" alignSelf="flex-end" variant="caption">
                        {subValue}
                    </Text>
                </Flex>
            ))}
            <Flex
                justifyContent={"flex-end"}
                borderTop="1px solid"
                borderColor="grey.light"
                mt={3}
                pt={3}
            >
                <Badge shape="squared">
                    <Text variant="h1" flexGrow={1} color="blue.dark">
                        {value}
                    </Text>
                </Badge>
            </Flex>
        </Box>
    );
};

export type OfferTooltipProps = PricingDetails;
export const OfferTooltip: FunctionComponent<OfferTooltipProps> = (props) => {
    const {rows, value, ...tooltipProps} = props;
    return (
        <TooltipWrapper
            content={
                <PricingDetailTooltipContent
                    title={t("common.pricingDetails")}
                    rows={rows}
                    value={value}
                />
            }
            placement="top"
            {...tooltipProps}
        >
            <Icon name="info" />
        </TooltipWrapper>
    );
};
