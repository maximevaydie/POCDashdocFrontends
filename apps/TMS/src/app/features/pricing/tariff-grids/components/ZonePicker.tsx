import {t} from "@dashdoc/web-core";
import {Flex, Select, FlexProps, SelectOption, theme} from "@dashdoc/web-ui";
import React, {FC, useMemo, useState} from "react";

import {useTariffGridZones} from "app/screens/invoicing/hooks/useTariffGridZones";

import {TariffGridCountries, TariffGridCountryCode, TariffGridAreasDetails} from "../types";

interface TariffGridZonePickerProps extends FlexProps {
    zones: Record<string, TariffGridAreasDetails>;
    zonesCountries: TariffGridCountries;
    zoneId?: string;
    onChange: (zoneId: string) => unknown;
}

export const ZonePicker: FC<TariffGridZonePickerProps> = ({
    zonesCountries,
    zones,
    zoneId,
    onChange,
    ...flexProps
}) => {
    const [country, setCountry] = useState<TariffGridCountryCode | null>(() => {
        if (zoneId === undefined) {
            return null;
        }
        if (!zones[zoneId]) {
            return null;
        }

        return zones[zoneId].country;
    });

    const countryDetails = country ? zonesCountries[country] : undefined;

    const countryOptions = useMemo(
        () =>
            Object.entries(zonesCountries).map(([key, value]) => ({
                value: key,
                label: t(value.name),
            })),
        [zonesCountries]
    );

    const countryValue = {
        value: country,
        label: countryDetails ? t(countryDetails.name) : "",
    };

    return (
        <Flex flexDirection={"column"} style={{gap: "10px"}} {...flexProps}>
            <Select
                isClearable={false}
                menuPortalTarget={document.body}
                styles={{menuPortal: (base) => ({...base, zIndex: theme.zIndices.topbar})}}
                label={t("tariffGrids.Country")}
                value={countryValue}
                options={countryOptions}
                data-testid="country-select"
                onChange={({value}: SelectOption<keyof typeof zonesCountries | undefined>) => {
                    if (value === undefined) {
                        return;
                    }
                    setCountry(value);
                    const availableZoneIds = Object.entries(zones)
                        .filter(([, zone]) => zone.country === value)
                        .map(([key]) => key);
                    const [firstZoneId] = availableZoneIds;
                    if (firstZoneId) {
                        onChange(firstZoneId);
                    }
                }}
            />
            {country && <ZoneSelect country={country} zoneId={zoneId} onChange={onChange} />}
        </Flex>
    );
};

type ZoneSelectProps = {
    country: string;
    zoneId?: string;
    onChange: (zoneId: string) => unknown;
};

export const ZoneSelect: FC<ZoneSelectProps> = ({country, zoneId, onChange}) => {
    const zones = useTariffGridZones();
    const [localZoneId, setLocalZoneId] = useState<string | null>(zoneId ? zoneId : null);
    const zoneOptions = useMemo(
        () =>
            zones === undefined
                ? []
                : Object.entries(zones)
                      .filter(([, zone]) => zone.country === country)
                      .map(([key, zone]) => ({
                          value: key,
                          label: zone.name,
                      })),
        [zones, country]
    );
    if (
        localZoneId !== null &&
        !zoneOptions.some((zoneOption) => zoneOption.value === localZoneId)
    ) {
        // Revoke the localZoneId when the company does not take part of available options
        const [firstZoneOption] = zoneOptions;
        if (firstZoneOption) {
            setLocalZoneId(firstZoneOption.value);
        } else {
            setLocalZoneId(null);
        }
    } else if (localZoneId === null && zoneOptions.length > 0) {
        // always preselect the first zone when null
        const [firstZoneOption] = zoneOptions;
        if (firstZoneOption) {
            setLocalZoneId(firstZoneOption.value);
        }
    }
    const zoneDetails =
        zones === undefined || localZoneId === null ? undefined : zones[localZoneId];
    const zoneValue = {
        value: localZoneId,
        label: zoneDetails === undefined ? "" : zoneDetails.name,
    };
    return (
        <Select
            isClearable={false}
            autoFocus={true}
            openMenuOnFocus={false}
            menuPortalTarget={document.body}
            styles={{menuPortal: (base) => ({...base, zIndex: theme.zIndices.topbar})}}
            label={t("tariffGrids.postZone")}
            data-testid="zone-select"
            value={zoneValue}
            options={zoneOptions}
            onChange={({value}: SelectOption<keyof typeof zones | undefined>) => {
                // @ts-ignore
                setLocalZoneId(value);
                if (value) {
                    onChange(value);
                }
            }}
        />
    );
};
