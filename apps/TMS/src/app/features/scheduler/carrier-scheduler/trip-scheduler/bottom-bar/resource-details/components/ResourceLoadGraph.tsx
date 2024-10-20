import {useTimezone} from "@dashdoc/web-common";
import {Box, ChartTimelineRow, TimelineChart, theme, Card, Flex} from "@dashdoc/web-ui";
import {DatesGrid} from "@dashdoc/web-ui/src/scheduler/scheduler-by-time/row/DatesGrid";
import sortBy from "lodash.sortby";
import React from "react";

import {getActivityDatesDisplay} from "app/features/scheduler/carrier-scheduler/components/card-content/card-sections/activities/by-day/SiteDate";
import {getLoadQuantityFromActivity} from "app/features/trip/trip.service";
import {CompactTrip, SimilarActivity} from "app/features/trip/trip.types";

type Props = {
    trips: CompactTrip[];
    startDate: Date;
    endDate: Date;
    minutesPerCell: number;
    selectedUnit: "weight" | "volume" | "linear_meters" | "quantity";
    unitLabel: string | undefined;
};
export function ResourceLoadGraph({
    trips,
    startDate,
    endDate,
    minutesPerCell,
    selectedUnit,
    unitLabel,
}: Props) {
    const timezone = useTimezone();
    const activities = sortBy(
        trips.flatMap((trip) => trip.activities),
        (activity) => getActivityDatesDisplay(activity, timezone).start
    );
    const rows: ChartTimelineRow[] = activities.reduce(
        (acc: ChartTimelineRow[], activity: SimilarActivity) => {
            const previousQuantity = acc.length > 0 ? acc[acc.length - 1].values[0] : 0;
            const [total, loaded, unloaded] = getLoadQuantityFromActivity(
                activity,
                previousQuantity,
                selectedUnit
            );
            const newValue = {
                date: getActivityDatesDisplay(activity, timezone).start,
                values: [total],
                loaded,
                unloaded,
            };
            if (acc.length > 0) {
                return [
                    ...acc,
                    {
                        ...acc[acc.length - 1],
                        date: getActivityDatesDisplay(activity, timezone).start,
                    },
                    newValue,
                ] as ChartTimelineRow[];
            }
            return [newValue] as ChartTimelineRow[];
        },
        []
    );

    return (
        <Box height="90px" position="relative" width="calc(100% +4px)" ml={-1}>
            <Flex position="absolute" top={0} left={0} bottom={0} right={0} mt={-1}>
                <DatesGrid
                    start={startDate}
                    end={endDate}
                    minuteScale={minutesPerCell}
                    resourceUid={"selectedTrucker"}
                />
            </Flex>
            <TimelineChart
                rows={rows}
                minDate={startDate}
                maxDate={endDate}
                lines={[{color: theme.colors.blue.default}]}
                height={90}
                renderTooltip={renderTooltip}
                hideYAxis
            />
        </Box>
    );

    function renderTooltip(tooltipProps: any) {
        const {payload, active} = tooltipProps;
        if (!active) {
            return <></>;
        }
        return (
            <Card bg="grey.white" boxShadow="small" p={3}>
                {payload[0].value} {unitLabel}
            </Card>
        );
    }
}
