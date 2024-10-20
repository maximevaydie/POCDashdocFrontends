import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Link, Text} from "@dashdoc/web-ui";
import React from "react";

import {
    BulkSetInvoiceItemError,
    BulkSetInvoiceItemResponse,
} from "app/features/transport/actions/bulk/set-invoice-item-or-pricing/BulkSetInvoiceItemForm";
import {
    BulkSetPricingError,
    BulkSetPricingResponse,
} from "app/features/transport/actions/bulk/set-invoice-item-or-pricing/BulkSetPricingForm";

import {BulkSetInvoiceItemOrPricingModeType} from "./BulkSetInvoiceItemOrPricingModal";

interface BulkSetInvoiceItemOrPricingSummaryProps {
    mode: BulkSetInvoiceItemOrPricingModeType;
    result: BulkSetInvoiceItemResponse["response"] | BulkSetPricingResponse["response"];
}
export const BulkSetInvoiceItemOrPricingSummary = ({
    mode,
    result,
}: BulkSetInvoiceItemOrPricingSummaryProps) => {
    return (
        <>
            <Text variant="h1" color="grey.dark">
                {t("common.processing_completed")}
            </Text>
            <Text variant="h2" mt={5} mb={3}>
                {t("common.processing_summary")}
            </Text>
            <Box backgroundColor="grey.ultralight" p={4}>
                {result.success_count > 0 && (
                    <Flex>
                        <Icon mr={2} name="checkCircle" color="green.dark" alignSelf="center" />
                        <Text>
                            {getBulkSetInvoiceItemOrPricingSuccessCountMessage(
                                result.success_count
                            )}
                        </Text>
                    </Flex>
                )}
                {result.failure_count > 0 && (
                    <Flex my={2} pt={2} borderTop={"1px solid"} borderTopColor="grey.light">
                        <Icon mr={2} name="removeCircle" color="red.dark" alignSelf="center" />
                        <Text>
                            {getBulkSetInvoiceItemOrPricingFailureCountMessage(
                                result.failure_count
                            )}
                        </Text>
                    </Flex>
                )}
                <Box as="ul" pl={2} style={{listStyleType: "'-'"}}>
                    {Object.entries(result.errors).map(([errorCode, transportUids]) => {
                        if (transportUids.length === 0) {
                            return null;
                        }

                        const transportsLinks = transportUids.map(
                            ({uid, sequential_id}, index) => (
                                <>
                                    {index > 0 && ", "}
                                    <Link
                                        target="_blank"
                                        href={`/app/transports/${uid}`}
                                        rel="noopener noreferrer"
                                    >
                                        {sequential_id}
                                    </Link>
                                </>
                            )
                        );

                        return (
                            <Box key={errorCode} as="li" pl={1}>
                                <Text>
                                    {mode === "invoiceItem"
                                        ? getBulkSetInvoiceItemErrorMessage(
                                              errorCode as BulkSetInvoiceItemError,
                                              transportUids.length
                                          )
                                        : getBulkSetPricingErrorMessage(
                                              errorCode as BulkSetPricingError,
                                              transportUids.length
                                          )}
                                </Text>
                                {transportsLinks}
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </>
    );

    function getBulkSetInvoiceItemOrPricingSuccessCountMessage(successCount: number) {
        if (mode === "invoiceItem") {
            return t("bulkAction.setInvoiceItem.transportsWithANewInvoiceItemApplied", {
                smart_count: successCount,
            });
        }

        return t("bulkAction.setPricing.transportsWithNewPriceApplied", {
            smart_count: successCount,
        });
    }

    function getBulkSetInvoiceItemOrPricingFailureCountMessage(failureCount: number) {
        if (mode === "invoiceItem") {
            return t("bulkAction.setInvoiceItem.transportsWhereInvoiceItemCouldNotBeApplied", {
                smart_count: failureCount,
            });
        }

        return t("bulkAction.setPricing.transportsWherePriceWasNotApplied", {
            smart_count: failureCount,
        });
    }

    function getBulkSetInvoiceItemErrorMessage(
        errorCode: BulkSetInvoiceItemError,
        transportCount: number
    ) {
        switch (errorCode) {
            case "transport_without_pricing":
                return t("bulkAction.setInvoiceItem.error.transportsWithoutPricing", {
                    smart_count: transportCount,
                });
            case "transport_invoiced":
                return t("bulkAction.setInvoiceItem.error.transportsInvoiced", {
                    smart_count: transportCount,
                });
            case "transport_not_done":
                return t("bulkAction.setInvoiceItem.error.transportsNotDone", {
                    smart_count: transportCount,
                });
            default:
                return t("bulkAction.setInvoiceItem.error.default", {
                    smart_count: transportCount,
                });
        }
    }

    function getBulkSetPricingErrorMessage(
        errorCode: BulkSetPricingError,
        transportCount: number
    ) {
        switch (errorCode) {
            case "transport_invoiced":
                return t("bulkAction.setPricing.error.transportsInvoiced", {
                    smart_count: transportCount,
                });
            case "transport_not_done":
                return t("bulkAction.setPricing.error.transportsNotDone", {
                    smart_count: transportCount,
                });
            default:
                return t("bulkAction.setPricing.error.default", {
                    smart_count: transportCount,
                });
        }
    }
};
