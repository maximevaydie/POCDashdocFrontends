import {t} from "@dashdoc/web-core";
import {formatNumber} from "dashdoc-utils";

/** Takes a  string of the form "5.5" (as obtained from a backend `DecimalField`)
 * and displays it as a percentage
 * taking into account the current locale.
 *
 * E.g. in french, "5.5" becomes "5,5 %"
 */
export const formatTaxRate = (decimalString: string): string => {
    const ratioValue = parseFloat(decimalString) * 0.01; // e.g. if decimalString = "5.5" then ratioValue = 0.055
    return formatNumber(ratioValue, {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
};

/**Used by the tax code select as well as the invoice item table.
 *
 * Displays the tax rate and the country if it exists, handle special `0% (intra-community)` and `0% (export)` tax codes.
 */
export const formatTaxCode = (taxCode: {
    country: string;
    tax_rate: string;
    dashdoc_id: string;
}): string => {
    if (taxCode.dashdoc_id === "export") {
        return formatTaxRate(taxCode.tax_rate) + " " + t("invoiceItemCatalog.taxCodeExport");
    }
    if (taxCode.dashdoc_id === "intra-community-zero") {
        return (
            formatTaxRate(taxCode.tax_rate) + " " + t("invoiceItemCatalog.taxCodeIntraCommunity")
        );
    }
    if (taxCode.country === "") {
        return formatTaxRate(taxCode.tax_rate);
    }
    return taxCode.country + " - " + formatTaxRate(taxCode.tax_rate);
};
