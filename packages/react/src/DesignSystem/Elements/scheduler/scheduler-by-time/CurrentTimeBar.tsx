import {BrowserTimeContext, TimezoneContext} from "@dashdoc/web-core";
import {parseAndZoneDate} from "dashdoc-utils";
import sumBy from "lodash.sumby";
import React, {useContext, useEffect, useRef} from "react";

import {Box} from "../../layout/Box";
import {COLLAPSED_TIME_WIDTH} from "../gridStyles";

import {schedulerDatesService} from "./service/dates.service";

type Props = {
    dateSections: Array<{start: Date; end: Date}>;
    minuteScale: number; // scale in minutes
    offset?: number;
};
export function CurrentTimeBar({dateSections, minuteScale, offset = 0}: Props) {
    const timezone = useContext(TimezoneContext);
    const browserTime = useContext(BrowserTimeContext);
    const zonedBrowserTime = parseAndZoneDate(browserTime, timezone);
    const sectionIndex = schedulerDatesService.getSectionIndex(dateSections, zonedBrowserTime);
    const displayCurrentTime = sectionIndex > -1;

    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (displayCurrentTime) {
            ref.current?.scrollIntoView({inline: "center"});
        }
    }, [displayCurrentTime]);
    if (!displayCurrentTime) {
        return null;
    }
    return (
        <Box
            ref={ref}
            height="calc(100% + 1px)"
            position="absolute"
            marginLeft={getMarginLeft()}
            borderLeft="1px solid"
            color="purple.default"
            zIndex="level3"
        />
    );

    function getMarginLeft() {
        if (!displayCurrentTime) {
            return 0;
        }
        const previousSectionsWidth = sumBy(
            dateSections.slice(0, sectionIndex),
            (dateSection) =>
                schedulerDatesService.getDayWidth(
                    dateSection.start,
                    dateSection.end,
                    minuteScale
                ) + COLLAPSED_TIME_WIDTH
        );
        const marginInsideSection = schedulerDatesService.getRowWidth(
            dateSections[sectionIndex].start,
            zonedBrowserTime,
            minuteScale
        );

        return offset + previousSectionsWidth + marginInsideSection;
    }
}
