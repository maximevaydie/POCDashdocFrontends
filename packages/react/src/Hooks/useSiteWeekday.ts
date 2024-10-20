import {useSiteDate} from "hooks/useSiteDate";
import {useMemo} from "react";
import {getWeekday} from "services/date";

/**
 * Return the current site weekday based on the siteDate.
 */
export function useSiteWeekday() {
    const siteDate = useSiteDate();
    const weekday = useMemo(() => {
        return getWeekday(siteDate);
    }, [siteDate]);
    return weekday;
}
