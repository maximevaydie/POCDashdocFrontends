import {useSelectedViews} from "@dashdoc/web-common/src/features/filters/filtering-bar/hooks/useSelectedViews";
import {useCallback} from "react";

import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";
import {useCurrentQueryWithView} from "app/screens/scheduler/hook/useCurrentQuery";
import {usePreSelectedSchedulerDates} from "app/screens/scheduler/hook/usePreSelectedSchedulerDates";
import {usePoolViewContext} from "app/screens/scheduler/hook/view/usePoolViewContext";
import {useSchedulerViewContext} from "app/screens/scheduler/hook/view/useSchedulerViewContext";

export function useSchedulerViewsAndFilters() {
    const {dateQuery, setSelectedDatesQuery} = usePreSelectedSchedulerDates();

    const {poolViewPk, schedulerViewPk, updateSelectedViews} = useSelectedViews<
        "poolViewPk" | "schedulerViewPk"
    >();
    const {currentQuery, updateQuery} = useCurrentQueryWithView(
        dateQuery,
        poolViewPk,
        schedulerViewPk
    );

    const poolViewContext = usePoolViewContext(poolViewPk, updateSelectedViews);
    const schedulerViewContext = useSchedulerViewContext(
        schedulerViewPk,
        updateSelectedViews,
        updateQuery
    );

    const updateQueryAndUnselectView = useCallback(
        (query: SchedulerFilters) => {
            updateQuery(query);
            updateSelectedViews({poolViewPk: undefined});
        },
        [updateSelectedViews, updateQuery]
    );

    const updateSchedulerDates = useCallback(
        (query: Pick<SchedulerFilters, "period" | "start_date" | "end_date">) => {
            updateQuery(query);
            setSelectedDatesQuery({
                period: query.period,
                start_date: query.start_date,
                end_date: query.end_date,
            });
        },
        [updateQuery, setSelectedDatesQuery]
    );

    const resetSchedulerResourcesFilters = useCallback(() => {
        updateQueryAndUnselectView({
            vehicle__in: [],
            trailer__in: [],
            trucker__in: [],
            carrier__in: [],
        });
    }, [updateQueryAndUnselectView]);

    return {
        poolCurrentQueryContext: {
            currentQuery,
            updateQuery: updateQueryAndUnselectView,
            updateSchedulerDates,
            resetSchedulerResourcesFilters,
        },
        poolViewContext,
        schedulerViewContext,
    };
}
