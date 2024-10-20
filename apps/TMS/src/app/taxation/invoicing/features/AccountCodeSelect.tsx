import {t} from "@dashdoc/web-core";
import {AutoCompleteTextInput} from "@dashdoc/web-ui";
import React, {FC} from "react";

/**
 * Halfway between a select and an input, as you can type whatever you want,
 * but you can also select from a list of options,
 * and it looks and feels like a select.
 */
export const AccountCodeSelect: FC<{
    value: string;
    suggestions: string[];
    onChange: (value: string) => unknown;
    required: boolean;
    "data-testid"?: string;
}> = ({value, suggestions, onChange, required, ...otherProps}) => (
    <AutoCompleteTextInput
        style={{
            height: 58,
        }}
        value={value}
        onChange={onChange}
        suggestions={suggestions.map((code) => ({value: code, label: code}))}
        required={required}
        label={t("invoiceItemCatalog.accountCodeInput")}
        data-testid={otherProps["data-testid"]}
    />
);
