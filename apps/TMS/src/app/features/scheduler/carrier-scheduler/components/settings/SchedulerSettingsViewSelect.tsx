import {
    createSettingsView,
    settingsViewSelector,
} from "@dashdoc/web-common/src/redux/reducers/settingsViewsReducer";
import {Logger, t} from "@dashdoc/web-core";
import {Box, CreatableSelect, Icon, theme} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useContext, useEffect} from "react";

import {useSchedulerViews} from "app/features/scheduler/carrier-scheduler/hooks/useSchedulerViews";
import {getDefaultSchedulerResourceSettings} from "app/features/scheduler/carrier-scheduler/hooks/useSchedulerViews";
import {SchedulerSettingsView} from "app/features/scheduler/carrier-scheduler/schedulerSettingsView.types";
import useIsCarrier from "app/hooks/useIsCarrier";
import {useDispatch, useSelector} from "app/redux/hooks";
import {DEFAULT_SCHEDULER_CARD_SETTINGS} from "app/redux/selectors/manager";
import {SchedulerViewContext} from "app/screens/scheduler/hook/view/useSchedulerViewContext";

import {SchedulerSettingsModal} from "./settings-modal/SchedulerSettingsModal";

export function SchedulerSettingsViewSelect() {
    const dispatch = useDispatch();
    const [isSettingsOpen, openSettings, closeSettings] = useToggle();
    const views = useSchedulerViews();
    const {viewPk, selectView} = useContext(SchedulerViewContext);

    const schedulerView = useSelector(
        (state) => settingsViewSelector(state, viewPk) as SchedulerSettingsView
    );
    useEffect(() => {
        if (!schedulerView && views.length > 0) {
            selectView(views[0]);
        }
    }, [selectView, schedulerView, views]);
    const isCarrier = useIsCarrier();

    return (
        <Box flex={1} minWidth={"60px"} maxWidth={"242px"}>
            <CreatableSelect<SchedulerSettingsView>
                data-testid="scheduler-settings-view-select"
                options={views}
                value={schedulerView}
                onChange={(view: SchedulerSettingsView) => {
                    selectView(view);
                }}
                isClearable={false}
                getOptionValue={(view) => `${view.pk}`}
                getOptionLabel={(view) => view.label}
                onCreateOption={addNewView}
                createOptionPosition="last"
                isValidNewOption={() => true}
                formatCreateLabel={() => t("schedulerSettings.addView")}
                placeholder={t("settingsView.default")}
                styles={{
                    container: (base) => ({
                        ...base,
                        height: "41px",
                        paddingRight: 0,
                        paddingLeft: 0,
                    }),

                    control: (base) => ({
                        ...base,
                        height: "inherit",
                    }),
                    menu: (base) => ({
                        ...base,
                        minWidth: "150px",
                        zIndex: theme.zIndices.filteringBar,
                    }),
                    indicatorSeparator: (base) => ({
                        ...base,
                        display: "none",
                    }),
                }}
                components={{
                    DropdownIndicator: () => <Icon name="arrowDown" scale={0.6} mx={1} />,
                }}
            />

            {isSettingsOpen && <SchedulerSettingsModal onClose={closeSettings} />}
        </Box>
    );

    async function addNewView() {
        const viewToAdd: Omit<SchedulerSettingsView, "pk"> = {
            label: t("settingsView.new"),
            category: "scheduler",
            settings: {
                resource_settings: getDefaultSchedulerResourceSettings(isCarrier),
                card_display_settings: DEFAULT_SCHEDULER_CARD_SETTINGS,
            },
        };

        try {
            const {payload: addedView} = await dispatch(createSettingsView(viewToAdd));
            selectView(addedView);
            openSettings();
        } catch (error) {
            Logger.error(error);
        }
    }
}
