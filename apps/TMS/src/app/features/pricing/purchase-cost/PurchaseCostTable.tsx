import {utilsService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, IconButton, NumberInput, Table, Text, TextInput} from "@dashdoc/web-ui";
import {
    PurchaseCostLine,
    PricingMetricKey,
    formatNumber,
    mapMetricToMaxQuantityDecimals,
} from "dashdoc-utils";
import {FormikErrors, FormikProps} from "formik";
import React, {FC} from "react";

import {PurchaseCostFormData} from "app/features/pricing/purchase-cost/PurchaseCostForm";
import {
    getManualOrAutomaticIcon,
    getMetricDisplayUnit,
    getQuantityTooltipContent,
} from "app/services/invoicing";

import type {Transport} from "app/types/transport";

type PurchaseCostTableColumn =
    | "description"
    | "quantity"
    | "unitPrice"
    | "price"
    | "includeInTurnover"
    | "delete";

type ColumnTitleProps = {
    title: string;
    textAlign?: "left" | "center" | "right";
};
const ColumnTitle = ({title, textAlign = "center"}: ColumnTitleProps) => {
    return (
        <Text variant="captionBold" ellipsis textAlign={textAlign} width="100%">
            {title}
        </Text>
    );
};

const getColumns = () => {
    const columns: {
        width: number;
        name: PurchaseCostTableColumn;
        getLabel: () => JSX.Element;
    }[] = [
        {
            width: 150,
            getLabel: () => <ColumnTitle title={t("common.description")} />,
            name: "description",
        },
        {
            width: 100,
            getLabel: () => <ColumnTitle title={t("common.quantity")} />,
            name: "quantity",
        },

        {
            width: 100,
            getLabel: () => <ColumnTitle title={t("pricingMetrics.unitPrice")} />,
            name: "unitPrice",
        },

        {
            width: 70,
            getLabel: () => <ColumnTitle title={t("settings.totalNoVAT")} textAlign="right" />,
            name: "price",
        },

        {
            width: 20,
            getLabel: () => <></>,
            name: "delete",
        },
    ];

    return columns;
};

type PurchaseCostTableProps = {
    formik: FormikProps<PurchaseCostFormData>;
    transport: Transport | null;
};

