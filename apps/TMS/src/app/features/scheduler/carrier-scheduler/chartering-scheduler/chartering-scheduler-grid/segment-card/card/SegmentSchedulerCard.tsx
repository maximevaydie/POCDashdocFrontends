import {Manager} from "dashdoc-utils";
import React, {useMemo} from "react";

import {SchedulerCardContent} from "app/features/scheduler/carrier-scheduler/components/card-content/SchedulerCardContent";

import {RawCarrierCharteringSchedulerSegment} from "../../chartering-scheduler.types";
import {getSegmentDecoration} from "../segmentStatus.constants";

type SchedulerCardProps = {
    charteringSegment: RawCarrierCharteringSchedulerSegment;
    height?: number;
    schedulerStartDate?: Date;
    schedulerEndDate?: Date;
    isSelected?: boolean;
    isFiltered?: boolean;
    width?: string;
    "data-testid"?: string;
    children?: React.ReactNode;
    settings?: Manager["scheduler_card_display_settings"];
    inconsistentOrder?: boolean;
    stickyContent?: boolean;
};

export function SegmentSchedulerCard({
    charteringSegment,
    height,
    schedulerStartDate,
    schedulerEndDate,
    isSelected,
    isFiltered,
    width,
    "data-testid": dataTestId,
    settings,
    inconsistentOrder,
    stickyContent,
}: SchedulerCardProps) {
    const activities = useMemo(() => {
        return [
            {
                ...charteringSegment.origin,
                onSite: ["on_loading_site"].includes(charteringSegment.status),
                siteDone: ["loading_complete", "on_unloading_site"].includes(
                    charteringSegment.status
                ),
                isDeletedOrCancelled: false,
            },
            {
                ...charteringSegment.destination,
                onSite: ["on_unloading_site"].includes(charteringSegment.status),
                siteDone: ["unloading_complete", "done", "invoiced"].includes(
                    charteringSegment.status
                ),
                isDeletedOrCancelled: false,
            },
        ];
    }, [charteringSegment.origin, charteringSegment.status, charteringSegment.destination]);
    const means = {};

    return (
        <SchedulerCardContent
            name={charteringSegment.transport.shipper?.name}
            decoration={getSegmentDecoration(charteringSegment.status)}
            activities={activities}
            means={means}
            requestedVehicles={
                charteringSegment.transport.requested_vehicle
                    ? [charteringSegment.transport.requested_vehicle]
                    : []
            }
            instructions={charteringSegment.transport.instructions ?? ""}
            cardDateRange={charteringSegment.scheduler_datetime_range}
            schedulerStartDate={schedulerStartDate}
            schedulerEndDate={schedulerEndDate}
            isPreparedTrip={false}
            height={height}
            viewMode={"chartering"}
            isSelected={isSelected}
            isFiltered={isFiltered}
            width={width}
            data-testid={dataTestId}
            settings={settings}
            inconsistentOrder={inconsistentOrder}
            tags={charteringSegment.transport.tags ?? []}
            stickyContent={stickyContent}
        />
    );
}
