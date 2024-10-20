import {getTagFilter} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/tag/tagFilter.service";
import {FilterData} from "@dashdoc/web-common/src/features/filters/filtering-bar/filtering.types";
import {FilteringBar} from "@dashdoc/web-common/src/features/filters/filtering-bar/FilteringBar";
import React, {useContext} from "react";

import {getTrailerFilter} from "app/features/filters/badges-and-selectors/fleet/trailer/trailerFilter.service";
import {getTruckerFilter} from "app/features/filters/badges-and-selectors/fleet/trucker/truckerFilter.service";
import {getVehicleFilter} from "app/features/filters/badges-and-selectors/fleet/vehicle/vehicleFilter.service";
import {SchedulerSettings} from "app/features/scheduler/carrier-scheduler/schedulerSettingsView.types";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {ResourcesQueryContext} from "app/screens/scheduler/hook/useResourcesQueryContext";

interface ResourcesFilteringBarProps {
    view: TripSchedulerView;
}

export function ResourcesFilteringBar({view}: ResourcesFilteringBarProps) {
    const {
        updateResourcesLocalFilters,
        resourcesLocalFilters,
        resetResourcesLocalFilters,
        resourcesViewFilters,
    } = useContext(ResourcesQueryContext);

    return (
        <FilteringBar<SchedulerSettings["resource_settings"]>
            filters={getResourcesFilters(view, resourcesViewFilters)}
            query={resourcesLocalFilters}
            updateQuery={updateResourcesLocalFilters}
            resetQuery={resetResourcesLocalFilters}
            size="small"
            data-testid="resources-filtering-bar"
        />
    );

    function getResourcesFilters(
        view: TripSchedulerView,
        resourcesViewFilter: SchedulerSettings["resource_settings"] | null
    ) {
        let filters: Array<FilterData<SchedulerSettings["resource_settings"]>> = [
            getTagFilter("fleet_tags__in", {
                id__in: resourcesViewFilter?.fleet_tags__in,
            }),
        ];
        switch (view) {
            case "trucker":
                filters.push(
                    getTruckerFilter({
                        id__in: resourcesViewFilter?.trucker__in,
                        tags__in: resourcesViewFilter?.fleet_tags__in ?? [],
                        hide_disabled: true,
                    })
                );
                break;
            case "vehicle":
                filters.push(
                    getVehicleFilter({
                        id__in: resourcesViewFilter?.vehicle__in,
                        tags__in: resourcesViewFilter?.fleet_tags__in ?? [],
                    })
                );
                break;
            case "trailer":
                filters.push(
                    getTrailerFilter({
                        id__in: resourcesViewFilter?.trailer__in,
                        tags__in: resourcesViewFilter?.fleet_tags__in ?? [],
                    })
                );
                break;
        }
        return filters;
    }
}
