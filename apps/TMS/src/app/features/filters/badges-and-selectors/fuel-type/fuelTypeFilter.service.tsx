import {FilterData, getStaticListFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {FuelType} from "dashdoc-utils";

import {fuelTypeService} from "app/services/transport/fuelType.service";

export function getFuelTypeFilter(): FilterData<FuelTypeQuery> {
    return getStaticListFilter({
        key: "fuel-type",
        label: t("common.fuel_type"),
        icon: "gasIndex",
        items: fuelTypeService.getFuelTypeSelectOptions() as Array<{label: string; value: string}>,
        queryKey: "fuel_type__in",
        testId: "fuel-type",
    });
}

export type FuelTypeQuery = {
    fuel_type__in?: FuelType[];
};
