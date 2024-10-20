import {t} from "@dashdoc/web-core";
import {ClickableBox, Flex, IconButton, Popover, SwitchInput, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {SchedulerDisplayTimeRangeModal} from "app/features/scheduler/carrier-scheduler/components/settings/display-time-range/SchedulerDisplayTimeRangeModal";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {useSchedulerTimeAndDays} from "app/screens/scheduler/hook/useSchedulerTimeAndDays";

import {SchedulerSettingsModal} from "./settings-modal/SchedulerSettingsModal";

export function SchedulerSettingsButton() {
    const [isSettingsOpen, openSettings, closeSettings] = useToggle();
    const [isTimeRangeEditionOpen, openTimeRangeEdition, closeTimeRangeEdition] = useToggle();
    const isSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    const {hideSaturdays, hideSundays, timeRange, setHideSaturdays, setHideSundays} =
        useSchedulerTimeAndDays();
    return (
        <>
            <Popover>
                <Popover.Trigger>
                    <IconButton name="cog" data-testid="scheduler-settings-button" />
                </Popover.Trigger>
                <Popover.Content>
                    <ClickableBox p={2} onClick={openSettings} data-testid="edit-views-button">
                        <Text>{t("scheduler.settings.title")}</Text>
                    </ClickableBox>
                    {isSchedulerByTimeEnabled && (
                        <ClickableBox
                            p={2}
                            onClick={openTimeRangeEdition}
                            data-testid="edit-time-range-button"
                        >
                            <Flex alignItems="center" justifyContent="space-between" width="100%">
                                <Text mr={5}>{t("scheduler.displayTimeRange")}</Text>
                                {timeRange ? (
                                    <Text color="grey.dark">
                                        {timeRange.start} - {timeRange.end}
                                    </Text>
                                ) : (
                                    // eslint-disable-next-line react/jsx-no-literals
                                    <Text color="grey.dark">00:00 - 23:59</Text>
                                )}
                            </Flex>
                        </ClickableBox>
                    )}
                    <Flex p={2} justifyContent="space-between" width="100%">
                        <Text mr={5}>{t("scheduler.hideSaturdays")}</Text>
                        <SwitchInput
                            value={hideSaturdays}
                            onChange={setHideSaturdays}
                            data-testid="hide-saturdays-switch"
                        />
                    </Flex>
                    <Flex p={2} justifyContent="space-between" width="100%">
                        <Text mr={5}>{t("scheduler.hideSundays")}</Text>
                        <SwitchInput
                            value={hideSundays}
                            onChange={setHideSundays}
                            data-testid="hide-sundays-switch"
                        />
                    </Flex>
                </Popover.Content>
            </Popover>

            {isSettingsOpen && <SchedulerSettingsModal onClose={closeSettings} />}
            {isTimeRangeEditionOpen && (
                <SchedulerDisplayTimeRangeModal onClose={closeTimeRangeEdition} />
            )}
        </>
    );
}
