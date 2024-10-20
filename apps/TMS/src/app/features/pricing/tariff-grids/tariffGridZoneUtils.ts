import {SupportedLocale, getLocale, translatedCountries} from "@dashdoc/web-core";
import {IconNames} from "@dashdoc/web-ui";

import {PlaceForTariffGridZone, TariffGridZone} from "app/features/pricing/tariff-grids/types";

// Synchronize with backend/dashdoc/tariffs/views/tariff_grid_filters.py
export const displayZone = (zone: TariffGridZone): string => {
    if (zone.zone_type === "TARIFF_GRID_AREA_ID") {
        return zone.area.name;
    }
    if (zone.zone_type === "PLACE") {
        return displayPlace(zone.place);
    }
    if (zone.zone_type === "ADDRESS") {
        return zone.address.name;
    }
    return "–";
};

// Synchronize with backend/dashdoc/tariffs/views/tariff_grid_filters.py
export const displayPlace = (place: PlaceForTariffGridZone): string => {
    const lang = getLocale() as SupportedLocale;

    const countryName =
        translatedCountries[lang].find(({alpha2}) => alpha2 === place.country.toLowerCase())
            ?.name ?? place.country;

    if (place.city !== "" && place.postcode_prefix !== "") {
        return `${place.city} (${place.postcode_prefix}), ${countryName}`;
    }

    if (place.city !== "") {
        return `${place.city}, ${countryName}`;
    }

    if (place.postcode_prefix !== "") {
        return `${place.postcode_prefix}, ${countryName}`;
    }

    return countryName;
};

type ZoneIconProps = {
    name: IconNames;
    color: string;
    backgroundColor: string;
    borderColor: string;
};

export const getZoneIconProps = (zone: TariffGridZone): ZoneIconProps => {
    if (zone.zone_type === "TARIFF_GRID_AREA_ID") {
        return {
            name: "county",
            color: "cyan.default",
            backgroundColor: "cyan.ultralight",
            borderColor: "cyan.light",
        };
    }

    // CITY
    if (zone.zone_type === "PLACE" && zone.place.city !== "") {
        return {
            name: "city",
            color: "turquoise.default",
            backgroundColor: "turquoise.ultralight",

            borderColor: "turquoise.light",
        };
    }

    // POSTCODE
    if (zone.zone_type === "PLACE" && zone.place.postcode_prefix !== "") {
        return {
            name: "postalCode",
            color: "pink.default",
            backgroundColor: "pink.ultralight",
            borderColor: "pink.light",
        };
    }

    // COUNTRY
    if (zone.zone_type === "PLACE") {
        return {
            name: "earth",
            color: "purple.default",
            backgroundColor: "purple.ultralight",
            borderColor: "purple.light",
        };
    }

    // zone.zone_type === "ADDRESS"
    return {
        name: "address",
        color: "orange.default",
        backgroundColor: "orange.ultralight",
        borderColor: "orange.light",
    };
};
