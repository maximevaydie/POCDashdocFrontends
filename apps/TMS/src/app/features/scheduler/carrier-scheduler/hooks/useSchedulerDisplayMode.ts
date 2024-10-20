import {useDevice} from "@dashdoc/web-ui";
import {SetStateAction, useCallback, useState} from "react";
import createPersistedState from "use-persisted-state";

import {CharteringView} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {DedicatedResourcesView} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

const PREDEFINED_SCHEDULER_DISPLAY_SETTINGS_STORAGE_KEY = "scheduler.displayMode";
const predefinedDisplaySettingsState = createPersistedState(
    PREDEFINED_SCHEDULER_DISPLAY_SETTINGS_STORAGE_KEY
);

type SchedulerDisplaySettings = {
    isPoolVisible: boolean;
    isSchedulerVisible: boolean;
    poolWidth: string | undefined;
};

export function useSchedulerDisplayMode(
    resourceType: TripSchedulerView | CharteringView | DedicatedResourcesView | undefined
) {
    const device = useDevice();
    const [predefinedDisplaySettings, setPredefinedDisplaySettings] =
        predefinedDisplaySettingsState<SchedulerDisplaySettings>({
            isPoolVisible: device === "mobile" ? false : true,
            isSchedulerVisible: true,
            poolWidth: undefined,
        });

    const [displaySettings, setDisplaySettings] = useState<SchedulerDisplaySettings>(
        predefinedDisplaySettings
    );

    const updateDisplaySettings = useCallback(
        (value: SchedulerDisplaySettings | SetStateAction<SchedulerDisplaySettings>) => {
            setDisplaySettings(value);
            setPredefinedDisplaySettings(value);
        },
        [setPredefinedDisplaySettings]
    );

    const updatePoolVisibility = useCallback(
        (value: boolean) => {
            updateDisplaySettings((prev) => ({
                ...prev,
                isPoolVisible: value,
                isSchedulerVisible: !value ? true : prev.isSchedulerVisible,
            }));
        },
        [updateDisplaySettings]
    );
    const updateSchedulerVisibility = useCallback(
        (value: boolean) => {
            updateDisplaySettings((prev) => ({
                ...prev,
                isSchedulerVisible: value,
                isPoolVisible: !value ? true : prev.isPoolVisible,
            }));
        },
        [updateDisplaySettings]
    );

    const savePoolWidth = useCallback(
        (width: string) => {
            updateDisplaySettings((prev) => ({...prev, poolWidth: width}));
        },
        [updateDisplaySettings]
    );

    return {
        isPoolOfUnplannedDisplayed:
            (resourceType !== "chartering" && displaySettings.isPoolVisible) ||
            !displaySettings.isSchedulerVisible,
        isSchedulerDisplayed:
            resourceType === "chartering" ||
            displaySettings.isSchedulerVisible ||
            !displaySettings.isPoolVisible,
        poolWidth: displaySettings.poolWidth,
        updatePoolVisibility,
        updateSchedulerVisibility,
        savePoolWidth,
    };
}
