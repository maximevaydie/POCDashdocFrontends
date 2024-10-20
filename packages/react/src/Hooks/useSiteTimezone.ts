import {BROWSER_TIMEZONE} from "@dashdoc/web-core";
import {createSelector} from "@reduxjs/toolkit";
import {useSelector} from "redux/reducers/flow";
import {selectSite} from "redux/reducers/flow/site.slice";

const selectSiteTimezone = createSelector(selectSite, (site): string => {
    let result = BROWSER_TIMEZONE;
    if (site?.timezone) {
        result = site.timezone;
    }
    return result;
});

export function useSiteTimezone() {
    const timezone = useSelector(selectSiteTimezone);
    return timezone;
}
