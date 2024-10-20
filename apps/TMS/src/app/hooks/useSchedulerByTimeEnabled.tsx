import {getGroupViewSettings} from "@dashdoc/web-common";

import {useSelector} from "app/redux/hooks";

export function useSchedulerByTimeEnabled() {
    const hasSchedulerByTimeSettingEnabled = useSelector(
        (state) => getGroupViewSettings(state)?.scheduler_by_time || false
    );
    return hasSchedulerByTimeSettingEnabled;
}
