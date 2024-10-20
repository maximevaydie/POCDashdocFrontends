import {HereSuggestField, HereSuggestion} from "@dashdoc/web-common";
import {Place, t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import uniqBy from "lodash.uniqby";
import React, {useState} from "react";

import {displayPlace} from "app/features/pricing/tariff-grids/tariffGridZoneUtils";
import {PlaceForTariffGridZone} from "app/features/pricing/tariff-grids/types";
import {useTariffGridZones} from "app/screens/invoicing/hooks/useTariffGridZones";

type TariffGridCitySelectProps = {
    place?: PlaceForTariffGridZone;
    onChange: (place: PlaceForTariffGridZone) => void;
};

const NUMBER_OF_SUGGESTIONS = 8;

export const TariffGridPlaceSelect = ({place, onChange}: TariffGridCitySelectProps) => {
    const zones = useTariffGridZones();

    const [hereSuggestionContent, setHereSuggestionContent] = useState<string>(() => {
        if (place) {
            return displayPlace(place);
        }
        return "";
    });

    const labelProvider = (suggestion: HereSuggestion) => {
        if (suggestion.localityType === "postalCode") {
            return postalCodeLabelProvider(suggestion.address);
        }

        // city locality type
        return cityLabelProvider(suggestion.address);
    };

    const postalCodeLabelProvider = (address: HereSuggestion["address"]) => (
        <Flex alignItems={"center"}>
            <Icon
                name="postalCode"
                round
                backgroundColor={"pink.ultralight"}
                color="pink.default"
            />
            <Box ml={4}>
                <Text variant="h2">{address.postalCode}</Text>
                <Text>
                    {address.county ? `${address.county}, ` : ""}
                    {address.countryName ?? ""}
                </Text>
            </Box>
        </Flex>
    );

    const cityLabelProvider = (address: HereSuggestion["address"]) => (
        <Flex alignItems={"center"}>
            <Icon
                name="city"
                color="turquoise.default"
                round
                backgroundColor={"turquoise.ultralight"}
            />
            <Box ml={4}>
                <Text variant="h2">{address.city}</Text>
                <Text>
                    {address.county ? `${address.county} ` : ""}
                    {address.postalCode && `(${address.postalCode}), `}
                    {address.countryName ?? ""}
                </Text>
            </Box>
        </Flex>
    );

    /**
     * Filter the suggestions given by Here API according to the locality type and reformat address content:
     * - if the locality type is "postalCode", we'll suggest postal codes without cities and cities.
     * - if the locality type is "city", we'll suggest only cities.
     *
     * @param suggestions list of suggestion given by Here API
     * @returns a list of filtered suggestions
     *
     */
    const suggestionsFilter = (suggestions: HereSuggestion[]) => {
        const localityType = suggestions[0]?.localityType;
        let uniqPostalCodes: HereSuggestion[] = [];
        if (localityType === "postalCode") {
            const interestingPostalCodeSuggestions = suggestions.filter(({address}) =>
                Boolean(address?.postalCode)
            );

            uniqPostalCodes = uniqBy(
                interestingPostalCodeSuggestions,
                ({address}: HereSuggestion) => `${address.postalCode}-${address.countryName}`
            ).map((suggestion) => ({
                ...suggestion,
                localityType: "postalCode",
                id: `${suggestion.address.postalCode}-${suggestion.address.countryName}`,
            }));
        }

        const interestingCitySuggestions = suggestions.filter((suggestion) =>
            Boolean(suggestion.address?.city)
        );
        const uniqCities = uniqBy(
            interestingCitySuggestions,
            ({address}: HereSuggestion) => `${address.city}-${address.countryName}`
        ).map((suggestion) => {
            // Use the department / county as postal code if it exists
            // otherwise completely remove the postal code as it won't be used
            let postalCode = "";
            if (zones) {
                const matchedZone = Object.values(zones).find(({zip_code_prefix}) =>
                    suggestion.address.postalCode
                        .toLowerCase()
                        .startsWith(zip_code_prefix.toLowerCase())
                );
                postalCode = matchedZone?.zip_code_prefix ?? "";
            }

            return {
                ...suggestion,
                address: {
                    ...suggestion.address,
                    postalCode,
                },
                localityType: "city",
                id: `${suggestion.address.city}-${suggestion.address.countryName}`,
            } as HereSuggestion;
        });

        const uniqSuggestions = uniqPostalCodes.concat(uniqCities);
        return uniqSuggestions.slice(0, NUMBER_OF_SUGGESTIONS);
    };

    return (
        <HereSuggestField
            required={true}
            searchMode="autocomplete"
            value={hereSuggestionContent}
            label={t("tariffGrids.city")}
            data-testid={"tariff-grid-city-select"}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setHereSuggestionContent(event.target.value);
            }}
            onSuggestionClick={(suggestion: Place) => {
                // According to the suggestion filter the suggestion is either a "postalCode" or a "city"
                // A "city" has a defined city
                // A "postalCode" has a defined postcode
                let newPlace: PlaceForTariffGridZone | undefined;
                const country = suggestion.countryCode.toUpperCase();

                if (suggestion.localityType === "city") {
                    newPlace = {
                        city: suggestion.city as string,
                        country,
                        postcode_prefix: suggestion.postcode as string,
                    };
                } else {
                    // postalCode suggestion
                    newPlace = {
                        city: "",
                        country,
                        postcode_prefix: suggestion.postcode as string,
                    };
                }

                onChange(newPlace as PlaceForTariffGridZone);
                setHereSuggestionContent(displayPlace(newPlace as PlaceForTariffGridZone));
            }}
            onBlur={() => {
                // nothing to do
            }}
            autoFocus={true}
            suggestionsFilter={suggestionsFilter}
            labelProvider={labelProvider}
        />
    );
};
