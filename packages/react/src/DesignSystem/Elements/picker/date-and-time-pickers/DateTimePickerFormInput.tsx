import {TimezoneContext} from "@dashdoc/web-core";
import {DateTimePicker} from "@dashdoc/web-ui";
import {SiteSlot, parseAndZoneDate, formatDate, zoneDateToISO} from "dashdoc-utils";
import {set} from "date-fns";
import React, {useContext, useEffect, useState} from "react";

type Props = {
    onChange: (value: SiteSlot | undefined) => void;
    disabled?: boolean;
    value: SiteSlot | undefined | null;
    autoFocus: boolean;
};
export function DateTimePickerFormInput({onChange, disabled, value, autoFocus}: Props) {
    const timezone = useContext(TimezoneContext);
    const [date, setDate] = useState(parseAndZoneDate(value?.start ?? null, timezone));
    const [timeMin, setTimeMin] = useState<string | undefined>(
        value?.start ? formatDate(parseAndZoneDate(value?.start, timezone), "HH:mm") : undefined
    );
    const [timeMax, setTimeMax] = useState<string | undefined>(
        value?.end ? formatDate(parseAndZoneDate(value?.end, timezone), "HH:mm") : undefined
    );

    useEffect(() => {
        setDate(parseAndZoneDate(value?.start ?? null, timezone));
        setTimeMin(
            value?.start
                ? formatDate(parseAndZoneDate(value?.start, timezone), "HH:mm")
                : undefined
        );
        setTimeMax(
            value?.end ? formatDate(parseAndZoneDate(value?.end, timezone), "HH:mm") : undefined
        );
    }, [timezone, value]);

    return (
        <DateTimePicker
            blurOnArrowUpDown={true}
            date={date}
            fallbackInvalidDate={false}
            required
            timeMin={timeMin}
            timeMax={timeMax}
            onDateChange={handleChange}
            onTimeChange={handleTimeChange}
            disabled={disabled}
            autoFocus={autoFocus}
        />
    );

    function handleTimeChange(time: {min?: string; max?: string}) {
        handleChange(date, time.min, time.max);
    }

    function handleChange(
        date: Date | null,
        localTimeMin: string | undefined = timeMin,
        localTimeMax: string | undefined = timeMax
    ) {
        if (date === null) {
            return;
        }
        onChange(getISODates(date, localTimeMin, localTimeMax, timezone));
    }
}

export function getISODates(
    date: Date,
    localTimeMin: string | undefined,
    localTimeMax: string | undefined,
    timezone: string
) {
    const [startHours = "00", startMinutes = "00"] = localTimeMin ? localTimeMin.split(":") : [];
    const startDate = set(new Date(date), {
        hours: parseInt(startHours),
        minutes: parseInt(startMinutes),
    });

    const [endHours = "23", endMinutes = "59"] = localTimeMax ? localTimeMax.split(":") : [];
    const endDate = set(new Date(date), {
        hours: parseInt(endHours),
        minutes: parseInt(endMinutes),
    });

    return {
        start: zoneDateToISO(startDate, timezone),
        end: zoneDateToISO(endDate, timezone),
    };
}
