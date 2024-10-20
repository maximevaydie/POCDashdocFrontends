import {Box} from "@dashdoc/web-ui";
import {Area, Place} from "dashdoc-utils";
import React from "react";

import {LocationPicker, type Value} from "app/features/address/location-picker/LocationPicker";

import type {LocationTypeValue} from "app/features/address/location-picker/types";

export type FiltersAreaProps = {
    onChange: (area: Area) => void;
    title: string;
    defaultArea?: Area | null;
};

export function AreaSelector(props: FiltersAreaProps) {
    const {defaultArea, onChange: onAreaChange, ...others} = props;
    const defaultValues = defaultArea?.places?.map((place) => ({
        value: place.city ? place.city : place.postcode_prefix,
        countryCode: place.country,
    }));
    const atLeastOneCity = defaultArea?.places?.some((place) => place.city);
    const defaultType = atLeastOneCity ? "city" : "county";
    const onChange = (locationType: LocationTypeValue, values: Value[], label?: string) => {
        const places: Place[] = values.map(({value, countryCode: country}) => {
            if (locationType === "county") {
                return {
                    postcode_prefix: value,
                    country,
                };
            } else {
                return {
                    city: value,
                    country,
                };
            }
        });
        // @ts-ignore
        const area: Area = {name: label, places};
        onAreaChange(area);
    };

    return (
        <Box minHeight="400px" minWidth="350px">
            <LocationPicker
                availableTypes={["county", "city"]}
                defaultType={defaultType}
                defaultLabel={defaultArea?.name}
                // @ts-ignore
                defaultValues={defaultValues}
                onChange={onChange}
                {...others}
            />
        </Box>
    );
}
