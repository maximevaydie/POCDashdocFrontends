import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, theme} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {InvoiceError} from "app/services/invoicing/invoiceError.service";

import {ErrorMessage} from "../components/ErrorMessage";
import {InvoiceTransportResume} from "../components/InvoiceTransportResume";

import {InvoiceabilityTransport} from "./transports-invoiceability";

type NotInvoiceableTransportCardProps = {
    errorType: InvoiceError;
    transport: InvoiceabilityTransport;
    onShowTransportPreview: () => void;
};

const NotInvoiceableTransportCard: FunctionComponent<NotInvoiceableTransportCardProps> = ({
    errorType,
    transport,
    onShowTransportPreview,
}) => {
    const _getErrorMessage = (errorType: InvoiceError) => {
        if (errorType === "already_invoiced_transport") {
            return t("invoicingFlow.alreadyInvoicedTransport");
        }
        if (errorType === "cannot_invoice_transport_without_price") {
            return t("invoicingFlow.priceMissing");
        }
        if (errorType === "cannot_invoice_transport_with_negative_price") {
            return t("invoicingFlow.negativePrice");
        }
        if (errorType === "cannot_invoice_unverified_transport") {
            return t("invoicingFlow.transportNotVerified");
        }
        if (errorType === "cannot_invoice_transport_without_mandatory_invoice_item") {
            return t("invoicingFlow.invoiceItemMissing");
        }
        if (errorType === "cannot_invoice_transport_without_customer_to_invoice") {
            return t("invoicingFlow.customerToInvoiceMissing");
        }
        if (errorType === "cannot_invoice_transport_with_non_invoiceable_customer_to_invoice") {
            return t("invoicingFlow.customerToInvoiceInvalid");
        }
        if (
            errorType ===
            "cannot_invoice_transport_with_line_unit_price_with_more_than_two_decimal_places"
        ) {
            return t("invoicingFlow.lineUnitPriceWithMoreThanTwoDecimalPlaces");
        }
        return t("common.unknownError");
    };

    const priceError = [
        "cannot_invoice_transport_without_price",
        "cannot_invoice_transport_with_negative_price",
    ].includes(errorType)
        ? _getErrorMessage(errorType)
        : null;
    const customerToInvoiceError = [
        "cannot_invoice_transport_without_customer_to_invoice",
        "cannot_invoice_transport_with_non_invoiceable_customer_to_invoice",
    ].includes(errorType)
        ? _getErrorMessage(errorType)
        : null;
    const transportError =
        priceError || customerToInvoiceError ? null : _getErrorMessage(errorType);

    return (
        <Flex
            borderColor="grey.light"
            borderWidth="1px"
            borderStyle="solid"
            borderRadius={1}
            flexDirection="column"
            mt={2}
            data-testid={`transport-${transport.uid}-errors`}
        >
            <InvoiceTransportResume
                transport={transport}
                priceError={priceError}
                customerToInvoiceError={customerToInvoiceError}
                data-testid={errorType}
                showDetails={false}
            />
            <Box mx={2} mb={1}>
                {transportError && (
                    <ErrorMessage message={transportError} data-testid={errorType} />
                )}
            </Box>

            <Box borderTopColor="grey.light" borderTopWidth="1px" borderTopStyle="solid">
                <Button
                    width="100%"
                    css={{padding: theme.space[2]}}
                    variant="plain"
                    color="default.black"
                    onClick={onShowTransportPreview}
                    data-testid={`open-transport-${transport.uid}`}
                >
                    {t("invoicingFlow.goToTransport")}
                </Button>
            </Box>
        </Flex>
    );
};

export {NotInvoiceableTransportCard};
