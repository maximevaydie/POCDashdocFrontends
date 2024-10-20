import {parseAndZoneDate} from "dashdoc-utils";
import isSameDay from "date-fns/isSameDay";
import startOfDay from "date-fns/startOfDay";
import {useRef} from "react";

import {useTimezone} from "./useTimezone";

/**
 * Hook to get the current day without triggering a re-render unnecessarily.
 * @returns The current date, in the user's timezone, at midnight.
 */
export function useToday() {
    const timezone = useTimezone();
    const today = parseAndZoneDate(new Date(), timezone) as Date;

    const memoizedToday = useRef<Date>(today);

    if (!isSameDay(memoizedToday.current, today)) {
        memoizedToday.current = startOfDay(today);
    }

    return memoizedToday.current;
}
