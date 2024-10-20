import {FilterSelectorProps} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {FiltersSelect, SelectOption} from "@dashdoc/web-ui";
import {FuelType} from "dashdoc-utils";
import React, {useCallback, useMemo} from "react";

import {fuelTypeService} from "app/services/transport/fuelType.service";

import {FuelTypeQuery} from "./fuelTypeFilter.service";

type Props = FilterSelectorProps<FuelTypeQuery>;

export function FiltersFuelType({currentQuery, updateQuery}: Props) {
    const fuelTypesOptions = fuelTypeService.getFuelTypeSelectOptions();

    const onFuelTypesChange = useCallback(
        (values: SelectOption<FuelType>[]) => {
            // @ts-ignore
            updateQuery({fuel_type__in: values.map((v) => v.value)});
        },
        [updateQuery]
    );

    const selectedFuelTypes = useMemo(
        () =>
            fuelTypesOptions.filter(({value}) =>
                // @ts-ignore
                (currentQuery.fuel_type__in || []).includes(value)
            ),
        [currentQuery.fuel_type__in, fuelTypesOptions]
    );

    return (
        <FiltersSelect
            data-testid={"filters-fuel-type"}
            label={t("common.fuel_type")}
            leftIcon="gasIndex"
            options={fuelTypesOptions}
            value={selectedFuelTypes}
            onChange={onFuelTypesChange}
            isSearchable={false}
        />
    );
}
