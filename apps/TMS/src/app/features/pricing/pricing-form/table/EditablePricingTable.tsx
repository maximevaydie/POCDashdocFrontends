import {Table} from "@dashdoc/web-ui";
import {InvoiceItem} from "dashdoc-utils";
import {FormikErrors, FormikTouched} from "formik";
import React, {FunctionComponent} from "react";

import {
    InvoiceItemSuggestionArguments,
    InvoiceItemSuggestionArgumentsContext,
} from "app/features/pricing/invoices/invoice-item/invoice-item-suggestion";
import {PricingFormData, PricingTableLine, TariffGridLineForm} from "app/services/invoicing";

import {FuelSurchargeCell} from "./cell/FuelSurchargeCell";
import {GasIndexCell} from "./cell/GasIndexCell";
import {PricingCell} from "./cell/PricingCell";
import {TariffGridCell} from "./cell/TariffGridCell";
import {EmptyPricingTable} from "./components/EmptyPricingTable";
import {pricingTableService} from "./pricingTable.service";
import {UpdatePricingTableColumn} from "./types";

type Props = {
    currency: string;
    pricingLines: PricingTableLine[];
    gasIndexValue: string;
    gasIndexInvoiceItem: InvoiceItem | null;
    totalGasIndexPrice: number;
    totalFuelSurchargePrice: number;
    errors: FormikErrors<PricingFormData>;
    touched: FormikTouched<PricingFormData>;
    vatEnabled: boolean;
    displayFuelSurchargeLineTitle: boolean;
    isOwnerOfFuelSurcharge: boolean;
    invoiceItemSuggestionArguments?: InvoiceItemSuggestionArguments;
    hideGasIndexButton?: boolean;
    pricingType?: "agreedPrice" | "invoicedPrice" | "shipperFinalPrice";
    onUpdateTariffGridLine: (gridLine: TariffGridLineForm) => unknown;
    onDeleteTariffGridLine: () => unknown;

    onDeleteFuelSurchargeLine: () => void;

    onUpdateGasIndexInvoiceItem: (invoiceItem: InvoiceItem) => void;
    onUpdateLineInvoiceItem: (
        invoiceItem: InvoiceItem,
        lineIndex: number,
        autoCompleted: boolean
    ) => void;
    onUpdateLineDescription: (
        event: React.ChangeEvent<HTMLInputElement>,
        lineIndex: number
    ) => void;
    onUpdateLineQuantity: (value: number | null, lineIndex: number) => void;
    onUpdateLineUnitPrice: (value: number | null, lineIndex: number) => void;
    onUpdateLineGasIndex: (event: React.ChangeEvent<HTMLInputElement>, lineIndex: number) => void;
    onDeleteLine?: (lineIndex: number) => void;
    onUpdateGasIndexValue: (value: number) => void;
    onDeactivateGasIndex: () => void;
    onCopyFromInvoicedPrice?: () => void;
};

export const EditablePricingTable: FunctionComponent<Props> = ({
    currency,
    pricingLines,
    onDeleteFuelSurchargeLine,
    onDeleteTariffGridLine,
    onUpdateTariffGridLine,
    gasIndexValue,
    gasIndexInvoiceItem,
    totalGasIndexPrice,
    totalFuelSurchargePrice,
    errors,
    touched,
    vatEnabled,
    isOwnerOfFuelSurcharge,
    invoiceItemSuggestionArguments,
    hideGasIndexButton,
    pricingType,
    onUpdateLineInvoiceItem,
    onUpdateLineDescription,
    onUpdateLineQuantity,
    onUpdateLineUnitPrice,
    onUpdateLineGasIndex,
    onDeleteLine,
    onUpdateGasIndexValue,
    onUpdateGasIndexInvoiceItem,
    onDeactivateGasIndex,
    onCopyFromInvoicedPrice,
}) => {
    const priceColumns: {
        width: number;
        name: UpdatePricingTableColumn;
        getLabel: () => JSX.Element;
    }[] = pricingTableService.getEditableColumns(vatEnabled);

    const getRowCellContent = (
        pricingLine: PricingTableLine,
        columnName: UpdatePricingTableColumn,
        rowIndex: number
    ) => {
        if ("isGasIndexLine" in pricingLine) {
            return (
                <GasIndexCell
                    currency={currency}
                    errors={errors}
                    columnName={columnName}
                    totalGasIndexPrice={totalGasIndexPrice}
                    gasIndexValue={gasIndexValue}
                    gasIndexInvoiceItem={gasIndexInvoiceItem}
                    onUpdateGasIndexInvoiceItem={onUpdateGasIndexInvoiceItem}
                    onUpdateGasIndexValue={onUpdateGasIndexValue}
                    onDeactivateGasIndex={onDeactivateGasIndex}
                />
            );
        } else if ("isFuelSurchargeLine" in pricingLine) {
            return (
                <FuelSurchargeCell
                    columnName={columnName}
                    columns={priceColumns}
                    totalFuelSurchargePrice={totalFuelSurchargePrice}
                    fuelSurchargeLine={pricingLine}
                    onDeleteFuelSurchargeLine={onDeleteFuelSurchargeLine}
                    isOwner={isOwnerOfFuelSurcharge}
                />
            );
        } else if ("isTariffGridLine" in pricingLine) {
            const {isTariffGridLine: _isTariffGridLine, ...gridLine} = pricingLine;
            return (
                <TariffGridCell
                    gridLine={gridLine}
                    errors={errors}
                    rowIndex={rowIndex}
                    columnName={columnName}
                    columns={priceColumns}
                    onUpdateTariffGridLine={onUpdateTariffGridLine}
                    onDeleteTariffGridLine={onDeleteTariffGridLine}
                />
            );
        } else {
            return (
                <PricingCell
                    pricingLine={pricingLine}
                    errors={errors}
                    touched={touched}
                    rowIndex={rowIndex}
                    columnName={columnName}
                    onUpdateLineInvoiceItem={onUpdateLineInvoiceItem}
                    onUpdateLineDescription={onUpdateLineDescription}
                    onUpdateLineQuantity={onUpdateLineQuantity}
                    onUpdateLineUnitPrice={onUpdateLineUnitPrice}
                    onUpdateLineGasIndex={onUpdateLineGasIndex}
                    onDeleteLine={onDeleteLine}
                />
            );
        }
    };

    return (
        <InvoiceItemSuggestionArgumentsContext.Provider value={invoiceItemSuggestionArguments}>
            <Table
                overflow="initial"
                columns={priceColumns}
                rows={pricingLines}
                getRowCellContent={getRowCellContent}
                getRowTestId={(_, index) => `pricing-line-${index}`}
                getRowKey={(line, index) => {
                    if ("isGasIndexLine" in line) {
                        return `gas-index-line`;
                    } else if ("isTariffGridLine" in line) {
                        return `grid-line-line`;
                    } else {
                        return `pricing-line-${index}`;
                    }
                }}
                data-testid="update-pricing-table"
                ListEmptyComponent={() => (
                    <EmptyPricingTable
                        hideGasIndex={hideGasIndexButton}
                        onCopyFromInvoicedPrice={onCopyFromInvoicedPrice}
                        pricingType={pricingType}
                    />
                )}
                narrowColumnGaps={true}
            />
        </InvoiceItemSuggestionArgumentsContext.Provider>
    );
};
