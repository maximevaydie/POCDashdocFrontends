import {useTimezone} from "@dashdoc/web-common";
import {Text, Flex, Icon, IconButton, DatePicker} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import {addDays} from "date-fns";
import React from "react";

import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {Trip} from "app/features/trip/trip.types";

import {resourceService} from "../resource.service";

type Props = {trip: Trip; view: TripSchedulerView; setStartDate?: (date: Date) => void};
export function ResourceHeader({trip, view, setStartDate}: Props) {
    const resourceLabel = resourceService.getResourceLabel(trip, view);
    const timezone = useTimezone();
    const startDate = parseAndZoneDate(trip.scheduler_datetime_range.start, timezone);

    return (
        <Flex
            p={2}
            justifyContent="space-between"
            alignItems="center"
            zIndex="level2"
            position="relative"
            borderBottom="1px solid"
            borderColor="grey.light"
        >
            <Flex alignItems="center">
                <Text mr={3} data-testid="resource-label">
                    {resourceLabel}
                </Text>
                <ResourceLink resourceId={trip[view]?.pk} view={view} />
            </Flex>
            {setStartDate && startDate ? (
                <DateSelector date={startDate} setDate={setStartDate} />
            ) : (
                <Text variant="caption">{formatDate(startDate, "PPPP")}</Text>
            )}
        </Flex>
    );
}

function ResourceLink({
    resourceId,
    view,
}: {
    resourceId: number | undefined;
    view: TripSchedulerView;
}) {
    if (!resourceId) {
        return null;
    }
    return (
        <Icon
            fontSize={1}
            name="openInNewTab"
            color={"blue.default"}
            onClick={() => window.open(getLink(), "_blank")}
            style={{cursor: "pointer"}}
        />
    );

    function getLink() {
        switch (view) {
            case "trucker":
                return `/app/fleet/truckers/details/${resourceId}`;
            case "vehicle":
                return `/app/fleet/vehicles/${resourceId}`;
            case "trailer":
                return `/app/fleet/trailers/${resourceId}`;
            default:
                return "";
        }
    }
}

function DateSelector({date, setDate}: {date: Date; setDate: (date: Date) => void}) {
    return (
        <Flex alignItems="center">
            <IconButton
                name="arrowLeft"
                onClick={selectPreviousDate}
                my={-1}
                data-testid="previous-day"
            />
            <DatePicker
                dateDisplayFormat="PPPP"
                onChange={setDate}
                date={date}
                rootId="react-app-modal-root"
                shortcutDates={[]}
                textInputHeight={30}
                data-testid="date-selector"
            />
            <IconButton
                name="arrowRight"
                onClick={selectNextDate}
                my={-1}
                data-testid="next-day"
            />
        </Flex>
    );

    function selectPreviousDate() {
        setDate(addDays(new Date(date), -1));
    }
    function selectNextDate() {
        setDate(addDays(new Date(date), 1));
    }
}
