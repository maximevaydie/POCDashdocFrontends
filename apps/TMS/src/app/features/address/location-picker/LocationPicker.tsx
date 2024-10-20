import {Box, Flex, Text} from "@dashdoc/web-ui";
import {BadgeList} from "@dashdoc/web-ui";
import {CountryCode} from "dashdoc-utils";
import React, {FunctionComponent, useEffect, useState} from "react";

import {LocationType} from "./components/LocationType";
import {LocationField} from "./LocationField";
import {LocationTypeValue} from "./types";

export type Value = {value: string; countryCode: CountryCode};

/**
 * Good tool to force providing a constant non empty array, e.g. `["city", "county"]`
 */
type NonEmptyLocationList = Readonly<[LocationTypeValue, ...LocationTypeValue[]]>;

const DEFAULT_VALUES = [] as Value[];

function getValueStrings(values: Value[]): string[] {
    return values.map(({value}) => value);
}

export type LocationPickerProps = {
    title?: string;
    availableTypes: NonEmptyLocationList;
    defaultValues?: Value[];
    defaultType: LocationTypeValue;
    defaultLabel?: string;
    onChange: (locationType: LocationTypeValue, values: Value[], label?: string) => void;
};
export const LocationPicker: FunctionComponent<LocationPickerProps> = ({
    title,
    availableTypes,
    defaultValues = DEFAULT_VALUES,
    defaultType,
    defaultLabel = "",
    onChange,
}) => {
    const [{selectedType, values}, setState] = useState<{
        selectedType: LocationTypeValue;
        values: Value[];
        label?: string;
    }>(() => {
        let selectedType: LocationTypeValue = defaultType;
        if (!availableTypes.includes(selectedType)) {
            selectedType = availableTypes[0];
        }
        return {
            selectedType,
            values: defaultValues,
            label: defaultLabel,
        };
    });
    const tagValues = getValueStrings(values);

    useEffect(() => {
        setState((prev) => {
            if (!availableTypes.includes(prev.selectedType)) {
                // current selected type is still available
                return {values: DEFAULT_VALUES, selectedType: availableTypes[0]};
            }
            return prev;
        });
    }, [availableTypes]);

    return (
        <Box p={4}>
            {title && (
                <Text variant="h2" pb={2}>
                    {title}
                </Text>
            )}
            <Flex style={{gap: "8px"}} pb={2}>
                {availableTypes.map((aType) => (
                    <LocationType
                        key={aType}
                        locationType={aType}
                        selected={selectedType === aType}
                        onClick={() =>
                            setState((prev) => {
                                if (prev.selectedType === aType) {
                                    return prev;
                                } else {
                                    const newValues = DEFAULT_VALUES;
                                    const newSelectedType = aType;
                                    onChange(aType, newValues);
                                    return {
                                        selectedType: newSelectedType,
                                        values: newValues,
                                    };
                                }
                            })
                        }
                    />
                ))}
            </Flex>

            <LocationField
                onChange={(value: string, countryCode: CountryCode) =>
                    setState((prev) => {
                        const prevValueStrings = getValueStrings(prev.values);
                        if (prevValueStrings.includes(value)) {
                            // TODO compare value & countryCode
                            return prev;
                        } else {
                            const newValues = [...prev.values, {value, countryCode}];
                            const newValueStrings = getValueStrings(newValues);
                            const label = newValueStrings.join(", ");
                            onChange(selectedType, newValues, label);
                            return {
                                ...prev,
                                values: newValues,
                                label,
                            };
                        }
                    })
                }
                locationType={selectedType}
            />
            <Box pt={2}>
                <BadgeList
                    values={tagValues}
                    isMultiLine={true}
                    onDelete={(index) =>
                        setState((prev) => {
                            const newValues = [...prev.values];
                            newValues.splice(index, 1);
                            const newValueStrings = getValueStrings(newValues);
                            const label = newValueStrings.join(", ");
                            onChange(selectedType, newValues, label);
                            return {
                                ...prev,
                                values: newValues,
                                label,
                            };
                        })
                    }
                />
            </Box>
        </Box>
    );
};
