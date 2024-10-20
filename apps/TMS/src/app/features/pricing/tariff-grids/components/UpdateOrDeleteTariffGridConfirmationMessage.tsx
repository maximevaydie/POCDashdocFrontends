import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

interface Props {
    isPurchaseTariffGrid: boolean;
}

/**
 * This component is meant to display the content of the confirmation message.
 *
 * This component is used when:
 * - updating a tariff grid
 * - updating a version
 * - deleting a version
 */
export function UpdateOrDeleteTariffGridConfirmationMessage({isPurchaseTariffGrid}: Props) {
    return (
        <>
            <Text>
                {t(
                    isPurchaseTariffGrid
                        ? "tariffGrids.transportsMayBeImpacted"
                        : "tariffGrids.nonInvoicedTransportsMayBeImpacted"
                )}
            </Text>
            <Text mt={4}>{t("tariffGrids.gridStillApplicable")}</Text>
            <Flex mt={3}>
                <Icon color="yellow.default" name="alert" mr={1} />
                <Text>
                    {t(
                        isPurchaseTariffGrid
                            ? "tariffGrids.shipperPricesWillBeUpdated"
                            : "tariffGrids.pricesWillBeUpdated"
                    )}
                </Text>
            </Flex>
            <Box mt={3} borderTop="1px solid" borderTopColor="grey.light" pt={3}>
                <Flex>
                    <Text mr={2}>{t("tariffGrids.noLongerApplicable")}</Text>
                    <TooltipWrapper content={t("tariffGrids.gridNoLongerApplicableTooltip")}>
                        <Icon name="info" color="grey.dark" />
                    </TooltipWrapper>
                </Flex>
                <Flex mt={3}>
                    <Icon color="red.dark" name="removeCircle" mr={1} />
                    <Text>
                        {t(
                            isPurchaseTariffGrid
                                ? "tariffGrids.shipperAppliedPricesWillBeUpdated"
                                : "tariffGrids.appliedPricesWillBeRemoved"
                        )}
                    </Text>
                </Flex>
            </Box>
        </>
    );
}
