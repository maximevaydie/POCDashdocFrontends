import {ClickableBox} from "@dashdoc/web-ui";
import {TooltipWrapper} from "@dashdoc/web-ui";
import {Manager} from "dashdoc-utils";
import flatten from "lodash.flatten";
import isEqual from "lodash.isequal";
import React, {useContext, useMemo} from "react";

import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {TripCardTooltip} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/tooltip/TripCardTooltip";
import {SimilarActivity} from "app/features/trip/trip.types";
import {useSelector} from "app/redux/hooks";
import {getCompactTripByUid} from "app/redux/selectors";
import {PoolCurrentQueryContext} from "app/screens/trip/TripEditionScreen";

import {TripSchedulerCard} from "./card/TripSchedulerCard";

type TripCardContentProps = {
    tripUid: string;
    inconsistentOrder: boolean;
    isSelected: boolean;
    onSelect?: (tripUid: string) => void;
    view: TripSchedulerView;
    schedulerStartDate: Date;
    schedulerEndDate: Date;
    height?: number;
    onTripHovered?: (uid: string | null) => void;
    onActivityHovered?: (value: {uid: string; count: number} | null) => void;
    minutesScale?: number;
    settings?: Manager["scheduler_card_display_settings"];
    isCardFiltered?: boolean;
};

export function TripCardContent({
    tripUid,
    inconsistentOrder,
    isSelected,
    onSelect,
    view,
    schedulerStartDate,
    schedulerEndDate,
    height,
    onTripHovered,
    onActivityHovered,
    minutesScale,
    settings,
    isCardFiltered,
}: TripCardContentProps) {
    const trip = useSelector((state) => getCompactTripByUid(state, tripUid), isEqual);
    const filters = useFilters();

    const content = useMemo(
        () =>
            trip ? (
                <TripSchedulerCard
                    data-testid="scheduler-card"
                    trip={trip}
                    height={height}
                    schedulerStartDate={schedulerStartDate}
                    schedulerEndDate={schedulerEndDate}
                    viewMode={view}
                    isSelected={isSelected}
                    isFiltered={isCardFiltered || isFiltered(trip.activities, filters)}
                    inconsistentOrder={inconsistentOrder}
                    stickyContent={true}
                    minutesScale={minutesScale}
                    onActivityHovered={onActivityHovered}
                    settings={settings}
                />
            ) : null,
        [
            filters,
            height,
            inconsistentOrder,
            isSelected,
            schedulerEndDate,
            schedulerStartDate,
            trip,
            view,
            minutesScale,
            onActivityHovered,
            settings,
        ]
    );
    return trip ? (
        onTripHovered ? (
            <ClickableBox
                width="100%"
                height="100%"
                onClick={() => onSelect?.(tripUid)}
                onMouseEnter={() => {
                    onTripHovered(tripUid);
                }}
                onMouseLeave={() => onTripHovered(null)}
                disabled={!onSelect}
                hoverStyle={{}}
            >
                {content}
            </ClickableBox>
        ) : (
            <ClickableBox
                width="100%"
                height="100%"
                onClick={() => onSelect?.(tripUid)}
                disabled={!onSelect}
                hoverStyle={{}}
            >
                <TooltipWrapper
                    content={
                        <TripCardTooltip
                            trip={trip}
                            view={view}
                            inconsistentOrder={inconsistentOrder}
                        />
                    }
                    delayShow={600}
                    delayHide={100}
                    hideOnPress
                >
                    {content}
                </TooltipWrapper>
            </ClickableBox>
        )
    ) : null;
}

function useFilters() {
    const {currentQuery} = useContext(PoolCurrentQueryContext);
    return {
        shippers: currentQuery.shipper__in,
        sites: currentQuery.address__in,
        originSites: currentQuery.origin_address__in,
        destinationSites: currentQuery.destination_address__in,
        tags: currentQuery.tags__in,
    };
}

function isFiltered(
    activities: SimilarActivity[],
    filters: {
        shippers?: string[];
        sites?: string[];
        originSites?: string[];
        destinationSites?: string[];
        tags?: string[];
    }
) {
    const isFiltered =
        (filters.shippers &&
            filters.shippers?.length > 0 &&
            !activities
                .flatMap((activity) => activity.transports.map((t) => t.shipper?.pk?.toString()))
                .some((pk) => pk && filters.shippers?.includes(pk))) ||
        (filters.originSites &&
            filters.originSites?.length > 0 &&
            !activities
                .filter((a) => a.category && ["loading", "resuming"].includes(a.category))
                .map((activity) => activity.address?.original?.toString())
                .some((pk) => pk && filters.originSites?.includes(pk))) ||
        (filters.destinationSites &&
            filters.destinationSites?.length > 0 &&
            !activities
                .filter((a) => a.category && ["unloading", "breaking"].includes(a.category))
                .map((activity) => activity.address?.original?.toString())
                .some((pk) => pk && filters.destinationSites?.includes(pk))) ||
        (filters.sites &&
            filters.sites?.length > 0 &&
            !activities
                .map((activity) => activity.address?.original?.toString())
                .some((pk) => pk && filters.sites?.includes(pk))) ||
        (filters.tags?.length &&
            !flatten(
                activities.flatMap((activity) =>
                    activity.transports.map((t) => t.tags?.map((tag) => tag.pk.toString()))
                )
            ).some((pk) => pk && filters.tags?.includes(pk)));
    return !!isFiltered;
}
