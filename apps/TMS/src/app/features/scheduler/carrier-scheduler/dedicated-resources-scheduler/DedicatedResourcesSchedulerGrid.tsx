import {useTimezone} from "@dashdoc/web-common";
import {
    Card,
    LoadingOverlay,
    SchedulerByDay,
    SchedulerByTime,
    SchedulerCardFormatted,
    SchedulerResource,
} from "@dashdoc/web-ui";
import React, {useCallback, useMemo} from "react";

import {ResourceHeader} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/resource/ResourceHeader";
import {RevenueCell} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/revenue/RevenueCell";
import {RevenueHeader} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/revenue/RevenueHeader";
import {SegmentCardContent} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/segment-card/SegmentCardContent";
import {
    DedicatedResourceForCharteringScheduler,
    DedicatedResourcesCharteringSchedulerSegment,
} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {useDedicatedResourcesSegmentCards} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/hooks/useDedicatedResourcesCharteringSegmentCards";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {useSchedulerTimeAndDays} from "app/screens/scheduler/hook/useSchedulerTimeAndDays";

type DedicatedResourcesSchedulerProps = {
    startDate: Date;
    endDate: Date;
    minutesScale: number;
    onDateZoom?: (delta: number) => void;
    dedicatedResources: DedicatedResourceForCharteringScheduler[];
    isLoadingDedicatedResources: boolean;
    dedicatedResourcesTotalCount: number;
    onEndReached: () => void;
    onResetResources?: () => void;
    charteringSegments: DedicatedResourcesCharteringSchedulerSegment[];
    isLoadingCharteringSegments: boolean;
    selectedCharteringSegmentUid?: string;
    onSelectCharteringSegment: (tripUid: string) => void;
    scrollGridRef?: React.RefObject<HTMLDivElement>;
};

export function DedicatedResourcesSchedulerGrid({
    startDate,
    endDate,
    minutesScale,
    onDateZoom,
    dedicatedResources,
    isLoadingDedicatedResources,
    dedicatedResourcesTotalCount,
    onEndReached,
    onResetResources,
    charteringSegments,
    isLoadingCharteringSegments,
    selectedCharteringSegmentUid,
    onSelectCharteringSegment,
    scrollGridRef,
}: DedicatedResourcesSchedulerProps) {
    const timezone = useTimezone();
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    const cards = useDedicatedResourcesSegmentCards(charteringSegments);

    const formattedResources: SchedulerResource[] = useMemo(() => {
        return dedicatedResources.map((resource) => ({
            uid: `${resource.resource_type}-${resource.pk}`,
            label: resource.label,
        }));
    }, [dedicatedResources]);

    const revenueInformation = useMemo(
        () => ({
            header: (
                <RevenueHeader
                    charteringSegments={charteringSegments}
                    startDate={startDate}
                    endDate={endDate}
                    viewType="dedicated_resources"
                />
            ),
            getResourceInformation: (resourceUid: string) => (
                <RevenueCell
                    resourceUid={resourceUid}
                    charteringSegments={charteringSegments}
                    startDate={startDate}
                    endDate={endDate}
                    viewType="dedicated_resources"
                />
            ),
        }),
        [charteringSegments, endDate, startDate]
    );

    const getCardContent = useCallback(
        (card: SchedulerCardFormatted, displayStart = startDate, displayEnd = endDate) => {
            const {itemUid, inconsistentOrder, height} = card;
            return (
                <SegmentCardContent
                    charteringSegment={
                        charteringSegments.find(
                            (s) => s.uid === itemUid
                        ) as DedicatedResourcesCharteringSchedulerSegment
                    }
                    inconsistentOrder={inconsistentOrder}
                    isSelected={itemUid === selectedCharteringSegmentUid}
                    onSelect={() => onSelectCharteringSegment(itemUid)}
                    // used card display start and end instead of full scheduler start and end to handle hidden sections
                    schedulerStartDate={displayStart}
                    schedulerEndDate={displayEnd}
                    height={height}
                />
            );
        },
        [
            charteringSegments,
            endDate,
            onSelectCharteringSegment,
            selectedCharteringSegmentUid,
            startDate,
        ]
    );
    const {hideSaturdays, hideSundays, timeRange} = useSchedulerTimeAndDays();
    const datesSettings = useMemo(
        () => ({
            start: startDate,
            end: endDate,
            minuteScale: minutesScale,
            onDateZoom: onDateZoom,
            hideSaturdays,
            hideSundays,
            timeRange,
        }),
        [startDate, endDate, minutesScale, onDateZoom, hideSaturdays, hideSundays, timeRange]
    );
    const byDedicatedResources = useMemo(
        () => ({
            header: <ResourceHeader isLoading={isLoadingCharteringSegments} />,
            resources: formattedResources,
            resourcesTotalCount: dedicatedResourcesTotalCount,
            onResetResources,
            ontResourcesEndReached: onEndReached,
            additionalResourcesInformation: revenueInformation,
        }),
        [
            dedicatedResourcesTotalCount,
            isLoadingCharteringSegments,
            onEndReached,
            onResetResources,
            formattedResources,
            revenueInformation,
        ]
    );
    return (
        <Card
            mt={0}
            flex={1}
            display="flex"
            flex-direction="row"
            overflow="hidden"
            position="relative"
        >
            {isLoadingDedicatedResources && <LoadingOverlay />}

            {hasSchedulerByTimeEnabled ? (
                <SchedulerByTime
                    datesSettings={datesSettings}
                    byResources={byDedicatedResources}
                    cards={cards}
                    getCardContent={getCardContent}
                    timezone={timezone}
                    scrollGridRef={scrollGridRef}
                />
            ) : (
                <SchedulerByDay
                    datesSettings={datesSettings}
                    byResources={byDedicatedResources}
                    cards={cards}
                    getCardContent={getCardContent}
                    timezone={timezone}
                />
            )}
        </Card>
    );
}
