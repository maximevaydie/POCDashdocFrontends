import {Box} from "@dashdoc/web-ui";
import React, {ReactNode, useCallback} from "react";

import {CarrierSchedulerBodyCell} from "../../gridStyles";
import {Card} from "../card/Card";
import {SideSwipeType, SchedulerCardFormatted} from "../schedulerByDay.types";

import {Droppables} from "./Droppables";

type CellProps = {
    resourceUid: string;
    day: Date;
    animation: SideSwipeType;
    cards: Array<SchedulerCardFormatted>;
    getCardContent: (card: SchedulerCardFormatted) => ReactNode;
    onCellRightClick?: (
        event: React.MouseEvent<HTMLElement>,
        resourceUid: string,
        day: Date
    ) => void;
};

export function Cell({
    resourceUid,
    day,
    animation,
    cards,
    getCardContent,
    onCellRightClick,
}: CellProps) {
    const onContextMenu = useCallback(
        (ev: React.MouseEvent<HTMLElement>) => {
            if (onCellRightClick) {
                ev.preventDefault();
                onCellRightClick(ev, resourceUid, day);
            }
        },
        [day, onCellRightClick, resourceUid]
    );
    return (
        <CarrierSchedulerBodyCell
            isDraggingOver={false}
            animation={animation}
            data-testid={"droppable-cell"}
            onContextMenu={onContextMenu}
        >
            {cards.length > 0 && (
                <Box>
                    {cards.map((card, index) => (
                        <Card
                            key={card.itemUid}
                            itemUid={card.itemUid}
                            resourceUid={resourceUid}
                            day={day}
                            index={index}
                            y={card.y}
                            width={card.width}
                            height={card.height}
                            numberOfItemsToIgnoreInOrdering={
                                cards.slice(0, index - 1).filter((c) => c.startDate < day).length
                            }
                            draggable={card.draggable}
                        >
                            {getCardContent(card)}
                        </Card>
                    ))}
                </Box>
            )}
            <Droppables cards={cards} resourceUid={resourceUid} day={day} />
        </CarrierSchedulerBodyCell>
    );
}
