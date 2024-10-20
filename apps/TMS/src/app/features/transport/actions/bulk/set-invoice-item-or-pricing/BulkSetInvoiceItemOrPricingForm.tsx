import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, IconNames, Text} from "@dashdoc/web-ui";
import React, {useMemo} from "react";

import {
    BulkSetPricingForm,
    BulkSetPricingResponse,
} from "app/features/transport/actions/bulk/set-invoice-item-or-pricing/BulkSetPricingForm";
import {SearchQuery} from "app/redux/reducers/searches";

import {BulkSetInvoiceItemForm, BulkSetInvoiceItemResponse} from "./BulkSetInvoiceItemForm";
import {BulkSetInvoiceItemOrPricingModeType} from "./BulkSetInvoiceItemOrPricingModal";

type BulkSetInvoiceItemOrPricingWarning = {
    iconName: IconNames;
    iconColor: string;
    message: string;
};

interface BulkSetInvoiceItemOrPricingFormProps {
    mode: BulkSetInvoiceItemOrPricingModeType;
    selectedTransportsQuery: SearchQuery;
    setStatus: (status: "pending" | "loading" | "done") => unknown;
    setResult: (
        result: BulkSetInvoiceItemResponse["response"] | BulkSetPricingResponse["response"] | null
    ) => unknown;
}

export const BulkSetInvoiceItemOrPricingForm = ({
    mode,
    selectedTransportsQuery,
    setStatus,
    setResult,
}: BulkSetInvoiceItemOrPricingFormProps) => {
    const warnings = useMemo<BulkSetInvoiceItemOrPricingWarning[]>(() => {
        const warningsPerMode: {
            [key in BulkSetInvoiceItemOrPricingModeType]: BulkSetInvoiceItemOrPricingWarning[];
        } = {
            pricing: [
                {
                    iconName: "checkCircle",
                    iconColor: "green.default",
                    message: t(
                        "bulkAction.setPricing.priceWillBeAppliedOnAllTransportsWithoutPrice"
                    ),
                },
                {
                    iconName: "checkCircle",
                    iconColor: "green.default",
                    message: t("bulkAction.setPricing.replaceAllExistingPricingLines"),
                },
                {
                    iconName: "removeCircle",
                    iconColor: "red.default",
                    message: t("bulkAction.setPricing.doNotReplaceFuelSurcharges"),
                },
            ],
            invoiceItem: [
                {
                    iconName: "checkCircle",
                    iconColor: "green.default",
                    message: t(
                        "bulkAction.setInvoiceItem.willReplaceCurrentInvoiceItemInAllPriceLines"
                    ),
                },
                {
                    iconName: "removeCircle",
                    iconColor: "red.default",
                    message: t("bulkAction.setInvoiceItem.willNotApplyToFuelSurcharges"),
                },
            ],
        };

        return warningsPerMode[mode];
    }, [mode]);

    return (
        <>
            {/* Form */}
            {mode === "invoiceItem" ? (
                <BulkSetInvoiceItemForm
                    selectedTransportsQuery={selectedTransportsQuery}
                    setStatus={setStatus}
                    setResult={setResult}
                />
            ) : (
                <BulkSetPricingForm
                    selectedTransportsQuery={selectedTransportsQuery}
                    setStatus={setStatus}
                    setResult={setResult}
                />
            )}

            {/* Warnings */}
            <Box mt={4} pt={4} borderTop={"1px solid"} borderTopColor="grey.light">
                <Text>{t("bulkAction.setInvoiceItemOrPricing.byValidatingThisAction")}</Text>
                {warnings.map((warning, index) => (
                    <Flex key={`${mode}-${index}`} alignItems="baseline" mt={2}>
                        <Icon name={warning.iconName} color={warning.iconColor} mr={2} />
                        <Text>{warning.message}</Text>
                    </Flex>
                ))}
            </Box>
        </>
    );
};
