import {Place} from "@dashdoc/web-core";
import {TextInput} from "@dashdoc/web-ui";
import {ClickOutside} from "@dashdoc/web-ui";
import {theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import H from "@here/maps-api-for-javascript";
import {getLocale, Address} from "dashdoc-utils";
import debounce from "lodash.debounce";
import React, {ReactNode, useMemo, useState} from "react";
import {useSelector} from "react-redux";

import {alpha3ToAlpha2} from "../../../constants/alpha3-to-alpha2";
import {useHereApiService, type SearchMode} from "../../../hooks/useHereApiService";
import {getConnectedCompany} from "../../../../../../react/Redux/accountSelector";
import {AddressSuggestedComponentProps} from "../../../types/address";

import {addressDisplayService} from "./addressDisplay.service";

import type {CommonRootState} from "../../../../../../react/Redux/types";

const NUMBER_OF_SUGGESTIONS = 5;

export interface HereSuggestion {
    title: string;
    id: string;
    language: string;
    resultType: string;
    localityType: string;
    houseNumberType: string;
    address: {
        label: string;
        countryCode: string;
        countryName: string;
        stateCode: string;
        state: string;
        countyCode: string;
        county: string;
        city: string;
        district: string;
        street: string;
        postalCode: string;
        houseNumber: string;
    };
    position: {
        lat: number;
        lng: number;
    };
    access: {lat: number; lng: number}[];
    distance: number;
    mapView: {
        west: number;
        south: number;
        east: number;
        north: number;
    };
}

const SuggestionsContainer = styled("ul")`
    position: absolute;
    z-index: 2000;
    background: white;
    width: 600px;
    box-shadow: ${theme.shadows.large};
    border-radius: 3px;
    margin-top: 3px;
    padding: 5px 0;
    overflow-y: auto;
    max-height: 220px;
`;

const SuggestionItem = styled("li")`
    cursor: pointer;
    padding: 10px 15px;
    list-style: none;

    &.active {
        background: ${theme.colors.blue.ultralight};
    }
`;
/**Turns a Here Suggestion into a Place object */
function hereSuggestionToPlace(suggestion: HereSuggestion): Place {
    const alpha2CountryCode = alpha3ToAlpha2[suggestion.address.countryCode];
    const address = addressDisplayService.addressDisplay(
        suggestion.address.houseNumber,
        suggestion.address.street,
        suggestion.address.district,
        alpha2CountryCode
    );

    return {
        address: address,
        postcode: suggestion.address.postalCode,
        city: suggestion.address.city,
        countryCode: alpha2CountryCode,
        county: suggestion.address.county,
        country: suggestion.address.countryName,
        localityType: suggestion.localityType,
        // We don't have the position when using autocomplete API
        latitude: suggestion.position?.lat,
        longitude: suggestion.position?.lng,
    };
}

const DEFAULT_FILTER = (suggestions: HereSuggestion[]) => {
    return suggestions
        .filter((suggestion) => suggestion.resultType !== "place")
        .slice(0, NUMBER_OF_SUGGESTIONS);
};

const DEFAULT_LABEL_PROVIDER = (suggestion: HereSuggestion) => {
    return suggestion.address.label;
};

const DEFAULT_VALUE_PROVIDER = (value: string) => value;

/**
 * Returns gps coordinates as a string
 *
 * Use the primary address of the company if it exists, otherwise Paris
 */
export const useUserCoordinates = (): string => {
    const primaryAddress = useSelector<CommonRootState, Address | undefined>((state) => {
        const primaryAddress: Address | undefined =
            getConnectedCompany(state)?.primary_address ?? undefined;
        return primaryAddress;
    });

    if (primaryAddress?.latitude && primaryAddress?.longitude) {
        return `${primaryAddress.latitude},${primaryAddress.longitude}`;
    }
    return "48.88073513442097,2.3338582541984936";
};

export type HereSuggestFieldProps = AddressSuggestedComponentProps & {
    searchMode: SearchMode;
    autoFocus?: boolean;
    suggestionsFilter?: (suggestions: HereSuggestion[]) => HereSuggestion[]; //  Customize the filter of suggestions
    labelProvider?: (suggestion: HereSuggestion) => ReactNode; // Customize the label of suggestions
    valueProvider?: (value: string) => string; // Customize the value before the query is sent
};

/**
 * Free (address) text input whose suggestions are powered by `Here`.
 * Can be used as is to input an address/city/country/county...
 *
 * Or can be used along other same component to input a full address.
 * The component will automatically know it's type (`"address"`/`"city"`/`"country"`/`"county"`)
 * based on the suffix of the `name` prop, e.g. `primary_address.address` will be of type `"address"`.
 *
 * Suggestions are parsed as `Place` objects, and the main behavior
 * is then handled by the `onSuggestionClick` prop.
 */
export const HereSuggestField: React.FC<HereSuggestFieldProps> = (props) => {
    const [suggestions, setSuggestions] = useState<HereSuggestion[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(0);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isUpToDate, setIsUpToDate] = useState<boolean>(false); //tracks whether the suggestions are up to date with what's inside the input
    const [isRequestedClose, setIsRequestedClose] = useState<boolean>(false);
    const userCoordinates = useUserCoordinates();
    const {search} = useHereApiService();

    const isOpenSuggestion =
        isFocused && isUpToDate && !isRequestedClose && suggestions.length > 0;

    const handleSearch = useMemo(
        () =>
            debounce(async (query) => {
                let params: H.service.ServiceParameters = {
                    // Search query
                    q: query,
                    // Below we fetch more than needed suggestions
                    // to take into account the fact that we may remove some afterwards.
                    limit: (NUMBER_OF_SUGGESTIONS + 4).toString(),
                    lang: getLocale(),
                    at: userCoordinates,
                };

                if (props.searchMode === "autocomplete") {
                    params = {
                        ...params,
                        types: "city,postalCode",
                        postalCodeMode: "cityLookup",
                    };
                }

                await search(props.searchMode, params, handleSearchResults, handleError);
            }, 300),
        [isFocused]
    );

    const handleSearchResults = (result: any) => {
        if (isFocused) {
            const filter = props.suggestionsFilter ?? DEFAULT_FILTER;
            setSuggestions(filter(result.items));
            setIsUpToDate(true);
            setActiveSuggestionIndex(0);
        }
    };

    const handleError = () => {};

    const handleTextChange = (value: string, event: React.ChangeEvent<HTMLInputElement>) => {
        setIsUpToDate(false);
        props.onChange?.(event);

        const valueProvider = props.valueProvider ?? DEFAULT_VALUE_PROVIDER;
        const finalValue = valueProvider(value);

        // We split/pop because sometime the full field name might be something
        // like: `primary_address.address`
        const fieldName = props.name?.split(".").pop();

        let addressElements = [
            fieldName === "address" ? finalValue : props.complementaryDataAutocomplete?.address,
            fieldName === "postcode" ? finalValue : props.complementaryDataAutocomplete?.postcode,
            fieldName === "city" ? finalValue : props.complementaryDataAutocomplete?.city,
            fieldName === "county" ? finalValue : props.complementaryDataAutocomplete?.county,
        ];

        // Fallback for unknown fields
        if (!["address", "postcode", "city", "county"].includes(fieldName ?? "")) {
            addressElements = [finalValue];
        }

        const query = addressElements.filter(Boolean).join(", ");
        setIsRequestedClose(false);
        handleSearch(query);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            const suggestion =
                activeSuggestionIndex === null ? null : suggestions[activeSuggestionIndex];
            if (!suggestion) {
                return;
            }
            handleSuggestionClick(hereSuggestionToPlace(suggestion));
            event.preventDefault(); // Fix a sideEffect (Otherwise, trigger an onClick event on the next available clickable DOM Tag)
        } else if (event.key === "Tab") {
            setIsRequestedClose(true);
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            const index = activeSuggestionIndex ?? 0;
            let newIndex = event.key === "ArrowDown" ? index + 1 : index - 1;
            if (newIndex < 0) {
                newIndex = suggestions.length - 1;
            } else if (newIndex >= suggestions.length) {
                newIndex = 0;
            }
            setActiveSuggestionIndex(newIndex);
        }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.relatedTarget && event.relatedTarget.classList.contains("suggestion")) {
            return;
        }
        props.onBlur?.(event);
        setIsFocused(false);
    };

    const handleFocus = () => {
        setIsRequestedClose(false);
        setIsFocused(true);
    };

    const handleSuggestionClick = (place: Place) => {
        handleFocus();
        props.onSuggestionClick(place);
        setIsRequestedClose(true);
    };

    const _renderSuggestion = (suggestion: HereSuggestion, index: number) => {
        if (!suggestion) {
            return undefined;
        }
        const place = hereSuggestionToPlace(suggestion);
        const labelProvider = props.labelProvider ?? DEFAULT_LABEL_PROVIDER;
        const label = labelProvider(suggestion);
        return (
            <SuggestionItem
                tabIndex={0} //Used to catch this in the onBlur method
                key={suggestion.id}
                data-testid={`autocomplete-suggestion-${index}`}
                onClick={() => handleSuggestionClick(place)}
                onMouseEnter={() => setActiveSuggestionIndex(index)}
                className={index === activeSuggestionIndex ? "active suggestion" : "suggestion"}
            >
                {label}
            </SuggestionItem>
        );
    };

    const {onSuggestionClick, ...inputProps} = props;

    return (
        <ClickOutside
            onClickOutside={() => {
                setIsRequestedClose(true);
                setIsFocused(false);
            }}
            reactRoot={document.getElementById("react-app-modal-root")}
        >
            <TextInput
                {...inputProps}
                placeholder={props.placeholder}
                aria-label={props.placeholder}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onFocus={handleFocus}
                // Remove browser suggestions not to cover Here ones
                autoComplete="off"
            />
            {isOpenSuggestion && (
                <SuggestionsContainer>{suggestions.map(_renderSuggestion)}</SuggestionsContainer>
            )}
        </ClickOutside>
    );
};
