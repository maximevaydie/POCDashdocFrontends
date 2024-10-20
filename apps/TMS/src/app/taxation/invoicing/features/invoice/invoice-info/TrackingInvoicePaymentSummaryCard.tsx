import {t} from "@dashdoc/web-core";
import {Box, Card, ClickableUpdateRegion, Flex, HorizontalLine, Text} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import React from "react";

import {Invoice} from "app/taxation/invoicing/types/invoice.types";

type Props = {
    invoice: Invoice;
    onClickUpdate: () => void;
};
export function TrackingInvoicePaymentSummaryCard({invoice, onClickUpdate}: Props) {
    if (invoice.status !== "paid" || invoice.is_dashdoc === false) {
        return null;
    }

    return (
        <Card mt={4}>
            <ClickableUpdateRegion
                clickable
                onClick={onClickUpdate}
                data-testid="tracking-invoice-payment-updatable-region"
            >
                <Box p={4}>
                    <Text variant="h1" color="grey.dark">
                        {t("invoice.paymentInformation")}
                    </Text>
                    <Flex alignItems={"baseline"} mt={3}>
                        <Text variant="caption" color="grey.dark">
                            {t("invoice.paidAt")}
                        </Text>
                        <Text variant="body" mx={1} data-testid="tracking-invoice-payment-paid-at">
                            {invoice.paid_at ? formatDate(invoice.paid_at, "P") : "—"}
                        </Text>
                        <Text variant="caption" color="grey.dark">
                            {t("common.per")}
                        </Text>{" "}
                        <Text
                            variant="body"
                            ml={1}
                            color="grey.ultradark"
                            data-testid="tracking-invoice-payment-payment-method"
                        >
                            {invoice.payment_method ? invoice.payment_method.name : "—"}
                        </Text>
                    </Flex>
                    <HorizontalLine my={4} />
                    <Text variant="caption" color="grey.dark">
                        {t("invoice.paymentNotes")}
                    </Text>
                    <Text
                        variant="body"
                        mt={3}
                        data-testid="tracking-invoice-payment-payment-notes"
                    >
                        {invoice.payment_notes || t("invoice.noPaymentNotes")}
                    </Text>
                </Box>
            </ClickableUpdateRegion>
        </Card>
    );
}
