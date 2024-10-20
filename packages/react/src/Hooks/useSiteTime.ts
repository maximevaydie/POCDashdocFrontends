import {BrowserTimeContext} from "@dashdoc/web-core";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import {useContext} from "react";
import {tz} from "services/date";

export function useSiteTime() {
    const timezone = useSiteTimezone();
    const browserTime = useContext(BrowserTimeContext);
    const siteTime = tz.convert(browserTime, timezone);
    return siteTime;
}
