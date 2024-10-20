import {Logger} from "@dashdoc/web-core";
import {InvoiceItem} from "dashdoc-utils";

import {PricingFormData, PricingFormLine, TariffGridLineForm} from "app/services/invoicing";

/** Rounds a number up to the given number of digits */
const roundToNDigits = (number: number, numDigits: number): number => {
    const factor = Math.pow(10, numDigits);
    return Math.round(number * factor) / factor;
};

function computeVat(
    priceWithoutVat: number,
    invoiceItem: InvoiceItem | undefined | null
): number | null {
    const taxRate = invoiceItem?.tax_code?.tax_rate;
    if (taxRate && !isNaN(priceWithoutVat)) {
        const parsedTaxRate = parseFloat(taxRate);
        if (!isNaN(parsedTaxRate)) {
            const result = (priceWithoutVat * parsedTaxRate) / 100;
            if (!isNaN(result)) {
                return result;
            } else {
                Logger.error("Invalid VAT");
            }
        } else {
            Logger.error("Invalid invoiceItem 'tax_code.tax_rate'");
        }
    }
    return null;
}

function computeTotalVat(
    pricingForm: PricingFormData,
    fuelSurchargeOrGazIndexPrice: number,
    invoice_item: InvoiceItem | null
): number | null {
    const priceLinesVat = pricingForm.lines.reduce(
        (totalVat: number | null, priceLine: PricingFormLine) => {
            const linePrice = computeLineGross(priceLine);
            const vatPart = computeVat(linePrice, priceLine.invoice_item);
            if (totalVat !== null && vatPart !== null) {
                return totalVat + vatPart;
            }
            return null;
        },
        0
    );
    let tariffGridVat: null | number = 0;
    if (pricingForm.tariff_grid_line) {
        tariffGridVat = null;
        const tariffGridPrice = computeLineGross(pricingForm.tariff_grid_line);
        tariffGridVat = computeVat(tariffGridPrice, pricingForm.tariff_grid_line.invoice_item);
    }

    const gasIndexVat = fuelSurchargeOrGazIndexPrice
        ? computeVat(fuelSurchargeOrGazIndexPrice, invoice_item)
        : 0;
    if (priceLinesVat === null || tariffGridVat === null || gasIndexVat === null) {
        return null;
    } else {
        return roundToNDigits(priceLinesVat + tariffGridVat + gasIndexVat, 2);
    }
}

function computeGasIndex(line: PricingFormLine | TariffGridLineForm, gas_index: string): number {
    const floatGasIndex = parseFloat(gas_index);
    if (isNaN(floatGasIndex)) {
        Logger.error("Invalid gasIndex");
        return 0;
    }
    const lineGross = computeLineGross(line);
    return lineGross * (floatGasIndex / 100);
}

function computeTotalGazIndexOrFuelSurcharge(pricingForm: PricingFormData, rate: string) {
    let result = 0;
    const linesTotalPrice = pricingForm?.lines
        .filter((priceLine: PricingFormLine) => priceLine.is_gas_indexed)
        .reduce((totalGasIndex: number, priceLine: PricingFormLine) => {
            const gasIndex = computeGasIndex(priceLine, rate);
            return totalGasIndex + gasIndex;
        }, 0);

    result += linesTotalPrice;

    const appliedTariffGrid: TariffGridLineForm | null = pricingForm.tariff_grid_line || null;
    if (appliedTariffGrid !== null && appliedTariffGrid.is_gas_indexed) {
        const gasIndex = computeGasIndex(appliedTariffGrid, rate);
        result += gasIndex;
    }
    return roundToNDigits(result, 2);
}

function computeLineGross(line: PricingFormLine | TariffGridLineForm): number {
    let result = 0;
    if ("tariff_grid_version_uid" in line) {
        if (line.final_price !== null) {
            result = parseFloat(line.final_price);
        }
    } else {
        if (line.quantity !== null) {
            result = parseFloat(line.quantity) * parseFloat(line.unit_price);
        }
    }
    if (!isNaN(result)) {
        return roundToNDigits(result, 2); // 2 digits, this matches the invoice rounding rules
    } else {
        Logger.error("Invalid price without gas index");
        return 0;
    }
}

function computeTotalGross(pricingForm: PricingFormData): number {
    let gridPrice = 0;
    if (pricingForm.tariff_grid_line) {
        gridPrice = computeLineGross(pricingForm.tariff_grid_line);
    }
    const linesPrice = pricingForm.lines.reduce(
        (totalPrice: number, priceLine: PricingFormLine) => {
            const price = computeLineGross(priceLine);
            return price + totalPrice;
        },
        0
    );
    return gridPrice + linesPrice;
}

export interface PricingTotal {
    // free of gas index or VAT
    totalGross: number;
    gasIndex: number;
    fuelSurcharge: number;
    vat: number | null | undefined;
    // vat: undefined -> VAT is disabled
    // vat: null -> some VAT is missing (empty value)
    // vat: number -> VAT has some value
}
function computeTotal(
    pricingForm: PricingFormData,
    gasIndexEnabled: boolean,
    vatEnabled: boolean
): PricingTotal {
    // Total Gross
    const totalGross = computeTotalGross(pricingForm);
    // Total Gas Index
    const gasIndex = gasIndexEnabled
        ? computeTotalGazIndexOrFuelSurcharge(pricingForm, pricingForm.gas_index)
        : 0;
    // Total fuel surcharge
    const fuelSurchargeLineQuantity = pricingForm?.fuel_surcharge_line?.quantity;
    const fuelSurcharge = fuelSurchargeLineQuantity
        ? computeTotalGazIndexOrFuelSurcharge(pricingForm, fuelSurchargeLineQuantity)
        : 0;
    // Vat with gas index or fuel surcharge
    const price = gasIndexEnabled ? gasIndex : fuelSurcharge;
    const invoice_item =
        pricingForm?.gas_index_invoice_item ??
        pricingForm.fuel_surcharge_line?.invoice_item ??
        null;
    let vat = undefined;
    if (vatEnabled) {
        vat = computeTotalVat(pricingForm, price, invoice_item);
    }
    return {
        totalGross,
        gasIndex,
        fuelSurcharge,
        vat,
    };
}

export const pricingFormService = {
    computeTotal,
    computeVat,
};
