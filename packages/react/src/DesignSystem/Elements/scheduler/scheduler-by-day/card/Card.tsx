import {Box, DraggableBox} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React, {Fragment, ReactNode, useContext, useMemo} from "react";

import {SCHEDULER_CARD_HEIGHT_MARGIN} from "../../gridStyles";
import {DndSchedulerPayload} from "../../scheduler.types";
import {SchedulerDndContext} from "../../SchedulerDndContext";

type SchedulerCardProps = {
    itemUid: string;
    resourceUid: string;
    day: Date;
    index: number;
    y: number; // vertical position in px (according other cards size
    width: number; // how many cell the item lasts
    height: number; // in px according the display of the card
    numberOfItemsToIgnoreInOrdering: number; // number of cards before this card starting on before this day
    draggable: boolean;
    children: ReactNode;
};

export const Card = React.memo(function SchedulerCard({
    itemUid,
    resourceUid,
    day,
    index,
    y,
    width,
    height,
    numberOfItemsToIgnoreInOrdering,
    draggable,
    children,
}: SchedulerCardProps) {
    const topOffset = index == 0 ? y : 0;
    const sourcePayload: DndSchedulerPayload = useMemo(
        () => ({
            resourceUid,
            day: day.toISOString(),
            index: index - numberOfItemsToIgnoreInOrdering,
        }),
        [day, index, numberOfItemsToIgnoreInOrdering, resourceUid]
    );
    const {kind, useDraggedEntityByUid, draggableType} = useContext(SchedulerDndContext);

    const defaultEntity = useMemo(() => ({itemUid}), [itemUid]);
    const entity = useDraggedEntityByUid?.(itemUid) ?? defaultEntity;

    return (
        <Fragment key={`card-${itemUid}`}>
            {draggable ? (
                <DraggableWrapper
                    key={`draggable-${resourceUid}-${day.toISOString()}-${index}-${itemUid}`}
                    kind={kind}
                    payload={sourcePayload}
                    entity={entity}
                    id={itemUid}
                    type={draggableType}
                >
                    <SchedulerCardContent
                        itemUid={itemUid}
                        topOffset={topOffset}
                        width={width}
                        height={height}
                    >
                        {children}
                    </SchedulerCardContent>
                </DraggableWrapper>
            ) : (
                <SchedulerCardContent
                    itemUid={itemUid}
                    topOffset={topOffset}
                    width={width}
                    height={height}
                >
                    {children}
                </SchedulerCardContent>
            )}
        </Fragment>
    );
});

const SchedulerCardContent = React.memo(function SchedulerCardContent({
    itemUid,
    topOffset,
    width,
    height,
    children,
}: {
    itemUid: string;
    topOffset: number;
    width: number;
    height: number;
    children: ReactNode;
}) {
    return (
        <>
            {topOffset ? (
                <Spacer topOffset={topOffset} key={`spacer-for-card-${itemUid}`} />
            ) : null}
            <SchedulerCardPositioner height={height}>
                <SchedulerCardMultiCells widthInCellsNumber={width} height={height}>
                    <Box position="absolute" zIndex="level2" width="100%" height="100%">
                        {children}
                    </Box>
                </SchedulerCardMultiCells>
            </SchedulerCardPositioner>
        </>
    );
});

const DraggableWrapper = React.memo(DraggableBox);
const SchedulerCardPositioner = styled(Box)<{height: number}>`
    height: ${({height}) => height + SCHEDULER_CARD_HEIGHT_MARGIN}px;
    position: relative;
`;

const SchedulerCardMultiCells = styled(Box)<{widthInCellsNumber: number; height: number}>`
    overflow: visible;
    position: relative;
    min-height: ${({height}) => height + SCHEDULER_CARD_HEIGHT_MARGIN}px;
    width: ${({widthInCellsNumber}) => {
        const w = widthInCellsNumber || 1;
        return `calc(100% * ${w} + ${w - 1}rem + ${w}px)`;
    }};
`;

const Spacer = styled(Box)<{topOffset: number}>`
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    ${({topOffset}) => {
        return {
            height: `${topOffset}px !important`,
        };
    }}
`;
