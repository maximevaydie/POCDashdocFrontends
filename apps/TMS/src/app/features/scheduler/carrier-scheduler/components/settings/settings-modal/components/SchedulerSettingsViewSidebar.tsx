import {
    createSettingsView,
    deleteSettingsView,
    settingsViewsAddingSelector,
} from "@dashdoc/web-common/src/redux/reducers/settingsViewsReducer";
import {t} from "@dashdoc/web-core";
import {Box, Button, ClickableFlex, IconButton, Text} from "@dashdoc/web-ui";
import React, {useContext, useEffect} from "react";

import {
    getDefaultSchedulerResourceSettings,
    useSchedulerViews,
} from "app/features/scheduler/carrier-scheduler/hooks/useSchedulerViews";
import {SchedulerSettingsView} from "app/features/scheduler/carrier-scheduler/schedulerSettingsView.types";
import useIsCarrier from "app/hooks/useIsCarrier";
import {useDispatch, useSelector} from "app/redux/hooks";
import {DEFAULT_SCHEDULER_CARD_SETTINGS} from "app/redux/selectors/manager";
import {SchedulerViewContext} from "app/screens/scheduler/hook/view/useSchedulerViewContext";

export function SchedulerSettingsViewSidebar({
    selectedViewPk,
    setSelectedView,
}: {
    selectedViewPk: number | undefined;
    setSelectedView: (view: SchedulerSettingsView | undefined) => void;
}) {
    const dispatch = useDispatch();
    const views = useSchedulerViews();
    const isCarrier = useIsCarrier();
    const {selectView} = useContext(SchedulerViewContext);
    const isAddingSettingsView = useSelector(settingsViewsAddingSelector);
    useEffect(() => {
        if (!selectedViewPk && views.length > 0) {
            setSelectedView(views[0]);
        }
    }, [selectedViewPk, setSelectedView, views]);

    return (
        <Box borderRight="1px solid" borderColor="grey.light" width="100%" pr={1} overflowY="auto">
            <Text variant="h1" padding={2}>
                {t("filter.views")}
            </Text>

            {views.map((view) => (
                <ClickableFlex
                    key={view.pk}
                    px={2}
                    py={1}
                    justifyContent="space-between"
                    alignItems="center"
                    backgroundColor={view.pk === selectedViewPk ? "grey.light" : undefined}
                    onClick={() => {
                        setSelectedView(view);
                    }}
                >
                    <Text ellipsis color={view.pk === selectedViewPk ? "blue.default" : undefined}>
                        {view.label}
                    </Text>
                    {views.length > 1 && (
                        <Box
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <IconButton
                                data-testid={`delete-view-${view.label}`}
                                name="delete"
                                onClick={() => {
                                    deleteView(view.pk);
                                }}
                                withConfirmation
                                confirmationMessage={t("filter.deleteView.confirmation")}
                                modalProps={{
                                    title: t("filter.deleteView"),
                                    mainButton: {
                                        "data-testid": "settings-view-delete-confirm",
                                        severity: "danger",
                                        children: t("common.delete"),
                                    },
                                    secondaryButton: {},
                                }}
                            />
                        </Box>
                    )}
                </ClickableFlex>
            ))}
            <Button
                variant="plain"
                onClick={addNewView}
                paddingX={2}
                width="100%"
                disabled={isAddingSettingsView}
                data-testid="add-scheduler-settings-view"
            >
                <Text ellipsis color="inherit" mr="auto">
                    {t("schedulerSettings.addView")}
                </Text>
            </Button>
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
        const {payload: addedView} = await dispatch(createSettingsView(viewToAdd));
        if (addedView) {
            setSelectedView(addedView);
        }
    }
    function deleteView(viewPk: number) {
        if (selectedViewPk === viewPk) {
            const remainingViews = views.filter((v) => v.pk !== viewPk);
            setSelectedView(remainingViews.length > 0 ? remainingViews[0] : undefined);
            selectView(remainingViews.length > 0 ? remainingViews[0] : undefined);
        }
        dispatch(
            deleteSettingsView({
                id: viewPk,
            })
        );
    }
}
