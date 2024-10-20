import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import React from "react";
import {useFormContext} from "react-hook-form";

import {DayCircle} from "./DayCircle";
import {OpeningHoursEditor} from "./OpeningHoursEditor";

import type {Weekday} from "types";

const days: Weekday[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

export function ZoneOpeningDays() {
    const {setValue, watch, control} = useFormContext();

    // Watch for changes in the 'opening_hours' field
    const openingHours = watch("opening_hours");
    const hasOpenDays = days.some((day) => openingHours[day]?.length > 0);

    return (
        <>
            <Flex>
                {days.map((day) => (
                    <DayCircle
                        label={getDayLabel(day)}
                        key={day}
                        open={openingHours[day]?.length > 0}
                        onClick={() => handleDayClick(day)}
                    />
                ))}
            </Flex>
            {hasOpenDays && (
                <Text variant="h1" color="grey.dark" marginTop={6}>
                    {t("flow.settings.zoneSetupTab.openingHoursSection")}
                </Text>
            )}
            <Box marginTop={2} overflow={"scroll"} maxHeight="40vh">
                {days.map(
                    (day) =>
                        openingHours[day]?.length > 0 && (
                            <OpeningHoursEditor
                                key={day}
                                day={day}
                                control={control}
                                times={openingHours[day]}
                                onTimesChange={(newTimes) =>
                                    setValue(`opening_hours.${day}`, newTimes)
                                }
                            />
                        )
                )}
            </Box>
        </>
    );

    function handleDayClick(day: Weekday) {
        const isOpen = openingHours[day]?.length > 0;
        const valueToSet = isOpen ? [] : [["08:00", "18:00"]];
        setValue(`opening_hours.${day}`, valueToSet, {shouldDirty: true});
    }

    function getDayLabel(day: Weekday) {
        const labels: Record<Weekday, string> = {
            monday: t("common.monday"),
            tuesday: t("common.tuesday"),
            wednesday: t("common.wednesday"),
            thursday: t("common.thursday"),
            friday: t("common.friday"),
            saturday: t("common.saturday"),
            sunday: t("common.sunday"),
        };
        return labels[day].charAt(0).toUpperCase();
    }
}
