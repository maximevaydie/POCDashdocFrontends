import {FilteringListBadge} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringBadge";
import {t} from "@dashdoc/web-core";
import React, {FunctionComponent, ReactNode} from "react";

import {VehiclesQuery} from "./vehicleFilter.types";

type VehicleBadgeProps = {
    query: VehiclesQuery;
    updateQuery: (query: VehiclesQuery) => void;
};

export const VehicleBadge: FunctionComponent<VehicleBadgeProps> = ({query, updateQuery}) => {
    return (
        <FilteringListBadge
            queryKey={"vehicle__in"}
            query={query}
            updateQuery={updateQuery}
            getLabel={getLabel}
            data-testid="badge-vehicle"
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
