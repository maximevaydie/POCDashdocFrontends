import {Box, Flex} from "@dashdoc/web-ui";
import {differenceInMinutes, addMinutes, min, max} from "date-fns";
import isEqual from "lodash.isequal";
import sortBy from "lodash.sortby";
import React, {ReactNode, useCallback, useMemo} from "react";

import {TIME_CELL_WIDTH} from "../../gridStyles";
import {SchedulerCard} from "../../scheduler.types";
import {Card} from "../card/Card";
import {ResizeData} from "../schedulerByTime.types";
import {schedulerDatesService} from "../service/dates.service";

type Props = {
    resourceUid: string;

    start: Date;
    end: Date;
    minuteScale: number; // scale in minutes
    dateSections: Array<{start: Date; end: Date}>;

    cards: SchedulerCard[] | undefined;
    getCardContent: (card: SchedulerCard, displayStart: Date, displayEnd: Date) => ReactNode;
    resizeData: ResizeData;
};
export const CardsRow = React.memo(function SchedulerByTimeCardRow({
    resourceUid,
    start,
    end,
    minuteScale,
    dateSections,
    cards,
    getCardContent,
    resizeData,
}: Props) {
    const formattedCardsAndPositionByRow = useMemo(
        () => getFormattedCardsByTime(cards, start, end, minuteScale),
        [cards, start, end, minuteScale]
    );
    const onResizeDone = useCallback(
        (card: SchedulerCard, width: number) => {
            const endDate = schedulerDatesService.getEndDateFromStartDateAndWidth(
                max([card.startDate, start]),
                width,
                minuteScale,
                dateSections
            );

            resizeData.onResizeDone(card.itemUid, card.type, endDate);
        },
        [minuteScale, resizeData, dateSections, start]
    );
    return (
        <Box py={1} width="100%" overflowX="clip">
            {formattedCardsAndPositionByRow.map((formattedCardsAndPosition, index) => (
                <Flex width="fit-content" key={index}>
                    {formattedCardsAndPosition?.map(({card, position}) => {
                        return (
                            <Card
                                key={card.itemUid}
                                card={card}
                                start={start}
                                dateSections={dateSections}
                                position={position}
                                resourceUid={resourceUid}
                                onResizeDone={onResizeDone}
                                resizable={resizeData.isResizable(
                                    card.itemUid,
                                    card.type,
                                    card.resizable && card.endDate < end
                                )}
                                minuteScale={minuteScale}
                            >
                                {getCardContent(card, start, end)}
                            </Card>
                        );
                    })}
                </Flex>
            ))}
        </Box>
    );
}, arePropsEqual);

function arePropsEqual(oldProps: Props, newProps: Props) {
    return (
        oldProps.resourceUid === newProps.resourceUid &&
        oldProps.start === newProps.start &&
        oldProps.end === newProps.end &&
        oldProps.minuteScale === newProps.minuteScale &&
        oldProps.resizeData === newProps.resizeData &&
        oldProps.getCardContent === newProps.getCardContent &&
        isEqual(oldProps.cards, newProps.cards)
    );
}

function getFormattedCardsByTime(
    cards: SchedulerCard[] | undefined,
    start: Date,
    end: Date,
    minuteScale: number // scale in minutes
) {
    const filterdCards = cards?.filter((c) => c.endDate > start && c.startDate < end);
    const sortedCards = sortBy(filterdCards, "startDate", "sortOrder");
    const cardsByRow: Record<
        number,
        {
            card: SchedulerCard;
            position: {leftOffset: number; width: number; stepOffset: number};
        }[]
    > = {};
    const endDateByRow = [];
    const factor = TIME_CELL_WIDTH / minuteScale;
    for (let card of sortedCards) {
        let rowIndex: number = endDateByRow.findIndex(
            (date) => differenceInMinutes(card.startDate, date) >= 0
        );
        if (rowIndex === -1) {
            rowIndex = endDateByRow.length;
        }
        if (!cardsByRow[rowIndex]) {
            cardsByRow[rowIndex] = [];
        }
        cardsByRow[rowIndex].push({
            card,
            position: getCardPosition(card, start, end, minuteScale, endDateByRow[rowIndex]),
        });

        if (differenceInMinutes(card.endDate, card.startDate) * factor < cardMinimalWidth) {
            // consider end date of the card to correspond to minimal width of the card
            endDateByRow[rowIndex] = addMinutes(
                new Date(card.startDate),
                cardMinimalWidth / factor
            );
        } else {
            endDateByRow[rowIndex] = card.endDate;
        }
    }
    return Object.values(cardsByRow);
}
const cardMinimalWidth = 24;
function getCardPosition(
    card: SchedulerCard,
    start: Date,
    end: Date,
    minuteScale: number, // scale in minutes
    previousDate: Date | undefined
) {
    const factor = TIME_CELL_WIDTH / minuteScale;
    const cardStart = max([card.startDate, start]);
    const cardEnd = min([card.endDate, end]);
    const leftOffset = differenceInMinutes(cardStart, previousDate ?? start) * factor;
    const width = differenceInMinutes(cardEnd, cardStart) * factor;
    const cardWidth = Math.max(cardMinimalWidth, width);
    const stepOffset = (differenceInMinutes(start, cardStart) * factor) % TIME_CELL_WIDTH;
    return {leftOffset, width: cardWidth, stepOffset};
}
