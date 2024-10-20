import {Box} from "@dashdoc/web-ui";
import {startOfDay, eachMinuteOfInterval, isEqual} from "date-fns";
import React, {useMemo} from "react";

import {TIME_CELL_WIDTH} from "../../gridStyles";

export const DatesGrid = React.memo(function DatesGrid({
    start,
    end,
    minuteScale,
    resourceUid,
    onCellRightClick,
}: {
    start: Date;
    end: Date;
    minuteScale: number; // scale in minutes
    resourceUid: string;
    onCellRightClick?: (event: MouseEvent, resourceUid: string, day: Date) => void;
}) {
    const dates = useMemo(() => {
        return eachMinuteOfInterval({start, end}, {step: minuteScale});
    }, [start, end, minuteScale]);

    return (
        <>
            {dates.map((date, index) => {
                const isNextANewDay = isNextDateANewDay(index);
                return (
                    <Box
                        key={`${resourceUid}-${index}`}
                        id={`${resourceUid}-${index}`}
                        onContextMenu={(ev: any) => {
                            if (onCellRightClick) {
                                ev.preventDefault();
                                onCellRightClick(ev, resourceUid, date);
                            }
                        }}
                        borderRight={
                            isNextANewDay
                                ? "2px solid"
                                : index % 2 === 1
                                  ? "1px solid"
                                  : "1px dashed"
                        }
                        borderColor={"grey.default"}
                        height="100%"
                        width={`${TIME_CELL_WIDTH}px`}
                        backgroundColor={
                            [0, 1].includes(index % 4) ? "grey.lighter" : "grey.white"
                        }
                        position="relative"
                    >
                        <Box height="100%" borderBottom="1px solid" borderColor="grey.light" />
                    </Box>
                );
            })}
        </>
    );

    function isNextDateANewDay(index: number) {
        return index + 1 < dates.length && isEqual(startOfDay(dates[index + 1]), dates[index + 1]);
    }
});
