import {t} from "@dashdoc/web-core";
import {Select, theme} from "@dashdoc/web-ui";
import React, {FC, useMemo} from "react";

import {useTariffGridZonesCountries} from "app/screens/invoicing/hooks/useTariffGridZonesCountries";

import {TariffGridCountryCode} from "../types";

type TariffGridCountrySelectProps =
    | {
          value: TariffGridCountryCode | null;
          onChange: (countryCode: TariffGridCountryCode | null) => unknown;
          isClearable?: boolean;
      }
    | {
          value: TariffGridCountryCode;
          onChange: (countryCode: TariffGridCountryCode) => unknown;
          isClearable: false;
      };

export const TariffGridCountrySelect: FC<TariffGridCountrySelectProps> = ({
    value,
    onChange,
    isClearable,
}) => {
    const tariffGridCountries = useTariffGridZonesCountries();
    const countryOptions = useMemo(() => {
        const unsortedOptions =
            tariffGridCountries === undefined
                ? []
                : Object.entries(tariffGridCountries).map(([key, value]) => ({
                      value: key as TariffGridCountryCode,
                      label: t(value.name),
                  }));
        unsortedOptions.sort((a, b) => a.label.localeCompare(b.label));
        return unsortedOptions;
    }, [tariffGridCountries]);
    const getCountryName = (countryCode: TariffGridCountryCode) => {
        if (tariffGridCountries === undefined) {
            return countryCode;
        }
        const details = tariffGridCountries[countryCode];
        return details ? t(details.name) : countryCode;
    };
    const countryValue =
        value === null
            ? null
            : {
                  value: value,
                  label: getCountryName(value),
              };

    return (
        <Select<{value: TariffGridCountryCode; label: string}, false>
            isClearable={isClearable}
            menuPortalTarget={document.body}
            styles={{menuPortal: (base) => ({...base, zIndex: theme.zIndices.topbar})}}
            label={t("tariffGrids.Country")}
            value={countryValue}
            options={countryOptions}
            data-testid="country-select"
            onChange={(option) => {
                if (option === null) {
                    if (isClearable) {
                        onChange(null);
                    }
                    return;
                }
                onChange(option.value);
            }}
        />
    );
};
