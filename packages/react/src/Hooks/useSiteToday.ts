import {useSiteTimezone} from "hooks/useSiteTimezone";
import {useRef} from "react";
import {isSameDay, startOfDay, tz} from "services/date";
import {TzDate} from "types";

/**
 * Hook to get the current day without triggering a re-render unnecessarily.
 * @returns The current date, in the user's timezone, at midnight.
 */
export function useSiteToday() {
    const timezone = useSiteTimezone();
    const today = tz.now(timezone);

    const memoizedToday = useRef<TzDate>(today);

    if (!isSameDay(memoizedToday.current, today)) {
        memoizedToday.current = startOfDay(today);
    }

    return memoizedToday.current;
}
