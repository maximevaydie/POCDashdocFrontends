import {TimezoneProvider} from "@dashdoc/web-core";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";

type Props = {
    children: React.ReactNode;
};
export function SiteTimezoneProvider({children}: Props) {
    const timezone = useSiteTimezone();
    return <TimezoneProvider timezone={timezone}>{children}</TimezoneProvider>;
}
