import {t} from "@dashdoc/web-core";
import {Box, ClickableAddRegion, ClickableUpdateRegion, Flex, Icon, Text} from "@dashdoc/web-ui";
import {InvoiceableCompany, InvoicingAddress} from "dashdoc-utils";
import React from "react";

interface UpdatableCustomerToInvoiceProps {
    customerToInvoice: InvoiceableCompany | null;
    updateAllowed: boolean;
    onClick?: () => void;
}

export function UpdatableCustomerToInvoice({
    customerToInvoice,
    updateAllowed,
    onClick,
}: UpdatableCustomerToInvoiceProps) {
    const ClickableComponent =
        updateAllowed && !customerToInvoice ? ClickableAddRegion : ClickableUpdateRegion;

    return (
        <ClickableComponent
            clickable={updateAllowed}
            onClick={onClick}
            data-testid="updatable-customer-to-invoice"
        >
            {customerToInvoice ? (
                <>
                    <Text fontWeight="600">{customerToInvoice.name}</Text>
                    {customerToInvoice.invoicing_address ? (
                        <>
                            <Text>{customerToInvoice.invoicing_address.address}</Text>
                            <Text>{getAddressText(customerToInvoice.invoicing_address)}</Text>{" "}
                        </>
                    ) : (
                        <Flex data-testid="customer-to-invoice-invalid-warning">
                            <Icon name="warning" mr={1} color="red.default" />
                            <Text color="red.default">
                                {t("customerToInvoice.notInvoiceable")}
                            </Text>
                        </Flex>
                    )}
                </>
            ) : (
                updateAllowed && (
                    <Box as="span" color="grey.dark">
                        {t("components.addACustomerToInvoice")}
                    </Box>
                )
            )}
        </ClickableComponent>
    );

    function getAddressText(address: InvoicingAddress) {
        return `${address.postcode} ${address.city}, ${address.country}`;
    }
}
