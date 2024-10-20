import {FilterData} from "@dashdoc/web-common/src/features/filters/filtering-bar/filtering.types";
import {t} from "@dashdoc/web-core";
import React from "react";

import {VehicleBadge} from "./VehicleBadge";
import {VehiclesQuery} from "./vehicleFilter.types";
import {VehicleSelector} from "./VehicleSelector";

export function getVehicleFilter(sortAndFilters = {}): FilterData<VehiclesQuery> {
    return {
        key: "vehicle",
        testId: "vehicle",
        selector: {
            label: t("common.vehicle"),
            icon: "truck",
            getFilterSelector: (query, updateQuery) => (
                <VehicleSelector
                    query={query}
                    updateQuery={updateQuery}
                    sortAndFilters={sortAndFilters}
                />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["vehicle__in"]?.length ?? 0,
                badge: <VehicleBadge key="vehicle" query={query} updateQuery={updateQuery} />,
            },
        ],
    };
}
