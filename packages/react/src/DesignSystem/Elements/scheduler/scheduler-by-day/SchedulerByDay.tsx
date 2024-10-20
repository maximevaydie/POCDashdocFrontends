import {DndGhost, ListEmptyNoResultsWithFilters, useItemsScroll} from "@dashdoc/web-ui";
import groupBy from "lodash.groupby";
import React, {ReactNode, useMemo} from "react";

import {CarrierSchedulerTable, CarrierSchedulerTableContainer} from "../gridStyles";
import {useDndScrollingWithOffset} from "../hooks/useDndScrollingWithOffset";
import {useResourceVirtualizer} from "../hooks/useResourceVirtualizer";
import {DndData, SchedulerCard, SchedulerResource} from "../scheduler.types";
import {SchedulerDndContext} from "../SchedulerDndContext";

import {Body} from "./Body";
import {DayHeader} from "./DayHeader";
import {useCalendarAnimation} from "./hook/useCalendarAnimation";
import {SchedulerCardFormatted} from "./schedulerByDay.types";
import {schedulerByDayDatesService} from "./service/dates.service";

type SchedulerProps = {
    datesSettings: {
        start: Date;
        end: Date;
        getDayIndicator?: (day: Date, currentDate: Date) => ReactNode | null;
        hideSaturdays: boolean;
        hideSundays: boolean;
    };
    byResources: {
        header?: ReactNode;
        resources: Array<SchedulerResource>;
        resourcesTotalCount: number; // Needed for virtualizer
        onResetResources?: () => void;
        ontResourcesEndReached?: () => void;

        additionalResourcesInformation?: {
            header: ReactNode; // will be display next to items header
            getResourceInformation: (resourceUid: string) => ReactNode; // will be display next to items label
        };
    };

    onCellRightClick?: (
        event: React.MouseEvent<HTMLElement>,
        resourceUid: string,
        day: Date
    ) => void;
    cards: Array<SchedulerCard>;
    getCardContent: (
        card: SchedulerCardFormatted,
        displayStart: Date,
        displayEnd: Date
    ) => ReactNode;
    dndData?: DndData;
    timezone: string;
};

export function SchedulerByDay({
    datesSettings,
    byResources,
    onCellRightClick,
    cards,
    getCardContent,
    dndData = {
        onDrop: () => {},
        kind: "scheduler",
        acceptedTypes: [],
        isDroppable: () => true,
        ghostCards: {},
        draggableType: "planned",
    },
    timezone,
}: SchedulerProps) {
    const {
        start: startDate,
        end: endDate,
        getDayIndicator,
        hideSaturdays,
        hideSundays,
    } = datesSettings;
    const {
        header: resourcesHeader,
        resources,
        resourcesTotalCount,
        onResetResources,
        ontResourcesEndReached,
        additionalResourcesInformation,
    } = byResources;

    const cardsByResourceUid = useMemo(() => groupBy(cards, (card) => card.resourceUid), [cards]);

    const daysSections = useMemo(
        () =>
            schedulerByDayDatesService.getDatesSection({
                start: startDate,
                end: endDate,
                hideSaturdays,
                hideSundays,
            }),
        [endDate, startDate, hideSaturdays, hideSundays]
    );
    const animation = useCalendarAnimation(startDate);

    const parentRef = React.useRef<HTMLDivElement>(null);
    const onScroll = useItemsScroll(ontResourcesEndReached);
    useDndScrollingWithOffset(parentRef);
    const {resourceVirtualizer, virtualItems} = useResourceVirtualizer(
        resources.length,
        resourcesTotalCount,
        parentRef,
        ontResourcesEndReached
    );
    return (
        <SchedulerDndContext.Provider value={dndData}>
            <CarrierSchedulerTableContainer
                id="scheduler"
                data-testid="scheduler"
                onScroll={onScroll}
                ref={parentRef}
            >
                <CarrierSchedulerTable>
                    <DayHeader
                        resourcesHeader={resourcesHeader}
                        additionalResourcesInformationHeader={
                            additionalResourcesInformation?.header
                        }
                        daysSections={daysSections}
                        animation={animation}
                        getDayIndicator={getDayIndicator}
                        timezone={timezone}
                    />
                    {resources.length === 0 && onResetResources && (
                        <ListEmptyNoResultsWithFilters resetQuery={onResetResources} />
                    )}

                    <Body
                        virtualItems={virtualItems}
                        resourceVirtualizer={resourceVirtualizer}
                        resources={resources}
                        daysSections={daysSections}
                        timezone={timezone}
                        animation={animation}
                        getAdditionalResourceInformation={
                            additionalResourcesInformation
                                ? additionalResourcesInformation.getResourceInformation
                                : undefined
                        }
                        onCellRightClick={onCellRightClick}
                        cardsByResourceUid={cardsByResourceUid}
                        getCardContent={getCardContent}
                    />

                    <DndGhost ghostComponents={dndData.ghostCards} />
                </CarrierSchedulerTable>
            </CarrierSchedulerTableContainer>
        </SchedulerDndContext.Provider>
    );
}
