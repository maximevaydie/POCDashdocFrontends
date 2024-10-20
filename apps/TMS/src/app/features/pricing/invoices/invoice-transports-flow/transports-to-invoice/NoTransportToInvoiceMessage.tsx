import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text, Button} from "@dashdoc/web-ui";
import React from "react";

export function NoTransportToInvoiceMessage({
    hasFilters,
    onResetFilters,
}: {
    hasFilters: boolean;
    onResetFilters: () => void;
}) {
    return (
        <Flex height="100%" justifyContent="center" alignItems="center" flexDirection="column">
            <Icon color="grey.dark" name="invoicing" scale={[7, 7]} mb={10} />
            <Text textAlign="center" color="grey.dark">
                {t("invoicingFlow.noTransportsToInvoice")}
            </Text>
            {hasFilters && (
                <Button variant="plain" onClick={onResetFilters}>
                    {t("screens.resetFilters")}
                </Button>
            )}
        </Flex>
    );
}
