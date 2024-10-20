import {BackgroundOverlay, Box, Card, theme} from "@dashdoc/web-ui";
import {Area, Place} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";

import {LocationPicker, type Value} from "app/features/address/location-picker/LocationPicker";

import type {LocationTypeValue} from "app/features/address/location-picker/types";

type AreaMenuProps = {
    defaultArea?: Area;
    onChange: (area: Area | null) => void;
};
export const AreaMenu: FunctionComponent<AreaMenuProps> = ({defaultArea, ...props}) => {
    let defaultValues: Value[] = [];
    const defaultLabel = defaultArea?.name;
    const atLeastOneCity = defaultArea?.places?.some((place) => place.city);
    const defaultType = atLeastOneCity ? "city" : "county";
    const close = () => {
        props.onChange(area);
    };

    if (defaultArea) {
        // @ts-ignore
        defaultValues = defaultArea?.places?.map((place) => ({
            value: place.city ? place.city : place.postcode_prefix,
            countryCode: place.country,
        }));
    }
    // @ts-ignore
    const [area, setArea] = useState<Area | null>(() => defaultArea);

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
        if (places.length > 0) {
            setArea(area);
        } else {
            setArea(null);
        }
    };
    return (
        <>
            <BackgroundOverlay
                data-testid="area-menu-background-overlay"
                onMouseDown={close}
                backgroundColor="transparent"
            ></BackgroundOverlay>
            <Box position="relative" zIndex={theme.zIndices.topbar}>
                <Box position="absolute" width="300px">
                    <Card p={2} mt={2} border="1px solid" borderColor="grey.light">
                        <LocationPicker
                            availableTypes={["county", "city"]}
                            defaultType={defaultType}
                            defaultLabel={defaultLabel}
                            defaultValues={defaultValues}
                            onChange={onChange}
                        />
                    </Card>
                </Box>
            </Box>
        </>
    );
};
