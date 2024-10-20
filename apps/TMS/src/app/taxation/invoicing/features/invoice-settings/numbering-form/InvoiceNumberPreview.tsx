import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import React from "react";

import {
    previewFirstInvoiceCounter,
    previewInvoicePrefix,
} from "app/taxation/invoicing/services/previewFirstDashdocInvoiceNumber";
import {InvoiceNumberingPostData} from "app/taxation/invoicing/types/invoiceSettingsTypes";

export function InvoiceNumberPreview({
    numberingData,
    currentMode,
    focusedComponent,
}: {
    numberingData: {
        prefix_template: string;
        reset_period: "never" | "year" | "month";
        last_invoice_number_outside_dashdoc: number | null;
        last_invoice_date_outside_dashdoc: string | null;
    };
    currentMode?: string;
    focusedComponent: string | null;
}) {
    const boxProps = {
        borderRadius: "4px",
        backgroundColor: "white",
        py: 1,
        minHeight: "46px",
    };

    const selectedBoxProps = {
        color: "blue.dark",
        backgroundColor: "blue.ultralight",
    };

    const display = currentMode === "continue-numbering" ? "block" : "none";

    return (
        <Flex
            flexDirection={"column"}
            alignItems={"flex-start"}
            borderRadius="3px"
            backgroundColor="grey.ultralight"
            border={"1px solid"}
            borderColor="grey.light"
            width={"100%"}
            p={3}
        >
            <Box>
                <Text variant="h2" mb={2}>
                    {t("invoiceNumberingSettings.formatPreview")}
                </Text>
                {/* PREVIEW OF THE LAST INVOICE NUMBER */}
                <Box display={display}>
                    <Text color="grey.dark" mb={1}>
                        {t("invoiceNumberingSettings.lastInvoiceNumberOutsideDashdoc")}
                    </Text>
                    <Flex flexDirection={"row"} mb={4}>
                        <Box
                            {...boxProps}
                            {...(focusedComponent === "prefix-last-invoice"
                                ? selectedBoxProps
                                : {})}
                            minWidth={"25px"}
                            pl={2}
                        >
                            <Text
                                color={
                                    focusedComponent === "prefix-last-invoice"
                                        ? "blue.dark"
                                        : "grey.dark"
                                }
                                variant="title"
                                fontSize={4}
                            >
                                {currentMode === "continue-numbering"
                                    ? previewInvoicePrefix(
                                          numberingData.prefix_template,
                                          numberingData.last_invoice_date_outside_dashdoc
                                              ? new Date(
                                                    numberingData.last_invoice_date_outside_dashdoc
                                                )
                                              : new Date()
                                      )
                                    : null}
                            </Text>
                        </Box>
                        <Box
                            {...boxProps}
                            {...(focusedComponent === "number-last-invoice"
                                ? selectedBoxProps
                                : {})}
                            minWidth={"25px"}
                            pr={2}
                        >
                            <Text
                                color={
                                    focusedComponent === "number-last-invoice"
                                        ? "blue.dark"
                                        : "grey.dark"
                                }
                                variant="title"
                                fontSize={4}
                            >
                                {numberingData.last_invoice_number_outside_dashdoc}
                            </Text>
                        </Box>
                    </Flex>
                    <Box borderTop={"1px solid"} borderColor="grey.light" pt={2} />
                </Box>
                {/* PREVIEW OF THE NEXT INVOICE NUMBER */}
                <Text color="grey.dark" mb={1}>
                    {currentMode === "continue-numbering"
                        ? t("invoiceNumberingSettings.nextInvoiceNumberWithDashdoc")
                        : t("invoiceNumberingSettings.nextInvoiceNumber")}
                </Text>
                <Flex flexDirection={"row"}>
                    <Box
                        {...boxProps}
                        {...(focusedComponent === "prefix-next-invoice" ? selectedBoxProps : {})}
                        minWidth={"25px"}
                        pl={2}
                    >
                        <Text
                            color={
                                focusedComponent === "prefix-next-invoice"
                                    ? "blue.dark"
                                    : "grey.dark"
                            }
                            variant="title"
                            fontSize={4}
                        >
                            {previewInvoicePrefix(numberingData.prefix_template, new Date())}
                        </Text>
                    </Box>
                    <Box
                        {...boxProps}
                        {...(focusedComponent === "number-next-invoice" ? selectedBoxProps : {})}
                        minWidth={"25px"}
                        pr={2}
                    >
                        <Text
                            color={
                                focusedComponent === "number-next-invoice"
                                    ? "blue.dark"
                                    : "grey.dark"
                            }
                            variant="title"
                            fontSize={4}
                        >
                            {numberingData.last_invoice_number_outside_dashdoc !== null
                                ? previewFirstInvoiceCounter(
                                      numberingData as InvoiceNumberingPostData,
                                      new Date()
                                  )
                                : null}
                        </Text>
                    </Box>
                </Flex>
            </Box>
        </Flex>
    );
}
