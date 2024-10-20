import {t} from "@dashdoc/web-core";
import {Box, LoadingWheel, Modal, ModeDescription, ModeTypeSelector, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent, useState} from "react";

import {SelectedTransportsCountCallout} from "app/features/transport/actions/bulk/SelectedTransportsCountCallout";
import {BulkSetInvoiceItemResponse} from "app/features/transport/actions/bulk/set-invoice-item-or-pricing/BulkSetInvoiceItemForm";
import {BulkSetInvoiceItemOrPricingForm} from "app/features/transport/actions/bulk/set-invoice-item-or-pricing/BulkSetInvoiceItemOrPricingForm";
import {BulkSetInvoiceItemOrPricingSummary} from "app/features/transport/actions/bulk/set-invoice-item-or-pricing/BulkSetInvoiceItemOrPricingSummary";
import {BulkSetPricingResponse} from "app/features/transport/actions/bulk/set-invoice-item-or-pricing/BulkSetPricingForm";
import {SearchQuery} from "app/redux/reducers/searches";

type BulkSetInvoiceItemStatus = "pending" | "loading" | "done";

type BulkSetInvoiceItemModalProps = {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    onClose: () => void;
};

export type BulkSetInvoiceItemOrPricingModeType = "invoiceItem" | "pricing";

export const BulkSetInvoiceItemOrPricingModal: FunctionComponent<BulkSetInvoiceItemModalProps> = ({
    selectedTransportsCount,
    selectedTransportsQuery,
    onClose,
}) => {
    const [status, setStatus] = useState<BulkSetInvoiceItemStatus>("pending");
    const [result, setResult] = useState<
        BulkSetInvoiceItemResponse["response"] | BulkSetPricingResponse["response"] | null
    >(null);
    const [mode, setMode] = useState<BulkSetInvoiceItemOrPricingModeType>("invoiceItem");

    const modeList: ModeDescription<BulkSetInvoiceItemOrPricingModeType>[] = [
        {
            value: "invoiceItem",
            label: t("common.invoiceItem"),
            icon: "invoiceItem",
        },
        {
            value: "pricing",
            label: t("common.price"),
            icon: "euro",
        },
    ];

    return (
        <Modal
            size={status === "pending" && mode === "pricing" ? "large" : "medium"}
            title={t("bulkAction.setInvoiceItemOrPricing.title")}
            id="bulk-set-invoice-item-or-pricing-modal"
            onClose={onClose}
            mainButton={
                status === "done"
                    ? {
                          type: "button",
                          onClick: onClose,
                          children: t("common.understood"),
                      }
                    : {
                          form:
                              mode === "invoiceItem"
                                  ? "bulk-set-invoice-item-form"
                                  : "bulk-set-pricing-form",
                          type: "submit",
                          children: t("common.updateAndReplace"),
                          severity: mode === "pricing" ? "warning" : undefined,
                          disabled: status !== "pending",
                      }
            }
            secondaryButton={status !== "done" ? {type: "button", onClick: onClose} : undefined}
        >
            {status === "pending" && (
                <>
                    <SelectedTransportsCountCallout
                        variant={mode === "invoiceItem" ? "secondary" : "warning"}
                        selectedTransportsCount={selectedTransportsCount}
                    />

                    <Text variant="h2" my={4}>
                        {t("bulkAction.setInvoiceItemOrPricing.informationToBeUpdated")}
                    </Text>

                    <ModeTypeSelector<BulkSetInvoiceItemOrPricingModeType>
                        modeList={modeList}
                        currentMode={mode}
                        setCurrentMode={setMode}
                    />

                    <Box mt={4}>
                        <BulkSetInvoiceItemOrPricingForm
                            mode={mode}
                            selectedTransportsQuery={selectedTransportsQuery}
                            setStatus={setStatus}
                            setResult={setResult}
                        />
                    </Box>
                </>
            )}
            {status === "loading" && <LoadingWheel noMargin />}
            {status === "done" && result !== null && (
                <BulkSetInvoiceItemOrPricingSummary mode={mode} result={result} />
            )}
        </Modal>
    );
};
