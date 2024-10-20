import {SupportedLocale, getLocale, t, translatedCountries} from "@dashdoc/web-core";
import memoize from "lodash.memoize";
import React, {useEffect, useState} from "react";
import {OptionTypeBase} from "react-select";

import {Select, SelectProps} from "./select2/Select";

const getSelectCountryOptionsFromLocale = memoize((locale: SupportedLocale) => {
    const rawCountries = translatedCountries[locale] ?? translatedCountries.en;

    return rawCountries.map((country) => {
        return {value: country.alpha2.toUpperCase(), label: country.name};
    });
});

const getSelectCountryOptions = () => {
    const locale = getLocale() as SupportedLocale;
    return getSelectCountryOptionsFromLocale(locale);
};

const getOptionFromValue = (value: string) => {
    return getSelectCountryOptions().find((option) => option.value === value);
};

export type SelectCountryProps = Omit<SelectProps, "onChange" | "value"> & {
    onChange: (value: string) => void;
    value: string;
};

export function SelectCountry(props: SelectCountryProps) {
    // nosemgrep
    const [option, setOption] = useState<OptionTypeBase>(() => getOptionFromValue(props.value));

    useEffect(() => {
        // @ts-ignore
        setOption(getOptionFromValue(props.value));
    }, [props.value]);

    return (
        <Select
            options={getSelectCountryOptions()}
            placeholder={t("common.country")}
            data-testid="select-country"
            {...props}
            onChange={(newOption: OptionTypeBase | null) => {
                const newValue = newOption?.value ?? "";
                // @ts-ignore
                setOption(getOptionFromValue(newValue));
                props.onChange(newValue);
            }}
            value={option}
        />
    );
}
