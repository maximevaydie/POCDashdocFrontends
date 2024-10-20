import {PreselectedViews} from "@dashdoc/web-common";
import {createContext, useCallback, useMemo} from "react";

import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";
import {getDefaultSchedulerResourceSettings} from "app/features/scheduler/carrier-scheduler/hooks/useSchedulerViews";
import {
    SchedulerSettingsSchema,
    SchedulerSettingsView,
} from "app/features/scheduler/carrier-scheduler/schedulerSettingsView.types";
import useIsCarrier from "app/hooks/useIsCarrier";
import {useExtendedView} from "app/hooks/useExtendedView";
import {useDispatch} from "app/redux/hooks";
import {setExtendedView} from "app/redux/reducers/extended-view";
import {extendedViewService} from "app/services/core/extendedView.service";

type SchedulerViewContext = {
    viewPk: number | undefined;
    selectView: (view: SchedulerSettingsView | undefined) => void;
};
export const SchedulerViewContext = createContext<SchedulerViewContext>({
    viewPk: undefined,
    selectView: () => {},
});

export function useSchedulerViewContext(
    viewPk: number | undefined,
    updateSelectedViews: (value: PreselectedViews<"schedulerViewPk">) => void,
    updateQuery: (query: SchedulerFilters) => void
) {
    const dispatch = useDispatch();
    const isCarrier = useIsCarrier();
    const {canActivateExtendedView, extendedView} = useExtendedView();

    const selectView = useCallback(
        (view: SchedulerSettingsView | undefined) => {
            const resourceSettings = SchedulerSettingsSchema.parse(
                view?.settings
            ).resource_settings;
            updateQuery({
                ...getDefaultSchedulerResourceSettings(isCarrier),
                ...resourceSettings,
            });

            updateSelectedViews({schedulerViewPk: view?.pk});

            if (canActivateExtendedView && resourceSettings.extended_view !== extendedView) {
                dispatch(setExtendedView(resourceSettings.extended_view ?? false));
                extendedViewService.persistExtendedView(resourceSettings.extended_view ?? false);
            }
        },
        [
            canActivateExtendedView,
            dispatch,
            extendedView,
            isCarrier,
            updateQuery,
            updateSelectedViews,
        ]
    );

    const schedulerViewContext = useMemo(
        () => ({
            viewPk,
            selectView,
        }),
        [viewPk, selectView]
    );

    return schedulerViewContext;
}
