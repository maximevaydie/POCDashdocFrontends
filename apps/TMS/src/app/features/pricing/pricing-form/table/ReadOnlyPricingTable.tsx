import {Table} from "@dashdoc/web-ui";
import {InvoiceItem} from "dashdoc-utils";
import React from "react";

import {FuelSurchargeCell} from "app/features/pricing/pricing-form/table/cell/FuelSurchargeCell";
import {GasIndexCell} from "app/features/pricing/pricing-form/table/cell/GasIndexCell";
import {PricingCell} from "app/features/pricing/pricing-form/table/cell/PricingCell";
import {TariffGridCell} from "app/features/pricing/pricing-form/table/cell/TariffGridCell";
import {pricingTableService} from "app/features/pricing/pricing-form/table/pricingTable.service";
import {ReadOnlyPricingTableColumn} from "app/features/pricing/pricing-form/table/types";
import {PricingTableLine} from "app/services/invoicing";

type Props = {
    currency: string;
    pricingLines: PricingTableLine[];
    gasIndexValue: string;
    gasIndexInvoiceItem: InvoiceItem | null;
    totalGasIndexPrice: number;
    totalFuelSurchargePrice: number;
    vatEnabled: boolean;
    isOwnerOfFuelSurcharge: boolean;
};

export function ReadOnlyPricingTable({
    currency,
    pricingLines,
    gasIndexValue,
    gasIndexInvoiceItem,
    totalGasIndexPrice,
    totalFuelSurchargePrice,
    vatEnabled,
    isOwnerOfFuelSurcharge,
}: Props) {
    const priceColumns = pricingTableService.getReadOnlyColumns(vatEnabled);

    const getRowCellContent = (
        pricingLine: PricingTableLine,
        columnName: ReadOnlyPricingTableColumn,
        rowIndex: number
    ) => {
        if ("isGasIndexLine" in pricingLine) {
            return (
                <GasIndexCell
                    readOnly
                    currency={currency}
                    columnName={columnName}
                    totalGasIndexPrice={totalGasIndexPrice}
                    gasIndexValue={gasIndexValue}
                    gasIndexInvoiceItem={gasIndexInvoiceItem}
                />
            );
        } else if ("isFuelSurchargeLine" in pricingLine) {
            return (
                <FuelSurchargeCell
                    readOnly
                    columnName={columnName}
                    totalFuelSurchargePrice={totalFuelSurchargePrice}
                    fuelSurchargeLine={pricingLine}
                    isOwner={isOwnerOfFuelSurcharge}
                />
            );
        } else if ("isTariffGridLine" in pricingLine) {
            const {isTariffGridLine: _isTariffGridLine, ...gridLine} = pricingLine;
            return (
                <TariffGridCell
                    readOnly
                    gridLine={gridLine}
                    rowIndex={rowIndex}
                    columnName={columnName}
                    columns={priceColumns}
                />
            );
        } else {
            return (
                <PricingCell
                    readOnly
                    pricingLine={pricingLine}
                    rowIndex={rowIndex}
                    columnName={columnName}
                />
            );
        }
    };

    return (
        <Table
            overflow="initial"
            columns={priceColumns}
            rows={pricingLines}
            getRowCellContent={getRowCellContent}
            data-testid="pricing-table"
        />
    );
}
