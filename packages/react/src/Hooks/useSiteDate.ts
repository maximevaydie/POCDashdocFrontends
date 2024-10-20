import {useSiteTimezone} from "hooks/useSiteTimezone";
import {useMemo} from "react";
import {useSelector} from "redux/hooks";
import {selectStartDate} from "redux/reducers/flow";
import {tz} from "services/date";

/**
 * Return the current site date based on the filters.start.
 */
export function useSiteDate() {
    const timezone = useSiteTimezone();
    const date = useSelector(selectStartDate);
    const startDate = useMemo(() => {
        if (date === null) {
            return null;
        }
        return tz.convert(date, timezone);
    }, [date, timezone]);
    return startDate;
}
