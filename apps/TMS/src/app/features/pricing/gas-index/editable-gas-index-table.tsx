import {t} from "@dashdoc/web-core";
import {NumberInput, Table, Text} from "@dashdoc/web-ui";
import {formatNumber, InvoiceItem} from "dashdoc-utils";
import {FormikErrors} from "formik";
import React from "react";

import {InvoiceItemSelector} from "../invoices/invoice-item/InvoiceItemSelector";

type AddOrUpdateGasIndexForm = {
    gasIndexValue: number;
    gasIndexInvoiceItem: InvoiceItem;
};

type EditableGasIndexTableProps = {
    gasIndexValue: number;
    gasIndexInvoiceItem: InvoiceItem;
    errors: FormikErrors<AddOrUpdateGasIndexForm>;
    onUpdateQuantity: (quantity: number) => void;
    onUpdateGasIndexInvoiceItem: (gasIndexInvoiceItem: InvoiceItem | null) => void;
};

type UpdatePricingTableColumn = "invoiceItem" | "description" | "quantity" | "vat";

const EditableGasIndexTable = ({
    gasIndexValue,
    gasIndexInvoiceItem,
    errors,
    onUpdateQuantity,
    onUpdateGasIndexInvoiceItem,
}: EditableGasIndexTableProps) => {
    const columns = [
        {width: 150, getLabel: () => t("common.invoiceItem"), name: "invoiceItem"},
        {width: 150, getLabel: () => t("common.description"), name: "description"},
        {width: 120, getLabel: () => t("common.quantity"), name: "quantity"},
        {width: 70, getLabel: () => t("components.VAT"), name: "vat"},
    ];

    const getRowCellContent = (
        line: AddOrUpdateGasIndexForm,
        columnName: UpdatePricingTableColumn
    ) => {
        switch (columnName) {
            case "invoiceItem":
                return (
                    <InvoiceItemSelector
                        data-testid="gas-index-invoice-item"
                        onChange={(invoiceItem) => onUpdateGasIndexInvoiceItem(invoiceItem)}
                        selectedInvoiceItem={line.gasIndexInvoiceItem}
                        errorMessage={errors.gasIndexInvoiceItem as unknown as string}
                    />
                );
            case "description":
                return <Text mt={2}>{t("components.gasIndex")}</Text>;
            case "quantity":
                return (
                    <NumberInput
                        required
                        data-testid="fuel-surcharge-value"
                        name="gas_index"
                        value={line.gasIndexValue}
                        onChange={onUpdateQuantity}
                        placeholder={t("components.gasIndex")}
                        maxDecimals={2}
                        units={"%"}
                        error={errors.gasIndexValue}
                    />
                );
            case "vat":
                return (
                    <Text data-testid="gas-index-vat" textAlign="right" mt={2}>
                        {formatNumber(
                            // @ts-ignore
                            parseFloat(line.gasIndexInvoiceItem?.tax_code?.tax_rate) / 100,
                            {
                                style: "percent",
                                maximumFractionDigits: 2,
                            }
                        )}
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
            rows={[{gasIndexValue, gasIndexInvoiceItem}]}
            getRowCellContent={getRowCellContent}
            data-testid="editable-gas-index-table"
        />
    );
};

export default EditableGasIndexTable;
