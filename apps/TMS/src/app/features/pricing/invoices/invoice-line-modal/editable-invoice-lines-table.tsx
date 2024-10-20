import {t} from "@dashdoc/web-core";
import {Flex, NumberInput, Table, Text, TextArea} from "@dashdoc/web-ui";
import {InvoiceItem, formatNumber} from "dashdoc-utils";
import {FormikErrors} from "formik";
import React from "react";

import {AddInvoiceLineForm} from "app/services/invoicing";

import {InvoiceItemSelector} from "../invoice-item/InvoiceItemSelector";

type EditableInvoiceLinesTableProps = {
    invoiceLines: AddInvoiceLineForm[];
    shouldItemSelectorAutocomplete: boolean;
    errors: FormikErrors<AddInvoiceLineForm>;
    onUpdateInvoiceItem: (invoiceItem: InvoiceItem | null, autoCompleted: boolean) => void;
    onUpdateDescription: (description: string) => void;
    onUpdateQuantity: (quantity: number) => void;
    onUpdateUnitPrice: (unitPrice: number) => void;
};

type UpdatePricingTableColumn =
    | "invoiceItem"
    | "description"
    | "quantity"
    | "unitPrice"
    | "price"
    | "vat"
    | "delete";

export const EditableInvoiceLinesTable = ({
    invoiceLines,
    errors,
    shouldItemSelectorAutocomplete,
    onUpdateInvoiceItem,
    onUpdateDescription,
    onUpdateQuantity,
    onUpdateUnitPrice,
}: EditableInvoiceLinesTableProps) => {
    const columns = [
        {width: 200, getLabel: () => t("common.invoiceItem"), name: "invoiceItem"},
        {width: 240, getLabel: () => t("common.description"), name: "description"},
        {getLabel: () => t("common.quantity"), name: "quantity"},
        {getLabel: () => t("pricingMetrics.unitPrice"), name: "unitPrice"},
        {getLabel: () => t("settings.totalNoVAT"), name: "price"},
        {width: 70, getLabel: () => t("components.VAT"), name: "vat"},
    ];

    const getRowCellContent = (
        invoiceLine: AddInvoiceLineForm,
        columnName: UpdatePricingTableColumn
    ) => {
        const totalPrice = parseFloat(invoiceLine.quantity) * parseFloat(invoiceLine.unit_price);

        switch (columnName) {
            case "invoiceItem":
                return (
                    <InvoiceItemSelector
                        data-testid={`add-invoice-line-invoice-item`}
                        onChange={onUpdateInvoiceItem}
                        selectedInvoiceItem={invoiceLine.invoice_item}
                        shouldAutoComplete={shouldItemSelectorAutocomplete}
                        errorMessage={errors.invoice_item as unknown as string}
                    />
                );
            case "description":
                return (
                    <TextArea
                        data-testid={`add-invoice-line-description`}
                        onChange={onUpdateDescription}
                        value={invoiceLine.description}
                        error={errors.description}
                        pt={2}
                        lineHeight="16px"
                    />
                );
            case "quantity":
                return (
                    <Flex flexDirection="column">
                        <NumberInput
                            data-testid={`add-invoice-line-quantity`}
                            value={parseFloat(invoiceLine.quantity)}
                            onChange={onUpdateQuantity}
                            onTransientChange={onUpdateQuantity} // Update the UI as the user types
                            min={0}
                            maxDecimals={3}
                            error={!!errors.quantity as unknown as string}
                        />
                        {errors.quantity && (
                            <Text variant="caption" color="red.default">
                                {errors.quantity}
                            </Text>
                        )}
                    </Flex>
                );
            case "unitPrice":
                return (
                    <Flex flexDirection="column">
                        <NumberInput
                            data-testid={`add-invoice-line-unit-price`}
                            value={parseFloat(invoiceLine.unit_price)}
                            onChange={onUpdateUnitPrice}
                            onTransientChange={onUpdateUnitPrice} // Update the UI as the user types
                            maxDecimals={3}
                            units={"€"}
                            error={!!errors.unit_price as unknown as string}
                        />
                        {errors.unit_price && (
                            <Text variant="caption" color="red.default">
                                {errors.unit_price}
                            </Text>
                        )}
                    </Flex>
                );
            case "vat":
                return (
                    <Text data-testid={`add-invoice-line-vat`} textAlign="right" mt={2}>
                        {formatNumber(
                            // @ts-ignore
                            parseFloat(invoiceLine.invoice_item?.tax_code?.tax_rate) / 100,
                            {style: "percent", maximumFractionDigits: 2}
                        )}
                    </Text>
                );
            case "price":
                return (
                    <Text data-testid={`add-invoice-line-price`} textAlign="right" mt={2}>
                        {formatNumber(totalPrice, {
                            style: "currency",
                            currency: "EUR",
                        })}
                    </Text>
                );
            default:
                return null;
        }
    };

    return (
        <Table
            overflow="initial"
            columns={columns}
            rows={invoiceLines}
            getRowCellContent={getRowCellContent}
            data-testid="editable-invoice-lines-table"
        />
    );
};
