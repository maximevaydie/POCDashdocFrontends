import {apiService} from "@dashdoc/web-common";
import {Box, ClickableBox, TooltipWrapper} from "@dashdoc/web-ui";
import {useTimeout, useToggle} from "dashdoc-utils";
import React, {ReactNode, useContext, useEffect, useState} from "react";

import {TooltipHeader} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/segment-card/tooltip/TooltipHeader";
import {DedicatedResourcesCharteringSchedulerSegment} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {TooltipTags} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/tooltip/components/TooltipTags";
import {PoolCurrentQueryContext} from "app/screens/trip/TripEditionScreen";

import {RawCarrierCharteringSchedulerSegment} from "../chartering-scheduler.types";

import {SegmentSchedulerCard} from "./card/SegmentSchedulerCard";
import {getSegmentDecoration} from "./segmentStatus.constants";
import {SchedulerCardTooltip} from "./tooltip/SchedulerCardTooltip";

import type {Load} from "app/types/transport";

interface SegmentsLoads {
    planned_loads: Load[];
    planned_unloads?: Load[];
    loaded_loads: Load[];
    unloaded_loads?: Load[];
}

type SegmentCardContentProps = {
    charteringSegment:
        | RawCarrierCharteringSchedulerSegment
        | DedicatedResourcesCharteringSchedulerSegment;
    inconsistentOrder: boolean;
    isSelected: boolean;
    onSelect: () => void;
    schedulerStartDate: Date;
    schedulerEndDate: Date;
    height?: number;
};

export function SegmentCardContent({
    charteringSegment,
    inconsistentOrder,
    isSelected,
    onSelect,
    schedulerStartDate,
    schedulerEndDate,
    height,
}: SegmentCardContentProps) {
    const filters = useFilters();

    const [computeTooltip, setComputeTooltip] = useToggle();
    const [cardTooltip, setCardTooltip] = useState<ReactNode>(null);
    const [mouseEnterCard, mouseLeaveCard] = useTimeout(() => {
        setComputeTooltip();
    }, 150);

    let decoration = getSegmentDecoration(charteringSegment.status);

    useEffect(() => {
        if (computeTooltip) {
            // The tooltip will be computed once (computeTooltip is never set to false after a setComputeTooltip).
            // The only use case to recompute the tooltip is a new instance of the segment object.
            const computeAndSetLoadsTooltip = async () => {
                const allLoads: SegmentsLoads = await apiService.get(
                    `/chartering-scheduler/${charteringSegment.uid}/loads/`,
                    {
                        apiVersion: "v4",
                    }
                );
                const loads =
                    allLoads.loaded_loads?.length > 0
                        ? allLoads.loaded_loads
                        : allLoads.planned_loads;
                const unloads =
                    // @ts-ignore
                    allLoads.unloaded_loads?.length > 0
                        ? allLoads.unloaded_loads
                        : allLoads.planned_unloads;
                const content = (
                    <Box maxWidth="300px" minWidth="150px">
                        <TooltipHeader
                            decoration={decoration}
                            charteringSegment={charteringSegment}
                            inconsistentOrder={inconsistentOrder}
                        />
                        <Box borderTop="1px solid" borderColor="grey.light" py={2}>
                            <SchedulerCardTooltip
                                loads={loads}
                                unloads={unloads ?? []}
                                segment={charteringSegment}
                            />
                        </Box>
                        <TooltipTags tags={charteringSegment.transport.tags} />
                    </Box>
                );
                setCardTooltip(content);
            };
            computeAndSetLoadsTooltip();
        }
    }, [computeTooltip, decoration, charteringSegment, inconsistentOrder]);

    return (
        <ClickableBox
            width="100%"
            height="100%"
            onClick={onSelect}
            onMouseEnter={mouseEnterCard}
            onMouseLeave={mouseLeaveCard}
        >
            <TooltipWrapper
                content={cardTooltip}
                delayShow={400}
                delayHide={100}
                hideOnPress
                hidden={!cardTooltip}
            >
                <SegmentSchedulerCard
                    data-testid="scheduler-card"
                    charteringSegment={charteringSegment}
                    height={height}
                    schedulerStartDate={schedulerStartDate}
                    schedulerEndDate={schedulerEndDate}
                    isSelected={isSelected}
                    isFiltered={isFiltered(charteringSegment, filters)}
                    inconsistentOrder={inconsistentOrder}
                    stickyContent
                />
            </TooltipWrapper>
        </ClickableBox>
    );
}

function useFilters() {
    const {currentQuery} = useContext(PoolCurrentQueryContext);
    return {
        shippers: currentQuery.shipper__in,
        sites: currentQuery.address__in,
        originSites: currentQuery.origin_address__in,
        destinationSites: currentQuery.destination_address__in,
    };
}

function isFiltered(
    charteringSegment: RawCarrierCharteringSchedulerSegment,
    filters: {
        shippers?: string[];
        sites?: string[];
        originSites?: string[];
        destinationSites?: string[];
    }
) {
    const isFiltered =
        (filters.shippers &&
            filters.shippers?.length > 0 &&
            !filters.shippers.includes(
                charteringSegment.transport.shipper?.pk?.toString() ?? ""
            )) ||
        (filters.originSites &&
            filters.originSites?.length > 0 &&
            !filters.originSites.includes(
                charteringSegment.origin?.address?.original?.toString() ?? ""
            )) ||
        (filters.destinationSites &&
            filters.destinationSites?.length > 0 &&
            !filters.destinationSites.includes(
                charteringSegment.destination?.address?.original?.toString() ?? ""
            )) ||
        (filters.sites &&
            filters.sites?.length > 0 &&
            !filters.sites.includes(
                charteringSegment.destination?.address?.original?.toString() ?? ""
            ) &&
            !filters.sites.includes(
                charteringSegment.origin?.address?.original?.toString() ?? ""
            ));
    return !!isFiltered;
}
