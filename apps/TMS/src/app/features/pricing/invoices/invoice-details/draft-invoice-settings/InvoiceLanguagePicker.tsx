import {SupportedLocale, t} from "@dashdoc/web-core";
import {SUPPORTED_LOCALES_OPTIONS} from "@dashdoc/web-core";
import {Box, Select, SelectProps, theme} from "@dashdoc/web-ui";
import React from "react";

const SELECT_OPTIONS = SUPPORTED_LOCALES_OPTIONS.map((option) => ({
    value: option.value as SupportedLocale,
    label: option.label as string,
    testId: `select-option-${option.value}`,
}));

type Props = Partial<SelectProps>;

export function InvoiceLanguagePicker({...selectProps}: Props) {
    return (
        <Box maxWidth={300} mr={3}>
            <Select
                {...selectProps}
                isClearable={false}
                menuPortalTarget={document.body}
                styles={{
                    menuPortal: (base) => ({...base, zIndex: theme.zIndices.topbar}),
                }}
                label={t("invoice.appliedLanguage")}
                options={SELECT_OPTIONS}
                data-testid={"invoice-language-select"}
            />
        </Box>
    );
}

type PropsLegacy = {
    language: SupportedLocale | null;
    onChange: (language: SupportedLocale) => void;
};

// @deprecated This component must be removed with the FF fuelSurchargeInInvoiceFooter
export function InvoiceLanguagePickerLegacy({language, onChange}: PropsLegacy) {
    const selectValue = SELECT_OPTIONS.find((option) => option.value === (language ?? "fr"));

    return (
        <Box minWidth={200} mr={3}>
            <Select
                isClearable={false}
                menuPortalTarget={document.body}
                styles={{
                    menuPortal: (base) => ({...base, zIndex: theme.zIndices.topbar}),
                }}
                label={t("invoice.appliedLanguage")}
                value={selectValue}
                options={SELECT_OPTIONS}
                data-testid={"invoice-language-select"}
                onChange={({value}: {value: SupportedLocale}) => {
                    onChange(value);
                }}
            />
        </Box>
    );
}
