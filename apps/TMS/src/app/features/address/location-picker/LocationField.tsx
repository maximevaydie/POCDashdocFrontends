import {HereSuggestField, HereSuggestion} from "@dashdoc/web-common";
import {Place, t} from "@dashdoc/web-core";
import uniqBy from "lodash.uniqby";
import React, {FunctionComponent, useEffect, useState} from "react";

import {LocationTypeValue} from "./types";

const NUMBER_OF_SUGGESTIONS = 5;

export type LocationFieldProps = {
    locationType: LocationTypeValue;
    onChange: (value: string, countryCode: string) => void;
};
export const LocationField: FunctionComponent<LocationFieldProps> = ({locationType, onChange}) => {
    const [value, setValue] = useState<string>("");
    useEffect(() => {
        setValue("");
    }, [locationType]);

    let suggestionFilter = citySuggestionFilter;
    let idProvider = cityIdProvider;
    let labelProvider = cityLabelProvider;
    let valueProvider;
    let label = t("common.city");
    let name = locationType;
    switch (locationType) {
        case "county":
            suggestionFilter = countySuggestionFilter;
            labelProvider = countyLabelProvider;
            idProvider = countyIdProvider;
            label = t("common.countyNumber");
            name = "postcode";
            valueProvider = (value: string) => {
                if (/^[0-9]{2}$/.test(value)) {
                    // auto-complete postal code to search county, this part should be reviewed to handle all countries patterns
                    return `${value}000`;
                } else {
                    return value;
                }
            };
            break;
        case "postcode":
            suggestionFilter = postalCodeSuggestionFilter;
            idProvider = postalCodeIdProvider;
            labelProvider = postalCodeLabelProvider;
            label = t("common.postcode");
            break;
        default:
            break;
    }
    const suggestionsFilter = (suggestions: HereSuggestion[]) => {
        const interestingSuggestions = suggestions.filter(suggestionFilter);
        const uniqSuggestions = uniqBy(interestingSuggestions, (suggestion) =>
            idProvider(suggestion)
        );
        return uniqSuggestions.slice(0, NUMBER_OF_SUGGESTIONS);
    };
    return (
        <HereSuggestField
            required={false}
            searchMode={"discover"}
            value={value}
            label={label}
            data-testid={locationType}
            name={name}
            key={locationType} // force re-render when locationType changes
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setValue(event.target.value);
            }}
            onSuggestionClick={(suggestion: Place) => {
                let value = suggestion[locationType] || "";
                if (locationType === "county" && suggestion.postcode) {
                    value = suggestion.postcode.substring(0, 2);
                }
                const countryCode = suggestion.countryCode.toUpperCase();
                onChange(value, countryCode);
                setValue("");
            }}
            onBlur={() => {
                // nothing to do
            }}
            suggestionsFilter={suggestionsFilter}
            labelProvider={labelProvider}
            valueProvider={valueProvider}
        />
    );
};

// City behaviors

const cityIdProvider = ({address}: HereSuggestion) => `${address.city}-${address.countryName}`;

const cityLabelProvider = ({address}: HereSuggestion) => (
    <>
        <b>{address.city}</b>
        {address.postalCode && ` (${address.postalCode})`}
        {address.countryName && `, ${address.countryName}`}
    </>
);

const citySuggestionFilter = (suggestion: HereSuggestion) => {
    if (suggestion.address?.city) {
        return true;
    }
    return false;
};

// County behaviors

const countyIdProvider = ({address}: HereSuggestion) => `${address.county}-${address.countryName}`;

const countyLabelProvider = ({address}: HereSuggestion) => {
    return (
        <>
            <b>
                {address.postalCode && `${address.postalCode.substring(0, 2)} - `}
                {address.county}
            </b>
            {address.countryName && `, ${address.countryName}`}
        </>
    );
};

const countySuggestionFilter = (suggestion: HereSuggestion) => {
    if (
        ["place", "locality"].includes(suggestion.resultType) &&
        suggestion.address?.county &&
        suggestion.address?.postalCode
    ) {
        return true;
    }
    return false;
};

// PostalCode behaviors

const postalCodeIdProvider = ({address}: HereSuggestion) =>
    `${address.postalCode}-${address.countryName}`;

const postalCodeLabelProvider = ({address}: HereSuggestion) => (
    <>
        <b>{address.postalCode}</b>
        {address.countryName && `, ${address.countryName}`}
    </>
);

const postalCodeSuggestionFilter = (suggestion: HereSuggestion) => {
    if (suggestion.address?.postalCode) {
        return true;
    }
    return false;
};
