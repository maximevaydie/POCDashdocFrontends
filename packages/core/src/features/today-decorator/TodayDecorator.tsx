import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import {useSiteTime} from "hooks/useSiteTime";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import {isSameDay, tz} from "services/date";
import {TzDate} from "types";

export function TodayDecorator({startTime}: {startTime: string | TzDate}) {
    const timezone = useSiteTimezone();
    const siteTime = useSiteTime();
    if (startTime) {
        let startDate: TzDate;
        if (typeof startTime === "string") {
            startDate = tz.convert(startTime, timezone);
        } else {
            startDate = startTime;
        }
        if (isSameDay(startDate, siteTime)) {
            return <Text variant="h2" color="blue.default">{`(${t("common.today")})`}</Text>;
        }
    }

    return null;
}
