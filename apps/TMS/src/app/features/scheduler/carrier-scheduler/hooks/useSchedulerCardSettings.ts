import {settingsViewSelector} from "@dashdoc/web-common/src/redux/reducers/settingsViewsReducer";
import {useContext} from "react";

import {SchedulerSettingsView} from "app/features/scheduler/carrier-scheduler/schedulerSettingsView.types";
import {useSelector} from "app/redux/hooks";
import {DEFAULT_SCHEDULER_CARD_SETTINGS} from "app/redux/selectors/manager";
import {SchedulerViewContext} from "app/screens/scheduler/hook/view/useSchedulerViewContext";

export function useSchedulerCardSettings() {
    const {viewPk: schedulerViewPk} = useContext(SchedulerViewContext);
    const schedulerView = useSelector(
        (state) => settingsViewSelector(state, schedulerViewPk) as SchedulerSettingsView
    );
    const viewSchedulerCardDisplaySettings =
        schedulerView?.settings?.card_display_settings ?? DEFAULT_SCHEDULER_CARD_SETTINGS;

    let schedulerCardSettings = viewSchedulerCardDisplaySettings;

    /* This is useful when adding a new setting to the card settings.
        To avoid doing a migration for existing managers, the new setting will
        be initially read from this constant.
    **/
    return {
        ...DEFAULT_SCHEDULER_CARD_SETTINGS,
        ...schedulerCardSettings,
    };
}
