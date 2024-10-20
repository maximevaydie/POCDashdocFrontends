import {Box} from "@dashdoc/web-ui";
import {VirtualItem, Virtualizer} from "@tanstack/react-virtual";
import React, {ReactNode} from "react";

import {LoadingRow} from "../components/LoadingRow";
import {CarrierSchedulerBodyStyle} from "../gridStyles";
import {SchedulerCard, SchedulerResource} from "../scheduler.types";

import {Row} from "./row/Row";
import {SideSwipeType, SchedulerCardFormatted} from "./schedulerByDay.types";

type SchedulerBodyProps = {
    virtualItems: VirtualItem[];
    resourceVirtualizer: Virtualizer<HTMLElement, Element>;
    resources: Array<SchedulerResource>;
    daysSections: Date[][];
    timezone: string;
    animation: SideSwipeType;
    getAdditionalResourceInformation?: (resourceUid: string) => ReactNode;
    onCellRightClick?: (
        event: React.MouseEvent<HTMLElement>,
        resourceUid: string,
        day: Date
    ) => void;
    cardsByResourceUid: Record<string, Array<SchedulerCard>>;
    getCardContent: (
        card: SchedulerCardFormatted,
        displayStart: Date,
        displayEnd: Date
    ) => ReactNode;
};

export function Body({
    virtualItems,
    resourceVirtualizer,
    resources,
    daysSections,
    timezone,
    animation,
    getAdditionalResourceInformation,
    onCellRightClick,
    cardsByResourceUid,
    getCardContent,
}: SchedulerBodyProps) {
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
                    {resourceVirtualizer.getVirtualItems().map((virtualItem) => {
                        const resource = resources[virtualItem.index];
                        return (
                            <Box
                                key={virtualItem.key}
                                data-index={virtualItem.index}
                                ref={resourceVirtualizer.measureElement}
                            >
                                {resource ? (
                                    <Row
                                        key={resource.uid}
                                        resourceUid={resource.uid}
                                        resourceLabel={resource.label}
                                        resourceIndex={virtualItem.index}
                                        getAdditionalResourceInformation={
                                            getAdditionalResourceInformation
                                        }
                                        daysSections={daysSections}
                                        timezone={timezone}
                                        animation={animation}
                                        cards={cardsByResourceUid[resource.uid] ?? []}
                                        getCardContent={getCardContent}
                                        onCellRightClick={onCellRightClick}
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
