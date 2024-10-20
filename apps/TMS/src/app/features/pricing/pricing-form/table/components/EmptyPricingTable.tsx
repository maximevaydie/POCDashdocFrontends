import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

import {CopyPricingAction} from "./CopyPricingAction";

type Props = {
    hideGasIndex?: boolean;
    onCopyFromInvoicedPrice?: () => void;
    pricingType?: "agreedPrice" | "invoicedPrice" | "shipperFinalPrice";
};

export function EmptyPricingTable({hideGasIndex, onCopyFromInvoicedPrice, pricingType}: Props) {
    if (pricingType === "shipperFinalPrice") {
        return (
            <Flex maxWidth="80%" mx="auto" my={8} flexDirection="column" style={{gap: "32px"}}>
                <Text variant="h1" color="grey.dark">
                    {t("transportColumns.shipperFinalPrice")}
                </Text>
                <Text color="grey.dark">{t("transportColumns.shipperFinalPrice.help")}</Text>
                {onCopyFromInvoicedPrice && (
                    <Box mx="auto">
                        <CopyPricingAction
                            buttonText={t("pricesModal.copyInvoicedPriceAsFinalPrice")}
                            onCopyPrice={onCopyFromInvoicedPrice}
                        />
                    </Box>
                )}
            </Flex>
        );
    }

    return (
        <Flex
            data-testid={"update-pricing-table-no-lines"}
            alignItems="center"
            justifyContent="center"
            py={3}
            px={7}
        >
            <Icon mr={5} scale={2} name="thickArrowDown" />
            <Text variant="h1" fontWeight={600} color="grey.dark">
                {hideGasIndex
                    ? t("components.updatePricingTableNoLinesWithoutGasIndex")
                    : t("components.updatePricingTableNoLines")}
            </Text>
        </Flex>
    );
}