export const PurchaseCostTable: FC<PurchaseCostTableProps> = ({
    formik,
    transport,
}: PurchaseCostTableProps) => {
    const getRowCellContent = (
        purchaseCostLine: PurchaseCostLine,
        columnName: PurchaseCostTableColumn,
        rowIndex: number
    ) => {
        const price =
            parseFloat(purchaseCostLine.quantity) * parseFloat(purchaseCostLine.unit_price);
        const metricUnit = getMetricDisplayUnit(purchaseCostLine.metric);

        switch (columnName) {
            case "description":
                return (
                    <TextInput
                        data-testid={`purchase-cost-line-${rowIndex}-description`}
                        name={`purchaseCostLines[${rowIndex}].description`}
                        aria-label={purchaseCostLine.description}
                        onChange={(_, event) => {
                            formik.setFieldError(
                                `purchaseCostLines[${rowIndex}].description`,
                                undefined
                            );
                            formik.handleChange(event);
                        }}
                        value={purchaseCostLine.description}
                        error={
                            (
                                formik.errors.purchaseCostLines?.[rowIndex] as
                                    | FormikErrors<PurchaseCostLine>
                                    | undefined
                            )?.description
                        }
                    />
                );
            case "quantity": {
                const isOverridden = purchaseCostLine.quantity_source === "OVERRIDDEN";
                const icon = getManualOrAutomaticIcon(purchaseCostLine.metric, isOverridden);
                return (
                    <Box>
                        <NumberInput
                            placeholder={isOverridden ? t("pricing.automaticQuantity") : ""}
                            leftIcon={icon ?? undefined}
                            leftTooltipContent={getQuantityTooltipContent(
                                purchaseCostLine.metric,
                                isOverridden,
                                transport
                            )}
                            data-testid={`purchase-cost-line-${rowIndex}-quantity`}
                            name={`purchaseCostLines[${rowIndex}].quantity`}
                            value={parseFloat(purchaseCostLine.quantity)}
                            onChange={(value) => {
                                formik.setFieldError(
                                    `purchaseCostLines[${rowIndex}].quantity`,
                                    undefined
                                );
                                formik.setFieldValue(
                                    `purchaseCostLines[${rowIndex}].quantity`,
                                    value,
                                    true
                                );
                                if (
                                    formik.values.purchaseCostLines[rowIndex].quantity_source ===
                                    "AUTO"
                                ) {
                                    formik.setFieldValue(
                                        `purchaseCostLines[${rowIndex}].quantity_source`,
                                        "OVERRIDDEN"
                                    );
                                }
                            }}
                            onTransientChange={(value) =>
                                formik.setFieldValue(
                                    `purchaseCostLines[${rowIndex}].quantity`,
                                    value,
                                    true
                                )
                            } // Update the UI as the user types
                            min={0}
                            maxDecimals={
                                mapMetricToMaxQuantityDecimals[
                                    purchaseCostLine.metric as PricingMetricKey
                                ]
                            }
                            units={metricUnit}
                            error={
                                (
                                    formik.errors.purchaseCostLines?.[rowIndex] as
                                        | FormikErrors<PurchaseCostLine>
                                        | undefined
                                )?.quantity
                            }
                        />
                    </Box>
                );
            }
            case "unitPrice":
                return (
                    <Box>
                        <NumberInput
                            data-testid={`purchase-cost-line-${rowIndex}-unit-price`}
                            name={`purchaseCostLines[${rowIndex}].unit_price`}
                            value={parseFloat(purchaseCostLine.unit_price)}
                            onChange={(value) =>
                                formik.setFieldValue(
                                    `purchaseCostLines[${rowIndex}].unit_price`,
                                    value,
                                    true
                                )
                            }
                            onTransientChange={(value) =>
                                formik.setFieldValue(
                                    `purchaseCostLines[${rowIndex}].unit_price`,
                                    value,
                                    true
                                )
                            } // Update the UI as the user types
                            maxDecimals={3}
                            units={utilsService.getCurrencySymbol(purchaseCostLine.currency)}
                            error={
                                (
                                    formik.errors.purchaseCostLines?.[rowIndex] as
                                        | FormikErrors<PurchaseCostLine>
                                        | undefined
                                )?.unit_price
                            }
                        />
                    </Box>
                );
            case "price":
                return (
                    <Text data-testid={`pricing-line-${rowIndex}-price`} textAlign="right" mt={3}>
                        {formatNumber(price, {
                            style: "currency",
                            currency: "EUR",
                        })}
                    </Text>
                );
            case "delete":
                return (
                    <IconButton
                        mt={1}
                        type="button"
                        data-testid={`pricing-line-${rowIndex}-delete`}
                        name="bin"
                        fontSize={3}
                        color="grey.dark"
                        onClick={(event) => {
                            event.preventDefault();
                            const newLines = formik.values.purchaseCostLines.filter(
                                (_, i: number) => i !== rowIndex
                            );
                            formik.setFieldValue("purchaseCostLines", newLines);
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Table
            columns={getColumns()}
            rows={formik.values.purchaseCostLines}
            getRowCellContent={getRowCellContent}
            getRowTestId={(_, index) => `purchase-cost-line-${index}`}
            getRowKey={(_, index) => `purchase-cost-line-${index}`}
            data-testid="purchase-cost-table"
            ListEmptyComponent={() => (
                <Flex
                    data-testid={"update-purchase-cost-table-no-lines"}
                    alignItems="center"
                    justifyContent="center"
                    py={3}
                    px={7}
                >
                    <Icon mr={5} scale={2} name="thickArrowDown" />
                    <Text variant="h1" fontWeight={600} color="grey.dark">
                        {t("purchaseCosts.defineYourTransportPurchaseCosts")}
                    </Text>
                </Flex>
            )}
        />
    );
};
