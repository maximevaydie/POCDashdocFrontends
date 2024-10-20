import {useToday} from "@dashdoc/web-common";
import {DateRangePickerProps} from "@dashdoc/web-ui";
import {addDays, endOfDay, startOfDay} from "date-fns";
import {useMemo} from "react";

export function useSchedulerPeriodStaticRanges(): DateRangePickerProps["staticRanges"] {
    const today = useToday();
    return useMemo(() => getSchedulerPeriodStaticRanges(today), [today]);
}

function getSchedulerPeriodStaticRanges(today: Date): DateRangePickerProps["staticRanges"] {
    return {
        today: {
            label: "dateRangePicker.staticRange.from_d_to_d",
            range: {
                getStartDate: () => startOfDay(new Date(today)),
                getEndDate: () => endOfDay(new Date(today)),
            },
        },
        today_and_tomorrow: {
            label: "dateRangePicker.staticRange.from_d_to_d_plus_1",
            range: {
                getStartDate: () => startOfDay(new Date(today)),
                getEndDate: () => endOfDay(addDays(today, 1)),
            },
        },
        around_today: {
            label: "dateRangePicker.staticRange.from_d_minus_1_to_d_plus_1",
            range: {
                getStartDate: () => startOfDay(addDays(today, -1)),
                getEndDate: () => endOfDay(addDays(today, 1)),
            },
        },
        short_week: {
            label: "dateRangePicker.staticRange.from_d_minus_1_to_d_plus_3",
            range: {
                getStartDate: () => startOfDay(addDays(today, -1)),
                getEndDate: () => endOfDay(addDays(today, 3)),
            },
        },
        long_week: {
            label: "dateRangePicker.staticRange.from_d_minus_1_to_d_plus_6",
            range: {
                getStartDate: () => startOfDay(addDays(today, -1)),
                getEndDate: () => endOfDay(addDays(today, 6)),
            },
        },
    };
}
