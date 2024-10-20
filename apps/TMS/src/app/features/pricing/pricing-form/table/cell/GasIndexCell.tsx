import {t} from "@dashdoc/web-core";
import {Flex, IconButton, NumberInput, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {InvoiceItem, formatNumber} from "dashdoc-utils";
import {FormikErrors} from "formik";
import React, {FunctionComponent} from "react";

import {InvoiceItemSelector} from "app/features/pricing/invoices/invoice-item/InvoiceItemSelector";
import {PricingFormData} from "app/services/invoicing";

import {ReadOnlyPricingTableColumn, UpdatePricingTableColumn} from "../types";

type GasIndexCellProps = {
    currency: string;
    totalGasIndexPrice: number;
    gasIndexValue: string;
    gasIndexInvoiceItem: InvoiceItem | null;
};

type ReadOnlyGasIndexCellProps = GasIndexCellProps & {
    columnName: ReadOnlyPricingTableColumn;
    readOnly: true;
};
type EditableGasIndexCellProps = GasIndexCellProps & {
    columnName: UpdatePricingTableColumn;
    errors: FormikErrors<PricingFormData>;
    onUpdateGasIndexInvoiceItem: (invoiceItem: InvoiceItem | null) => void;
    onUpdateGasIndexValue: (value: number) => void;
    onDeactivateGasIndex: () => void;
};

export const GasIndexCell: FunctionComponent<
    ReadOnlyGasIndexCellProps | EditableGasIndexCellProps
> = (props) => {
    if ("readOnly" in props) {
        return <ReadOnlyGasIndexCell {...props} />;
    } else {
        return <EditableGasIndexCell {...props} />;
    }
};

/**
 * WARNING!
 * Modify ReadOnly and Editable implementation in the same way.
 */
const ReadOnlyGasIndexCell: FunctionComponent<ReadOnlyGasIndexCellProps> = ({
    currency,
    columnName,
    totalGasIndexPrice,
    gasIndexValue,
    gasIndexInvoiceItem,
}) => {
    switch (columnName) {
        case "invoiceItem":
            return <Text>{gasIndexInvoiceItem?.description}</Text>;
        case "description":
            return <Text>{t("components.gasIndex")}</Text>;
        case "quantity":
            return (
                <Text textAlign="right">
                    {formatNumber(gasIndexValue, {
                        maximumFractionDigits: 2,
                    })}
                </Text>
            );
        case "unit":
            return <Text textAlign="right">{"%"}</Text>;
        case "price":
            return (
                <Text data-testid={`gas-index-price`} textAlign="right">
                    {formatNumber(totalGasIndexPrice, {
                        style: "currency",
                        currency,
                    })}
                </Text>
            );
        case "priceAndVat":
            return (
                <>
                    <Text data-testid={`gas-index-price`} textAlign="right">
                        {formatNumber(totalGasIndexPrice, {
                            style: "currency",
                            currency,
                        })}
                    </Text>
                    <Text data-testid={`gas-index-vat`} textAlign="right" variant="subcaption">
                        {t("components.VAT")}{" "}
                        {formatNumber(
                            parseFloat(gasIndexInvoiceItem?.tax_code?.tax_rate ?? "") / 100,
                            {
                                style: "percent",
                                maximumFractionDigits: 2,
                            }
                        )}
                    </Text>
                </>
            );
        default:
            return null;
    }
};

/**
 * WARNING!
 * Modify ReadOnly and Editable implementation in the same way.
 */
const EditableGasIndexCell: FunctionComponent<EditableGasIndexCellProps> = ({
    currency,
    errors,
    columnName,
    totalGasIndexPrice,
    gasIndexValue,
    gasIndexInvoiceItem,
    onUpdateGasIndexInvoiceItem,
    onUpdateGasIndexValue,
    onDeactivateGasIndex,
}) => {
    switch (columnName) {
        case "invoiceItem":
            return (
                <InvoiceItemSelector
                    data-testid={`gas-index-invoice-item`}
                    onChange={(invoiceItem) => onUpdateGasIndexInvoiceItem(invoiceItem)}
                    selectedInvoiceItem={gasIndexInvoiceItem}
                    shouldAutoFocus={!gasIndexInvoiceItem}
                    errorMessage={errors.gas_index_invoice_item as unknown as string}
                />
            );
        case "description":
            return (
                <Text mt={2} ml={3} variant="caption">
                    {t("components.gasIndex")}
                </Text>
            );
        case "quantity":
            return (
                <NumberInput
                    required
                    data-testid="fuel-surcharge-value"
                    name="gas_index"
                    value={parseFloat(gasIndexValue)}
                    // @ts-ignore
                    onChange={(value) => onUpdateGasIndexValue(value)}
                    // @ts-ignore
                    onTransientChange={(value) => onUpdateGasIndexValue(value)} // Update the UI as the user types
                    placeholder={t("components.gasIndex")}
                    maxDecimals={2}
                    units={"%"}
                    error={errors.gas_index}
                />
            );
        case "price":
            return (
                <Text data-testid={`gas-index-price`} textAlign="right" mt={2}>
                    {formatNumber(totalGasIndexPrice, {
                        style: "currency",
                        currency,
                    })}
                </Text>
            );
        case "priceAndVat":
            return (
                <>
                    <Text data-testid={`gas-index-price`} textAlign="right">
                        {formatNumber(totalGasIndexPrice, {
                            style: "currency",
                            currency,
                        })}
                    </Text>
                    <Flex justifyContent="flex-end">
                        <TooltipWrapper
                            content={
                                gasIndexInvoiceItem?.tax_code?.tax_rate === undefined
                                    ? t("pricing.fillInvoiceItem")
                                    : null
                            }
                        >
                            <Text
                                data-testid={`gas-index-vat`}
                                textAlign="right"
                                variant="subcaption"
                            >
                                {t("components.VAT")}{" "}
                                {formatNumber(
                                    gasIndexInvoiceItem?.tax_code?.tax_rate === undefined
                                        ? undefined
                                        : parseFloat(gasIndexInvoiceItem?.tax_code?.tax_rate) /
                                              100,
                                    {
                                        style: "percent",
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </Text>
                        </TooltipWrapper>
                    </Flex>
                </>
            );
        case "delete":
            return (
                <Flex justifyContent="center">
                    <IconButton
                        type="button"
                        data-testid={`gas-index-delete`}
                        name="bin"
                        fontSize={3}
                        color="grey.dark"
                        onClick={(event) => {
                            event.preventDefault();
                            onDeactivateGasIndex();
                        }}
                    />
                </Flex>
            );
        default:
            return null;
    }
};
