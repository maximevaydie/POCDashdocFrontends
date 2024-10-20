import {Box, theme, DND_DEBUGGER, Droppable} from "@dashdoc/web-ui";
import React, {CSSProperties, useContext} from "react";

import {MIN_CELL_HEIGHT} from "../../gridStyles";
import {DndSchedulerPayload} from "../../scheduler.types";
import {SchedulerDndContext} from "../../SchedulerDndContext";
import {SchedulerCardFormatted} from "../schedulerByDay.types";

type DroppablesProps = {
    cards: SchedulerCardFormatted[];
    resourceUid: string;
    day: Date;
};

export function Droppables({cards, resourceUid, day}: DroppablesProps) {
    const {kind, acceptedTypes, isDroppable, onDrop} = useContext(SchedulerDndContext);
    const firstTargetPayload: DndSchedulerPayload = {
        resourceUid,
        day: day.toISOString(),
        index: 0,
    };
    const numberOfItemsToIgnoreInOrdering = cards.filter(
        (c) => c.startDate < day || c.ignoreForOrdering
    ).length;
    const lastTargetPayload: DndSchedulerPayload = {
        ...firstTargetPayload,
        index: cards.length - numberOfItemsToIgnoreInOrdering,
    };
    if (cards.length > 0) {
        return (
            <>
                <Droppable
                    onDrop={onDrop}
                    kind={kind}
                    acceptedType={acceptedTypes}
                    payload={firstTargetPayload}
                    id={cards[0].itemUid}
                    key={`droppable-${resourceUid}-${day.toISOString()}-0-${cards[0].itemUid}}`}
                    data-testid="droppable-cell-0"
                    isDroppable={isDroppable}
                    styleProvider={getCellPartDropStyle(cards[0], "top")}
                    whenDragOver={
                        <Box
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                backgroundColor: cards[0].y
                                    ? theme.colors.blue.ultralight
                                    : "transparent",
                            }}
                        >
                            <Box
                                style={{
                                    backgroundColor:
                                        cards[0].y > 0
                                            ? "transparent"
                                            : theme.colors.blue.ultralight,
                                    borderTop: "3px solid",
                                    borderTopColor: theme.colors.blue.dark,
                                    width: "100%",
                                    height: "10px",
                                    alignSelf: "start",
                                }}
                            />
                        </Box>
                    }
                />
                {cards.map((card: SchedulerCardFormatted, index: number) => {
                    if (index === cards.length - 1) {
                        return null;
                    }
                    const numberOfItemsToIgnoreInOrdering = cards
                        .slice(0, index + 1)
                        .filter((c) => c.startDate < day || c.ignoreForOrdering).length;
                    const targetPayload: DndSchedulerPayload = {
                        resourceUid,
                        day: day.toISOString(),
                        index: index + 1 - numberOfItemsToIgnoreInOrdering,
                    };
                    return (
                        <Droppable
                            onDrop={onDrop}
                            key={`droppable-${resourceUid}-${day.toISOString()}-${cards.length}-${
                                card.itemUid
                            }-${targetPayload.index}`}
                            kind={kind}
                            acceptedType={acceptedTypes}
                            payload={targetPayload}
                            id={card.itemUid}
                            isDroppable={isDroppable}
                            styleProvider={getCellPartDropStyle(card)}
                            whenDragOver={
                                <Box
                                    style={{
                                        width: "100%",
                                        marginTop: "auto",
                                        marginBottom: "auto",
                                        backgroundColor: theme.colors.blue.ultralight,
                                        padding: "5px 0px",
                                    }}
                                >
                                    <Box
                                        style={{
                                            borderBottom: "3px solid",
                                            borderBottomColor: theme.colors.blue.dark,
                                            width: "100%",
                                            height: "3px",
                                        }}
                                    />
                                </Box>
                            }
                        />
                    );
                })}
                <Droppable
                    onDrop={onDrop}
                    kind={kind}
                    acceptedType={acceptedTypes}
                    payload={lastTargetPayload}
                    id={cards[cards.length - 1].itemUid}
                    key={`droppable-${resourceUid}-${day.toISOString()}-${cards.length}-${
                        cards[cards.length - 1].itemUid
                    }}`}
                    isDroppable={isDroppable}
                    styleProvider={getCellPartDropStyle(cards[cards.length - 1], "bottom")}
                    whenDragOver={
                        <Box
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                backgroundColor: theme.colors.blue.ultralight,
                            }}
                        >
                            <Box
                                style={{
                                    backgroundColor: theme.colors.blue.ultralight,
                                    borderBottom: "3px solid",
                                    borderBottomColor: theme.colors.blue.dark,
                                    width: "100%",
                                    height: "10px",
                                    alignSelf: "start",
                                }}
                            />
                        </Box>
                    }
                />
            </>
        );
    } else {
        return (
            <Droppable
                onDrop={onDrop}
                kind={kind}
                acceptedType={acceptedTypes}
                payload={firstTargetPayload}
                id={getDndId(resourceUid, day, 0)}
                isDroppable={isDroppable}
                styleProvider={getEmptyCellDropStyle}
            />
        );
    }

    function getEmptyCellDropStyle(_isDragging: boolean, isOver: boolean) {
        return {
            borderTop: "3px solid",
            borderTopColor: isOver || DND_DEBUGGER ? theme.colors.blue.dark : "transparent",
            left: "0px",
            top: "0px",
            opacity: 0.7,
            backgroundColor: isOver ? theme.colors.blue.ultralight : getBackgroundColor(),
        };
    }

    function getCellPartDropStyle(
        card: SchedulerCardFormatted,
        position?: "top" | "bottom"
    ): (isDragging: boolean, isOver: boolean) => CSSProperties {
        return (isDragging: boolean, isOver: boolean) => {
            let overHeight = Math.min(card.height, MIN_CELL_HEIGHT);
            let top = `${card.y + card.height + 6 - overHeight / 2}px`;
            let height = `${overHeight}px`;
            let paddingTop = "0px";
            if (position === "top") {
                top = `0px`;
                if (card.y > 0) {
                    height = `${card.y}px`;
                } else {
                    height = `${MIN_CELL_HEIGHT / 2}px`;
                }
            } else if (position === "bottom") {
                top = `${card.y + card.height - MIN_CELL_HEIGHT / 2}px`;
                height = `calc(100% - ${card.y + card.height - MIN_CELL_HEIGHT / 2}px)`;
                paddingTop = `${MIN_CELL_HEIGHT / 2}px`;
            }
            let style: CSSProperties = {
                backgroundColor: getBackgroundColor(),
                opacity: 0.7,
                position: "absolute",
                width: "100%",
                top,
                left: "0px",
                height,
                paddingTop,
            };
            if (isDragging) {
                style.zIndex = theme.zIndices.level2;
            }
            if (isOver) {
                style.zIndex = theme.zIndices.level3;
            }
            if (isOver || DND_DEBUGGER) {
                if (position === "top") {
                    // nothing
                } else if (position === "bottom") {
                    // nothing
                } else {
                    style.display = "flex";
                }
            }
            return style;
        };
    }

    function getBackgroundColor() {
        return DND_DEBUGGER ? theme.colors.turquoise.ultralight : "transparent";
    }
}

function getDndId(resourceUid: string, day: Date, index: number) {
    return `${resourceUid}_${day.toISOString()}_${index.toString()}`;
}
