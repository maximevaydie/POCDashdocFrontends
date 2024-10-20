import {DefaultMap} from "@dashdoc/web-core";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import {differenceInDays, endOfDay, isSameDay, startOfDay} from "date-fns";
import sortBy from "lodash.sortby";

import {SCHEDULER_CARD_HEIGHT_MARGIN} from "../gridStyles";
import {SchedulerCard} from "../scheduler.types";

import {DateToCardsMap, SchedulerCardFormatted} from "./schedulerByDay.types";

export function buildDayToCardMap(
    cards: SchedulerCard[],
    startDate: Date,
    endDate: Date,
    timezone: string
): DateToCardsMap {
    const cardsByDay = new DateToCardsMap();

    const currentPositionsInACell = new DefaultMap<string, number>(null, () => 0);
    let currentDay, cardCurrentPosition;

    // The main goal is to know the cell, the position in the cell and the number of cells a card occupy.
    // This way we are able to render the card at its position.

    // sort first by day (date without time), then by order, then by time
    const sortedCards = getSortedCards(cards, timezone);

    for (let card of sortedCards) {
        //  cards without start dates or out of the dates scope
        if (
            !card.startDate ||
            card.endDate < startOfDay(startDate) ||
            card.startDate > endOfDay(endDate)
        ) {
            continue;
        }

        // If card starts before dates range, it will be displayed on first day
        const startDateInTable = startOfDay(
            card.startDate < startDate ? startDate : card.startDate
        );
        // If card ends after dates range, the card will ends on last day
        const endDateInTable = endOfDay(
            card.endDate && card.endDate > endDate ? endDate : card.endDate || startDateInTable
        );

        if (!currentDay || !isSameDay(startDateInTable, currentDay)) {
            currentDay = startDateInTable;
        }

        // We loop though all the days that are in the cards and are between the
        // scheduler startDate and endDate.
        // Then we add only one entry in our map by days for each card
        // The looping though each day of a card is used to determine the current position
        // that new added card should have in the cell. All these positions are stored in
        // `currentPositionsInACell`.
        for (
            let date = new Date(startDateInTable);
            date < endDateInTable;
            date.setDate(date.getDate() + 1)
        ) {
            let tableCard: SchedulerCardFormatted;
            const currentPositionKey = `${card.resourceUid}${formatDate(date, "dd-MM")}`;

            if (isSameDay(currentDay, date)) {
                // If it is the first of the cards in the scheduler we add it to
                // be rendered in the cell with its length (number of day) in scheduler and its
                // position in the cell.

                const inconsistentOrder =
                    (cardsByDay?.get(date.valueOf()) ?? []).findIndex(
                        (c) => c.startDate > card.endDate && !c.ignoreForOrdering
                    ) >= 0;
                const cardsInCell = cardsByDay?.get(date.valueOf()) ?? [];

                tableCard = {
                    ...card,
                    y: currentPositionsInACell.get(currentPositionKey) ?? 0,
                    width: differenceInDays(endDateInTable, startDateInTable) + 1,
                    inconsistentOrder,
                };
                currentPositionsInACell.set(
                    currentPositionKey,
                    (currentPositionsInACell.get(currentPositionKey) ?? 0) +
                        card.height +
                        SCHEDULER_CARD_HEIGHT_MARGIN
                );
                cardCurrentPosition = currentPositionsInACell.get(currentPositionKey);
                cardsInCell.push(tableCard);
            } else {
                // If it is all the other days in the trip we register the current position
                // of this trip in the cells where the trip is displayed in.
                // @ts-ignore
                currentPositionsInACell.set(currentPositionKey, cardCurrentPosition);
            }
        }
    }

    return cardsByDay;
}

function getSortedCards(cards: SchedulerCard[], timezone: string) {
    return sortBy(cards, [
        (c) => formatDate(parseAndZoneDate(c.startDate, timezone), "yyyy-MM-dd"),
        (c) => c.sortOrder,
        (c) => c.startDate,
        (c) => c.defaultSort,
    ]);
}
