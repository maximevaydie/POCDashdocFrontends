import {FilteringBar, Period} from "@dashdoc/web-common";
import React from "react";

import {getTelematicDateRangeFilter} from "app/features/filters/badges-and-selectors/traces/telematic-date-range/telematicDateRangeFilter";
import {getTelematicVehicleFilter} from "app/features/filters/badges-and-selectors/traces/telematic-vehicle/telematicVehicleFilter.service";

type Props = {
    query: TraceQuery;
    updateQuery: (newQuery: Partial<TraceQuery>) => void;
};

export type TraceQuery = {
    telematic_vehicle_plate__in: string[];
    start_date?: string;
    end_date?: string;
    period?: Period;
};

export function TracesFilteringBar({query, updateQuery}: Props) {
    const filters = [getTelematicVehicleFilter(), getTelematicDateRangeFilter()];
    return (
        <FilteringBar<TraceQuery>
            filters={filters}
            query={query}
            resetQuery={RESET_QUERY}
            updateQuery={updateQuery}
            data-testid={"traces-filtering-bar"}
        />
    );
}

const RESET_QUERY: TraceQuery = {
    telematic_vehicle_plate__in: [],
    start_date: undefined,
    end_date: undefined,
    period: undefined,
};
