import {t} from "@dashdoc/web-core";
import {Select} from "@dashdoc/web-ui";
import React, {FC} from "react";

import {formatTaxCode} from "../services/formatTaxRate";
import {TaxCodeForCatalog} from "../types/invoiceItemCatalogTypes";

/**
 * Select Tax from a list of options.
 */
export const TaxCodeSelect: FC<{
    value: TaxCodeForCatalog | null;
    options: TaxCodeForCatalog[];
    onChange: (value: TaxCodeForCatalog | null) => unknown;
    required: boolean;
    "data-testid"?: string;
}> = ({value, options, onChange, required, ...otherProps}) => (
    <Select<{value: number; label: string; testId?: string}>
        required={required}
        data-testid={otherProps["data-testid"]}
        label={t("invoiceItemCatalog.taxCodeInput")}
        styles={{
            menuList: ({...provided}) => ({
                ...provided,
                maxHeight: 200,
            }),
            valueContainer: ({...provided}) => ({
                ...provided,
                height: 58,
            }),
            singleValue: ({...provided}) => ({
                ...provided,
                top: "50%",
            }),
        }}
        options={options.map((taxCode) => {
            return {
                value: taxCode.id,
                label: formatTaxCode(taxCode),
                testId: `tax-code-select-option-${taxCode.dashdoc_id}`,
            };
        })}
        value={value === null ? null : {value: value.id, label: formatTaxCode(value)}}
        onChange={(poorlyTypedOption) => {
            const option = poorlyTypedOption as null | {value: number}; // I don't know why typescript fails at this, but this is a correct type
            if (option === null) {
                onChange(null);
                return;
            }
            const taxCode = options.find((taxCode) => taxCode.id === option.value) ?? null;
            onChange(taxCode);
        }}
    />
);
