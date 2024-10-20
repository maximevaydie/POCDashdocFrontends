import {Box, useResourceOffset} from "@dashdoc/web-ui";
import {VirtualItem, Virtualizer} from "@tanstack/react-virtual";
import React, {ReactNode} from "react";

import {LoadingRow} from "../components/LoadingRow";
import {CarrierSchedulerBodyStyle} from "../gridStyles";
import {SchedulerCard, SchedulerResource} from "../scheduler.types";

import {CurrentTimeBar} from "./CurrentTimeBar";
import {SchedulerByTimeRow} from "./row/Row";
import {ResizeData} from "./schedulerByTime.types";

type SchedulerBodyProps = {
    dateSections: Array<{start: Date; end: Date}>;
    minuteScale: number; // scale in minutes

    virtualItems: VirtualItem[];
    resourceVirtualizer: Virtualizer<HTMLElement, Element>;
    resources: Array<SchedulerResource>;
    getAdditionalResourceInformation?: (resourceUid: string) => ReactNode;
    onCellRightClick?: (event: MouseEvent, resourceUid: string, day: Date) => void;

    cardsByResourceUid: Record<string, Array<SchedulerCard>>;
    getCardContent: (card: SchedulerCard, displayStart: Date, displayEnd: Date) => ReactNode;
    resizeData: ResizeData;
};

export function Body({
    dateSections,
    minuteScale,
    virtualItems,
    resourceVirtualizer,
    resources,
    getAdditionalResourceInformation,
    onCellRightClick,
    cardsByResourceUid,
    getCardContent,
    resizeData,
}: SchedulerBodyProps) {
    const resourceOffset = useResourceOffset();
    return (
        <CarrierSchedulerBodyStyle>
            <Box
                style={{
                    height: resourceVirtualizer.getTotalSize(),
                    width: "100%",
                    position: "relative",
                }}
            >
                <Box
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualItems[0]?.start}px)`,
                    }}
                >
                    <CurrentTimeBar
                        dateSections={dateSections}
                        minuteScale={minuteScale}
                        offset={resourceOffset - 4}
                    />
                    {resourceVirtualizer.getVirtualItems().map((virtualItem) => {
                        const resource = resources[virtualItem.index];
                        return (
                            <Box
                                key={virtualItem.key}
                                data-index={virtualItem.index}
                                ref={resourceVirtualizer.measureElement}
                            >
                                {resource ? (
                                    <SchedulerByTimeRow
                                        key={resource.uid}
                                        resourceUid={resource.uid}
                                        resourceLabel={resource.label}
                                        resourceIndex={virtualItem.index}
                                        getAdditionalResourceInformation={
                                            getAdditionalResourceInformation
                                        }
                                        dateSections={dateSections}
                                        minuteScale={minuteScale}
                                        cards={cardsByResourceUid[resource.uid]}
                                        getCardContent={getCardContent}
                                        onCellRightClick={onCellRightClick}
                                        resizeData={resizeData}
                                    />
                                ) : (
                                    <LoadingRow rowNumber={virtualItem.index} />
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </CarrierSchedulerBodyStyle>
    );
}
