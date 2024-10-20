import {FilteringListBadge} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringBadge";
import {t} from "@dashdoc/web-core";
import React, {FunctionComponent, ReactNode} from "react";

import {TelematicVehiclesQuery} from "./telematicVehicleFilter.types";

type VehicleBadgeProps = {
    query: TelematicVehiclesQuery;
    updateQuery: (query: TelematicVehiclesQuery) => void;
};

export const TelematicVehicleBadge: FunctionComponent<VehicleBadgeProps> = ({
    query,
    updateQuery,
}) => {
    return (
        <FilteringListBadge
            queryKey={"telematic_vehicle_plate__in"}
            query={query}
            updateQuery={updateQuery}
            getLabel={getLabel}
            data-testid="badge-telematic-vehicle"
        />
    );

    function getLabel(count: number) {
        let label: ReactNode = `1 ${t("common.vehicle").toLowerCase()}`;

        if (count > 1) {
            label = `${count} ${t("common.vehicles").toLowerCase()}`;
        }
        return label;
    }
};
