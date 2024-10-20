import {Box, ResizableBox, Text} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import {max} from "date-fns";
import React, {ReactNode, useCallback} from "react";
import {useDragDropManager} from "react-dnd";

import {TIME_CELL_WIDTH} from "../../gridStyles";
import {SchedulerCard} from "../../scheduler.types";
import {schedulerDatesService} from "../service/dates.service";

import {DraggableCard} from "./DraggableCard";

type Props = {
    card: SchedulerCard;
    start: Date;
    dateSections: Array<{start: Date; end: Date}>;
    position: {leftOffset: number; width: number; stepOffset: number};
    resourceUid: string;
    children: ReactNode;
    resizable: boolean;
    onResizeDone: (card: SchedulerCard, width: number) => void;
    minuteScale: number;
};

export const Card = React.memo(function SchedulerByTimeCard({
    card,
    start,
    dateSections,
    position,
    resourceUid,
    children,
    resizable,
    onResizeDone,
    minuteScale,
}: Props) {
    const dragDropManager = useDragDropManager();
    const isDragging = dragDropManager.getMonitor().isDragging();

    const getResizingIndicator = useCallback(
        ({width}: {width?: number | string}) => {
            if (!width || typeof width !== "number") {
                return null;
            }

            const newDate = schedulerDatesService.getEndDateFromStartDateAndWidth(
                max([card.startDate, start]),
                width,
                minuteScale,
                dateSections
            );

            return (
                <Box
                    p={1}
                    border={"1px solid"}
                    borderColor="grey.light"
                    borderRadius={1}
                    backgroundColor="grey.white"
                >
                    <Text variant="subcaption">{formatDate(newDate, "p")}</Text>
                </Box>
            );
        },
        [minuteScale, card.startDate, start, dateSections]
    );

    return (
        <Box
            position="relative"
            minWidth="8px"
            width={`${position.width}px`}
            marginLeft={`${position.leftOffset}px`}
            height={"fit-content"}
        >
            <ResizableBox
                allowedDirections={["right"]}
                onResizeDone={handleResizeDone}
                css={
                    isDragging
                        ? {
                              "& .resizeIcon": {
                                  opacity: 0,
                              },
                          }
                        : {
                              "& .resizeIcon": {
                                  opacity: 0,
                              },
                              "&:hover .resizeIcon": {
                                  opacity: 1,
                              },
                              "& .resizeIconWrapper": {
                                  width: "10px",
                                  right: 0,
                              },
                          }
                }
                resizingBoxProps={{
                    position: "relative",
                    width: "100%",
                    zIndex: "level2",
                }}
                disabled={!resizable && !isDragging}
                step={{x: TIME_CELL_WIDTH / 2}} // same precision than drag and drop
                stepOffset={{x: position.stepOffset}}
                getResizingIndicator={getResizingIndicator}
                key={`redraw-when-width-updated-${position.width}`}
                scrollableContainerId="scheduler"
            >
                <Box>
                    <DraggableCard
                        itemUid={card.itemUid}
                        startDate={card.startDate}
                        resourceUid={resourceUid}
                        draggable={card.draggable}
                    >
                        {children}
                    </DraggableCard>
                </Box>
            </ResizableBox>
        </Box>
    );

    function handleResizeDone(width: string) {
        const widthValue = parseInt(width.replace("px", ""));
        onResizeDone(card, widthValue);
    }
});
