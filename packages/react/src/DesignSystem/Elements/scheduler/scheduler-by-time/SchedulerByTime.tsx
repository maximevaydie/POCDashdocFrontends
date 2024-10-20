import {BrowserTimeProvider} from "@dashdoc/web-core";
import {
    DndGhost,
    Flex,
    ListEmptyNoResultsWithFilters,
    BoxProps,
    useItemsScroll,
} from "@dashdoc/web-ui";
import groupBy from "lodash.groupby";
import React, {ReactNode, useMemo} from "react";

import {CarrierSchedulerTable} from "../gridStyles";
import {useDndScrollingWithOffset} from "../hooks/useDndScrollingWithOffset";
import {useResourceVirtualizer} from "../hooks/useResourceVirtualizer";
import {SchedulerCard, DndData, SchedulerResource} from "../scheduler.types";
import {SchedulerDndContext} from "../SchedulerDndContext";

import {Body} from "./Body";
import {useZoom} from "./hook/useZoom";
import {ResizeData} from "./schedulerByTime.types";
import {schedulerDatesService} from "./service/dates.service";
import {TimeHeader} from "./TimeHeader";

type SchedulerProps = {
    datesSettings: {
        start: Date;
        end: Date;
        minuteScale: number; // scale in minutes
        getDayIndicator?: (day: Date, currentDate: Date) => ReactNode | null;
        onDateZoom?: (delta: number) => void;
        hideSaturdays: boolean;
        hideSundays: boolean;
        timeRange: {start: string; end: string} | null;
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

    onCellRightClick?: (event: MouseEvent, resourceUid: string, day: Date) => void;
    cards: Array<SchedulerCard>;
    getCardContent: (card: SchedulerCard, displayStart: Date, displayEnd: Date) => ReactNode;
    dndData?: DndData;
    resizeData?: ResizeData;
    timezone: string;
    scrollGridRef?: React.RefObject<HTMLDivElement>;
    scrollGridProps?: BoxProps;
};

export function SchedulerByTime({
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
    resizeData = {
        isResizable: () => false,
        onResizeDone: () => {},
    },
    timezone,
    scrollGridRef,
    scrollGridProps,
}: SchedulerProps) {
    const {
        header: resourcesHeader,
        resources,
        resourcesTotalCount,
        onResetResources,
        ontResourcesEndReached,
        additionalResourcesInformation,
    } = byResources;
    const cardsByResourceUid = useMemo(() => groupBy(cards, (card) => card.resourceUid), [cards]);

    const defaultRef = React.useRef<HTMLDivElement>(null);
    const parentRef = scrollGridRef ?? defaultRef;
    const onScroll = useItemsScroll(ontResourcesEndReached);

    useDndScrollingWithOffset(parentRef);
    useZoom(parentRef, datesSettings.onDateZoom);

    const {resourceVirtualizer, virtualItems} = useResourceVirtualizer(
        resources.length,
        resourcesTotalCount,
        parentRef,
        ontResourcesEndReached
    );

    const dateSections = useMemo(
        () => schedulerDatesService.getDatesSection(datesSettings),
        [datesSettings]
    );

    return (
        <BrowserTimeProvider interval={15 * 60 * 1000}>
            <SchedulerDndContext.Provider value={dndData}>
                <Flex
                    id="scheduler"
                    data-testid="scheduler"
                    onScroll={onScroll}
                    ref={parentRef}
                    flex={1}
                    flexBasis="100%"
                    overflow="auto"
                    style={{flexFlow: "wrap"}}
                    {...scrollGridProps}
                >
                    <CarrierSchedulerTable>
                        <TimeHeader
                            resourcesHeader={resourcesHeader}
                            additionalResourcesInformationHeader={
                                additionalResourcesInformation?.header
                            }
                            dateSections={dateSections}
                            minuteScale={datesSettings.minuteScale}
                            getDayIndicator={datesSettings.getDayIndicator}
                            timezone={timezone}
                        />
                        {resources.length === 0 && onResetResources && (
                            <Flex
                                position="absolute"
                                left={0}
                                right={0}
                                justifyContent="center"
                                top="100px"
                            >
                                <ListEmptyNoResultsWithFilters resetQuery={onResetResources} />
                            </Flex>
                        )}

                        <Body
                            virtualItems={virtualItems}
                            resourceVirtualizer={resourceVirtualizer}
                            resources={resources}
                            onCellRightClick={onCellRightClick}
                            cardsByResourceUid={cardsByResourceUid}
                            getCardContent={getCardContent}
                            dateSections={dateSections}
                            minuteScale={datesSettings.minuteScale}
                            resizeData={resizeData}
                            getAdditionalResourceInformation={
                                additionalResourcesInformation
                                    ? additionalResourcesInformation.getResourceInformation
                                    : undefined
                            }
                        />

                        <DndGhost ghostComponents={dndData.ghostCards} />
                    </CarrierSchedulerTable>
                </Flex>
            </SchedulerDndContext.Provider>
        </BrowserTimeProvider>
    );
}
