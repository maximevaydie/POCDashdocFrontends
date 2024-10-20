import {apiService} from "@dashdoc/web-common";
import {FilteringSelectorHeader} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringSelectorHeader";
import {t} from "@dashdoc/web-core";
import {AutoCompleteTextInput, Badge, Box, Callout, Flex, TextInput} from "@dashdoc/web-ui";
import map from "lodash.map";
import sortedUniq from "lodash.uniq";
import uniq from "lodash.uniq";
import React, {useEffect, useState} from "react";

import {AddressesCriteriaQuery} from "./addressByCriteriaFilter.types";

type Props = {
    query: AddressesCriteriaQuery;
    updateQuery: (query: Partial<AddressesCriteriaQuery>) => void;
    initialDataType?: string;
};

export function AddressByCriteriaSelector({query, updateQuery, initialDataType}: Props) {
    const [selectedDataType, setSelectedDataType] = useState<string>(initialDataType ?? "address");

    const [editingCountry, setEditingCountry] = useState<string>("");
    const [editingPostcode, setEditingPostcode] = useState<string>("");

    const dataType = {
        label: t("filter.siteType"),
        options: [
            {
                label: t("common.pickup"),
                headerLabel: t("filter.loadingPostcode"),
                id: "origin_address",
            },
            {
                label: t("common.delivery"),
                headerLabel: t("filter.unloadingPostcode"),
                id: "destination_address",
            },
            {label: t("common.both"), headerLabel: t("filter.sitePostcode"), id: "address"},
        ],
        value: selectedDataType,
        onChange: setSelectedDataType,
    };
    const condition = {
        options: [{label: t("filter.contain"), id: "in"}],
        value: "in",
        onChange: () => {},
    };

    const sitePostcodeKey = `${selectedDataType}_postcode__in` as
        | "address_postcode__in"
        | "origin_address_postcode__in"
        | "destination_address_postcode__in";
    const siteCountryKey = `${selectedDataType}_country__in` as
        | "address_country__in"
        | "origin_address_country__in"
        | "destination_address_country__in";

    const postcodes = (
        query[sitePostcodeKey] ? (query[sitePostcodeKey] as string).split(",") : []
    ) as string[];
    const countries = (
        query[siteCountryKey] ? (query[siteCountryKey] as string).split(",") : []
    ) as string[];

    const [countrySuggestions, setCountrySuggestions] = useState<{label: string; value: string}[]>(
        []
    );

    useEffect(() => {
        const setSuggestions = async () => {
            const {results: addresses} = await apiService.Deliveries.getAllAddresses();
            setCountrySuggestions(
                sortedUniq(map(addresses, (address) => address.country))
                    .filter((country) => !!country)
                    .map((country) => {
                        return {label: country, value: country};
                    })
            );
        };
        setSuggestions();
    }, []);

    return (
        <Box minHeight="400px">
            <FilteringSelectorHeader dataType={dataType} condition={condition} />
            <Callout mx={3} mt={3} p={2}>
                {t("filter.hintPressEnter")}
            </Callout>
            <Flex p={3} style={{gap: "8px"}}>
                <TextInput
                    value={editingPostcode}
                    onChange={setEditingPostcode}
                    placeholder={t("common.postalCode")}
                    autoComplete={"off"}
                    onBlur={addPostcode}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            addPostcode();
                        }
                    }}
                    autoFocus
                    data-testid="postcode-input"
                />
                <AutoCompleteTextInput
                    value={editingCountry}
                    onChange={setEditingCountry}
                    placeholder={t("common.country")}
                    suggestions={countrySuggestions}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.stopPropagation();
                            addCountry();
                        }
                    }}
                    onSuggestionSelected={addCountrySuggestion}
                    data-testid="country-input"
                    rootId="react-floating-menu"
                />
            </Flex>
            <Flex px={3} py={1} style={{gap: "8px"}}>
                {postcodes.map((postcode) => (
                    <Badge
                        key={postcode}
                        data-testid="inside-filter-postcode-badge"
                        onDelete={() => removePostcode(postcode)}
                    >
                        {postcode}
                    </Badge>
                ))}
                {countries.map((country) => (
                    <Badge
                        key={country}
                        data-testid="inside-filter-country-badge"
                        onDelete={() => removeCountry(country)}
                    >
                        {country}
                    </Badge>
                ))}
            </Flex>
        </Box>
    );

    function addCountry() {
        addCountrySuggestion(editingCountry);
    }
    function addCountrySuggestion(value: string) {
        if (value) {
            updateQuery({
                [siteCountryKey]: uniq([...countries, value.toUpperCase()]).join(","),
            });
            setEditingCountry("");
        }
    }
    function removeCountry(country: string) {
        updateQuery({
            [siteCountryKey]: countries?.filter((c) => country !== c).join(","),
        });
    }
    function addPostcode() {
        if (editingPostcode) {
            updateQuery({
                [sitePostcodeKey]: uniq([...postcodes, editingPostcode.toUpperCase()]).join(","),
            });
            setEditingPostcode("");
        }
    }
    function removePostcode(postcode: string) {
        updateQuery({
            [sitePostcodeKey]: postcodes.filter((p) => postcode !== p).join(","),
        });
    }
}
