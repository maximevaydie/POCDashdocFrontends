import {t} from "@dashdoc/web-core";
import {
    Text,
    Box,
    SwitchInput,
    DatePicker,
    NumberInput,
    TooltipWrapper,
    Icon,
    Flex,
} from "@dashdoc/web-ui";
import React from "react";
import {Controller, useFormContext} from "react-hook-form";
import {z} from "zod";

import {START_HOUR, ACTIVITY_DURATION_IN_MINUTES} from "app/features/optimization/constants";

export const timeFormSchema = z.object({
    fillScheduledDates: z.boolean(),
    startDatetime: z.date(),
    activityDuration: z.number().int().min(0),
});

type TimeFormType = z.infer<typeof timeFormSchema>;

export function getTimeDefaultValues(today: Date): TimeFormType {
    const startDatetime = new Date(today);
    startDatetime.setHours(START_HOUR, 0, 0);

    return {
        fillScheduledDates: true,
        startDatetime,
        activityDuration: ACTIVITY_DURATION_IN_MINUTES,
    };
}

export function TimeFormSection() {
    const form = useFormContext();
    const fillScheduledDates = form.watch("fillScheduledDates");

    return (
        <Box mt={3}>
            <Text variant="h1" mb={4}>
                {t("optimization.hoursManagement")}
            </Text>
            <Box mb={3}>
                <Controller
                    name="fillScheduledDates"
                    render={({field: {value, onChange}}) => (
                        <SwitchInput
                            labelRight={t("optimization.fillScheduledDates")}
                            value={value}
                            onChange={onChange}
                            data-testid="switch-fill-scheduled-dates"
                        />
                    )}
                />
            </Box>

            {fillScheduledDates && (
                <Box>
                    <Text variant="h2" mb={2}>
                        {t("optimization.startDatetime")}
                    </Text>
                    <Controller
                        name="startDatetime"
                        render={({field: {ref: _ref, ...field}, fieldState: {error}}) => {
                            const {value, ...otherField} = field;
                            return (
                                <DatePicker
                                    {...otherField}
                                    date={value}
                                    clearable={false}
                                    showTime
                                    rootId="react-app-modal-root"
                                    data-testid="start-datetime"
                                    error={error?.message}
                                    label={t("optimization.day2")}
                                    timeLabel={t("optimization.startTime")}
                                    timeWidth={295}
                                />
                            );
                        }}
                    />
                    <Flex alignItems="center" mt={2}>
                        <Box flexBasis="100%">
                            <Controller
                                name="activityDuration"
                                render={({field: {ref: _ref, ...field}, fieldState: {error}}) => (
                                    <NumberInput
                                        {...field}
                                        onTransientChange={field.onChange}
                                        min={0}
                                        units={t("common.minute", {
                                            smart_count: field.value ?? 2,
                                        })}
                                        label={t("optimization.defaultOnSiteDuration")}
                                        error={error?.message}
                                        data-testid="activity-duration"
                                    />
                                )}
                            />
                        </Box>
                        <TooltipWrapper
                            content={`${t("optimization.defaultOnSiteDurationUtility")}\n\n${t(
                                "optimization.defineOnSiteDuration"
                            )}`}
                        >
                            <Icon name="info" ml={3} />
                        </TooltipWrapper>
                    </Flex>
                </Box>
            )}
        </Box>
    );
}
