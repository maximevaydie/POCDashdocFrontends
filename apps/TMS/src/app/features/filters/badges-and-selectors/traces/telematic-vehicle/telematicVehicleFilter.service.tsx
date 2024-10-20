import {FilterData} from "@dashdoc/web-common/src/features/filters/filtering-bar/filtering.types";
import {t} from "@dashdoc/web-core";
import React from "react";

import {TelematicVehicleBadge} from "./TelematicVehicleBadge";
import {TelematicVehiclesQuery} from "./telematicVehicleFilter.types";
import {TelematicVehicleSelector} from "./TelematicVehicleSelector";

export function getTelematicVehicleFilter(): FilterData<TelematicVehiclesQuery> {
    return {
        key: "vehicle",
        testId: "vehicle",
        selector: {
            label: t("common.vehicle"),
            icon: "truck",
            getFilterSelector: (query, updateQuery) => (
                <TelematicVehicleSelector query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["telematic_vehicle_plate__in"]?.length ?? 0,
                badge: (
                    <TelematicVehicleBadge
                        key="telematic_vehicle"
                        query={query}
                        updateQuery={updateQuery}
                    />
                ),
            },
        ],
    };
}
