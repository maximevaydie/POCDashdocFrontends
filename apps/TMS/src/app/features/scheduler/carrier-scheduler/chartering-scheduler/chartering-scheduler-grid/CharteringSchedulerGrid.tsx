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

import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {useSchedulerTimeAndDays} from "app/screens/scheduler/hook/useSchedulerTimeAndDays";

import {RawCarrierCharteringSchedulerSegment, RowCompany} from "./chartering-scheduler.types";
import {useCharteringSegmentCards} from "./hook/useCharteringSegmentCards";
import {ResourceHeader} from "./resource/ResourceHeader";
import {RevenueCell} from "./revenue/RevenueCell";
import {RevenueHeader} from "./revenue/RevenueHeader";
import {SegmentCardContent} from "./segment-card/SegmentCardContent";
import {DayActionButton} from "./send-instructions/DayActionButton";

type CharteringSchedulerProps = {
    startDate: Date;
    endDate: Date;
    minutesScale: number;
    onDateZoom?: (delta: number) => void;
    companies: RowCompany[];
    loadAllCompanies: () => void;
    isLoadingCompanies: boolean;
    companiesTotalCount: number;
    onEndReached: () => void;
    onResetResources?: () => void;
    charteringSegments: RawCarrierCharteringSchedulerSegment[];
    isLoadingCharteringSegments: boolean;
    selectedCharteringSegmentUid?: string;
    onSelectCharteringSegment: (tripUid: string) => void;
    fetchCharteringSegmentsByUIDs: (uids: string[]) => Promise<void>;
    scrollGridRef?: React.RefObject<HTMLDivElement>;
};

export function CharteringSchedulerGrid({
    startDate,
    endDate,
    minutesScale,
    onDateZoom,
    companies,
    loadAllCompanies,
    isLoadingCompanies,
    companiesTotalCount,
    onEndReached,
    onResetResources,
    charteringSegments,
    isLoadingCharteringSegments,
    selectedCharteringSegmentUid,
    onSelectCharteringSegment,
    fetchCharteringSegmentsByUIDs,
    scrollGridRef,
}: CharteringSchedulerProps) {
    const timezone = useTimezone();
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    const cards = useCharteringSegmentCards(charteringSegments);
    const formattedCompanies: SchedulerResource[] = useMemo(
        () =>
            companies.map((c) => ({
                uid: c.pk.toString(),
                label: c.name,
            })),
        [companies]
    );
    const revenueInformation = useMemo(
        () => ({
            header: (
                <RevenueHeader
                    charteringSegments={charteringSegments}
                    startDate={startDate}
                    endDate={endDate}
                    viewType="chartering"
                />
            ),
            getResourceInformation: (resourceUid: string) => (
                <RevenueCell
                    resourceUid={resourceUid}
                    charteringSegments={charteringSegments}
                    startDate={startDate}
                    endDate={endDate}
                    viewType="chartering"
                />
            ),
        }),
        [charteringSegments, endDate, startDate]
    );
    const getDayActionButton = useCallback(
        (day: Date, currentDate: Date) => (
            <DayActionButton
                day={day}
                charteringSegments={charteringSegments}
                currentDate={currentDate}
                allCompaniesLoaded={formattedCompanies.length === companiesTotalCount}
                isLoadingCompanies={isLoadingCompanies}
                loadAllCompanies={loadAllCompanies}
                isLoadingSegments={isLoadingCharteringSegments}
                fetchCharteringSegmentsByUIDs={fetchCharteringSegmentsByUIDs}
            />
        ),
        [
            charteringSegments,
            companiesTotalCount,
            fetchCharteringSegmentsByUIDs,
            isLoadingCharteringSegments,
            isLoadingCompanies,
            loadAllCompanies,
            formattedCompanies.length,
        ]
    );
    const getCardContent = useCallback(
        (card: SchedulerCardFormatted, displayStart = startDate, displayEnd = endDate) => {
            const {itemUid, inconsistentOrder, height} = card;
            return (
                <SegmentCardContent
                    charteringSegment={
                        charteringSegments.find(
                            (s) => s.uid === itemUid
                        ) as RawCarrierCharteringSchedulerSegment
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
            getDayIndicator: getDayActionButton,
            onDateZoom: onDateZoom,
            hideSaturdays,
            hideSundays,
            timeRange,
        }),
        [
            startDate,
            endDate,
            minutesScale,
            getDayActionButton,
            onDateZoom,
            hideSaturdays,
            hideSundays,
            timeRange,
        ]
    );
    const byCompanies = useMemo(
        () => ({
            header: <ResourceHeader isLoading={isLoadingCharteringSegments} />,
            resources: formattedCompanies,
            resourcesTotalCount: companiesTotalCount,
            onResetResources,
            ontResourcesEndReached: onEndReached,
            additionalResourcesInformation: revenueInformation,
        }),
        [
            companiesTotalCount,
            isLoadingCharteringSegments,
            onEndReached,
            onResetResources,
            formattedCompanies,
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
            {isLoadingCompanies && <LoadingOverlay />}

            {hasSchedulerByTimeEnabled ? (
                <SchedulerByTime
                    datesSettings={datesSettings}
                    byResources={byCompanies}
                    cards={cards}
                    getCardContent={getCardContent}
                    timezone={timezone}
                    scrollGridRef={scrollGridRef}
                />
            ) : (
                <SchedulerByDay
                    datesSettings={datesSettings}
                    byResources={byCompanies}
                    cards={cards}
                    getCardContent={getCardContent}
                    timezone={timezone}
                />
            )}
        </Card>
    );
}
