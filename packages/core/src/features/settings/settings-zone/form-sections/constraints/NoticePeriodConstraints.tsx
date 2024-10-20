import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Input, NumberInput, Radio, SwitchInput, Text} from "@dashdoc/web-ui";
import React from "react";
import {Controller, useFormContext} from "react-hook-form";
import {defaultNoticePeriodMode} from "types";

/**
 * Component to define (or not) a period of time before the booking time where the booking is not allowed.
 * There are two modes:
 *
 * **rolling hours window** for the current way of doing
 * - 24 hours before (relative to the booking time)
 *
 * **relative datetime** for the new way of doing
 * - 1 day before at 18:00 (relative to the booking time)
 */
export function NoticePeriodConstraints() {
    const {watch} = useFormContext();

    const notice_period_mode: "rolling_hours_window" | "relative_datetime" | null =
        watch("notice_period_mode");

    let noticePeriodFields = null;
    if (notice_period_mode !== null) {
        noticePeriodFields = (
            <Box my={2} ml={2} pl={6} borderLeft={"1px solid"} borderLeftColor="grey.light">
                <RelativeDateTime />
                <RollingHoursWindow />
            </Box>
        );
    }

    const noticePeriodModeLabel = (
        <Flex>{t("flow.settings.zoneSetupTab.bookingConstraints.closing")}</Flex>
    );
    return (
        <Box>
            <Flex mt={3}>
                <Controller
                    name="notice_period_mode"
                    render={({field}) => (
                        <SwitchInput
                            {...field}
                            labelRight={noticePeriodModeLabel}
                            value={notice_period_mode !== null}
                            onChange={(values) => {
                                if (values) {
                                    field.onChange(defaultNoticePeriodMode);
                                } else {
                                    field.onChange(null);
                                }
                            }}
                        />
                    )}
                />
            </Flex>
            {noticePeriodFields}
        </Box>
    );
}

/**
 * The period is closed at a specific time
 * Example: 1 day before at 18:00 (relative to the booking time)
 */
function RelativeDateTime() {
    const {watch} = useFormContext();
    const notice_period_days_before_booking: number | null = watch(
        "notice_period_days_before_booking"
    );
    const notice_period_time_of_day: string | null = watch("notice_period_time_of_day");
    const notice_period_mode: "rolling_hours_window" | "relative_datetime" | null =
        watch("notice_period_mode");
    const active = notice_period_mode === "relative_datetime";
    const [hours, minutes] = notice_period_time_of_day?.split(":") ?? [null, null];
    return (
        <Box>
            <Controller
                name="notice_period_mode"
                render={({field}) => (
                    <Radio
                        {...field}
                        value="relative_datetime"
                        label={t("common.fixedDateAndTime")}
                        checked={active}
                    />
                )}
            />
            {active && (
                <Box mb={4}>
                    <Flex width="100%" alignItems="center">
                        <Controller
                            name="notice_period_days_before_booking"
                            render={({field}) => (
                                <Box flexGrow={1}>
                                    <NumberInput
                                        {...field}
                                        width="100%"
                                        aria-label={t(
                                            "flow.settings.zoneSetupTab.bookingConstraints.numberOfDayPriorToBooking"
                                        )}
                                        label={t(
                                            "flow.settings.zoneSetupTab.bookingConstraints.numberOfDayPriorToBooking"
                                        )}
                                        data-testid="settings-zones-notice-period"
                                        required
                                        min={0}
                                        value={
                                            notice_period_days_before_booking !== null
                                                ? notice_period_days_before_booking
                                                : 0
                                        }
                                    />
                                </Box>
                            )}
                        />
                        <Text color="grey.dark" mx={4} mt={1}>
                            {t("common.at")}
                        </Text>
                        <Controller
                            name="notice_period_time_of_day"
                            render={({field}) => (
                                <Box flexGrow={1}>
                                    <Input
                                        {...field}
                                        type="time"
                                        aria-label={t("common.time")}
                                        label={t("common.time")}
                                        value={notice_period_time_of_day ?? ""}
                                        onChange={(
                                            _,
                                            eEvent: React.ChangeEvent<HTMLInputElement>
                                        ) => {
                                            const [hours, minutes] =
                                                eEvent.target.value.split(":");
                                            if (hours !== undefined && minutes !== undefined) {
                                                // save in the state only valid values
                                                field.onChange(eEvent.target.value);
                                            }
                                        }}
                                        required
                                    />
                                </Box>
                            )}
                        />
                    </Flex>
                    {notice_period_days_before_booking !== null &&
                        hours !== undefined &&
                        hours !== null &&
                        minutes !== undefined &&
                        minutes !== null && (
                            <Callout mt={2}>
                                {t("flow.settings.zoneSetupTab.pluralizedRelativeDateTimeDetail", {
                                    smart_count: notice_period_days_before_booking,
                                    days_before_booking: notice_period_days_before_booking,
                                    hours,
                                    minutes,
                                })}
                            </Callout>
                        )}
                </Box>
            )}
        </Box>
    );
}

/**
 * The period rolls according to the booking time and the selected hours window.
 * Example: 24 hours before (relative to the booking time)
 */
function RollingHoursWindow() {
    const {watch} = useFormContext();
    const notice_period_mode: "rolling_hours_window" | "relative_datetime" | null =
        watch("notice_period_mode");
    const notice_period: number | null = watch("notice_period");

    const active = notice_period_mode === "rolling_hours_window";
    return (
        <Box>
            <Controller
                name="notice_period_mode"
                render={({field}) => (
                    <Radio
                        {...field}
                        value="rolling_hours_window"
                        label={t("common.rollingHours")}
                        checked={active}
                    />
                )}
            />
            {active && (
                <>
                    <Controller
                        name="notice_period"
                        render={({field}) => (
                            <NumberInput
                                {...field}
                                units={t("common.hours")}
                                width="100%"
                                aria-label={t("flow.settings.zoneSetupTab.noticePeriod")}
                                label={t("flow.settings.zoneSetupTab.noticePeriod")}
                                data-testid="settings-zones-notice-period"
                                required
                                min={1}
                            />
                        )}
                    />
                    {notice_period !== null && notice_period > 0 && (
                        <Callout mt={2}>
                            {t("flow.settings.zoneSetupTab.rollingHoursDetail", {
                                hours: notice_period,
                            })}
                        </Callout>
                    )}
                </>
            )}
        </Box>
    );
}
