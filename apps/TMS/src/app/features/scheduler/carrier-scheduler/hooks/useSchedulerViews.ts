import {useSettingsViews} from "@dashdoc/web-common/src/features/filters/filtering-bar/hooks/useSettingsViews";

import {
    SchedulerSettings,
    SchedulerSettingsView,
} from "app/features/scheduler/carrier-scheduler/schedulerSettingsView.types";

export function useSchedulerViews() {
    return useSettingsViews(["scheduler"]) as SchedulerSettingsView[];
}

export const getDefaultSchedulerResourceSettings = (
    isCarrier: boolean
): SchedulerSettings["resource_settings"] => {
    const view = isCarrier ? "trucker" : "chartering";
    return {
        trucker__in: [],
        vehicle__in: [],
        trailer__in: [],
        carrier__in: [],
        fleet_tags__in: [],
        view,
        ordering_truckers: "user",
        ordering_vehicles: "license_plate",
        ordering_trailers: "license_plate",
    };
};
