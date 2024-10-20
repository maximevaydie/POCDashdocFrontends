import {SearchQuery, usePreselectedFilters} from "@dashdoc/web-common";
import {settingsViewSelector} from "@dashdoc/web-common/src/redux/reducers/settingsViewsReducer";
import {createContext, useCallback, useMemo, useState} from "react";

import {getDefaultSchedulerResourceSettings} from "app/features/scheduler/carrier-scheduler/hooks/useSchedulerViews";
import {
    SchedulerSettings,
    SchedulerSettingsView,
} from "app/features/scheduler/carrier-scheduler/schedulerSettingsView.types";
import useIsCarrier from "app/hooks/useIsCarrier";
import {useSelector} from "app/redux/hooks";

type ResourceQuery = SchedulerSettings["resource_settings"] & SearchQuery;
export const ResourcesQueryContext = createContext<{
    // Non-persistent filters applied directly from the scheduler
    resourcesLocalFilters: ResourceQuery;
    // Persistent filters coming from the current scheduler view settings
    resourcesViewFilters: ResourceQuery | null;
    // The final query applied on the resources by combining resourcesLocalFilters & resourcesViewFilters
    effectiveResourcesQuery: ResourceQuery;
    updateResourcesLocalFilters: (query: Partial<ResourceQuery>) => void;
    resetResourcesLocalFilters?: ResourceQuery;
}>({
    resourcesLocalFilters: {},
    resourcesViewFilters: {},
    effectiveResourcesQuery: {
        ...getDefaultSchedulerResourceSettings(true),
    },
    updateResourcesLocalFilters: () => {},
    resetResourcesLocalFilters: undefined,
});

export function useResourcesQueryContext(viewPk: number | undefined) {
    const isCarrier = useIsCarrier();
    const schedulerView = useSelector(
        (state) => settingsViewSelector(state, viewPk) as SchedulerSettingsView | null
    );

    const viewResourcesSettings = schedulerView?.settings.resource_settings ?? null;

    const {
        updateSelectedFilters,
        selectedFilters: {schedulerResources: lastResourcesFilters},
    } = usePreselectedFilters<{
        schedulerResources?: Partial<ResourceQuery>;
    }>();

    const [resourcesLocalFilters, setResourcesLocalFilters] = useState<ResourceQuery>({
        ...getDefaultSchedulerResourceSettings(isCarrier),
        ...(lastResourcesFilters ? lastResourcesFilters : {}),
    });

    const updateResourcesLocalFilters = useCallback(
        (query: Partial<ResourceQuery>) => {
            setResourcesLocalFilters((prevQuery) => ({
                ...prevQuery,
                ...query,
            }));
            updateSelectedFilters("schedulerResources", query);
        },
        [setResourcesLocalFilters, updateSelectedFilters]
    );

    const resetResourcesLocalFilters = useMemo(() => {
        if (schedulerView) {
            return {
                ...getDefaultSchedulerResourceSettings(isCarrier),
            };
        }
        return undefined;
    }, [schedulerView, isCarrier]);

    const effectiveResourcesQuery = useMemo(() => {
        let effectiveQuery = {
            ...getDefaultSchedulerResourceSettings(isCarrier),
            ...viewResourcesSettings,
        } as ResourceQuery;
        for (const key in resourcesLocalFilters) {
            if (isLocalFilterKey(key) && resourcesLocalFilters[key]?.length) {
                effectiveQuery[key] = resourcesLocalFilters[key];
            }
        }

        return effectiveQuery;
    }, [isCarrier, viewResourcesSettings, resourcesLocalFilters]);

    return {
        resourcesLocalFilters,
        resourcesViewFilters: viewResourcesSettings,
        updateResourcesLocalFilters,
        resetResourcesLocalFilters,
        effectiveResourcesQuery,
    };

    function isLocalFilterKey(
        key: string
    ): key is "trucker__in" | "vehicle__in" | "trailer__in" | "fleet_tags__in" {
        return ["trucker__in", "vehicle__in", "trailer__in", "fleet_tags__in"].includes(key);
    }
}
