import React, {FunctionComponent, createContext} from "react";
import {RouteComponentProps} from "react-router";

import {ActionableExtendedViewContext} from "app/common/ActionableExtendedViewContext";
import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";
import {TripEdition} from "app/features/trip/trip-edition";
import {usePredefinedFilters} from "app/screens/scheduler/hook/filters-legacy/usePredefinedFilters";
import {
    getDefaultSchedulerQuery,
    useCurrentQuery,
} from "app/screens/scheduler/hook/useCurrentQuery";

export const TripEditionScreen: FunctionComponent<
    Partial<RouteComponentProps<{tripUid: string}>>
> = ({match}) => {
    const tripUid = match?.params?.tripUid || "";
    const {predefinedFilters, updatePredefinedData} = usePredefinedFilters();
    const {currentQuery, updateQuery} = useCurrentQuery(predefinedFilters, true);

    const onCurrentQueryChange = (query: SchedulerFilters) => {
        updateQuery(query);
        updatePredefinedData({...currentQuery, ...query});
    };

    return (
        <ActionableExtendedViewContext.Provider value={true}>
            <PoolCurrentQueryContext.Provider
                value={{
                    currentQuery,
                    updateQuery: onCurrentQueryChange,
                    updateSchedulerDates: () => {},
                    resetSchedulerResourcesFilters: () => {},
                }}
            >
                <TripEdition tripUid={tripUid} />
            </PoolCurrentQueryContext.Provider>
        </ActionableExtendedViewContext.Provider>
    );
};

export const PoolCurrentQueryContext = createContext<{
    currentQuery: SchedulerFilters;
    updateQuery: (query: Partial<SchedulerFilters>) => void;
    updateSchedulerDates: (
        query: Pick<SchedulerFilters, "period" | "start_date" | "end_date">
    ) => void;
    resetSchedulerResourcesFilters: () => void;
}>({
    currentQuery: getDefaultSchedulerQuery(true),
    updateQuery: () => {},
    updateSchedulerDates: () => {},
    resetSchedulerResourcesFilters: () => {},
});
