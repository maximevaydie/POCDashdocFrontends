import {SchedulerCard, useDevice} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import {endOfDay} from "date-fns";
import isEqual from "lodash.isequal";
import React, {ReactNode, useCallback, useMemo} from "react";

import {CollapsedCell} from "../../components/CollapsedCell";
import {
    CarrierRevenueCell as AdditionalCell,
    CarrierSchedulerBodyRow,
    CarrierSchedulerRowHeadingCell,
} from "../../gridStyles";
import {Cell} from "../cell/Cell";
import {buildDayToCardMap} from "../schedulerByDay.service";
import {SideSwipeType, SchedulerCardFormatted} from "../schedulerByDay.types";

type Props = {
    resourceUid: string;
    resourceLabel: string | ReactNode;
    resourceIndex: number;
    daysSections: Date[][];
    timezone: string;
    animation: SideSwipeType;
    cards: SchedulerCard[];
    getCardContent: (
        card: SchedulerCardFormatted,
        displayStart: Date,
        displayEnd: Date
    ) => ReactNode;
    getAdditionalResourceInformation?: (resourceUid: string) => ReactNode;
    onCellRightClick?: (
        event: React.MouseEvent<HTMLElement>,
        resourceUid: string,
        day: Date
    ) => void;
};

export const Row = React.memo(function Row({
    resourceUid,
    resourceLabel,
    resourceIndex,
    daysSections,
    timezone,
    animation,
    cards,
    getCardContent,
    getAdditionalResourceInformation,
    onCellRightClick,
}: Props) {
    const device = useDevice();
    return (
        <CarrierSchedulerBodyRow isOddRow={resourceIndex % 2 === 0} data-testid="scheduler-row">
            {/* RESOURCE */}
            <CarrierSchedulerRowHeadingCell data-testid="scheduler-row-name">
                {resourceLabel}
            </CarrierSchedulerRowHeadingCell>
            {/* EXTRA CELL */}
            <AdditionalCell
                data-testid={`scheduler-row-revenue-${resourceIndex}`}
                isOddRow={resourceIndex % 2 === 0}
                sticky={device !== "mobile"}
            >
                {getAdditionalResourceInformation?.(resourceUid)}
            </AdditionalCell>

            {/* DAYS */}
            {daysSections.map((daysSection, index) => (
                <React.Fragment key={index}>
                    <RowSection
                        key={index}
                        days={daysSection}
                        timezone={timezone}
                        cards={cards}
                        resourceUid={resourceUid}
                        resourceIndex={resourceIndex}
                        animation={animation}
                        getCardContent={getCardContent}
                        onCellRightClick={onCellRightClick}
                    />
                    {index !== daysSections.length - 1 && (
                        <CollapsedCell
                            start={endOfDay(daysSection[daysSection.length - 1])}
                            end={daysSections[index + 1][0]}
                            cards={cards}
                        />
                    )}
                </React.Fragment>
            ))}
        </CarrierSchedulerBodyRow>
    );
}, arePropsEqual);

function arePropsEqual(oldProps: Props, newProps: Props) {
    return (
        oldProps.resourceUid === newProps.resourceUid &&
        oldProps.resourceLabel === newProps.resourceLabel &&
        oldProps.resourceIndex === newProps.resourceIndex &&
        oldProps.getAdditionalResourceInformation === newProps.getAdditionalResourceInformation &&
        oldProps.daysSections === newProps.daysSections &&
        oldProps.timezone === newProps.timezone &&
        oldProps.animation === newProps.animation &&
        oldProps.getCardContent === newProps.getCardContent &&
        isEqual(oldProps.cards, newProps.cards)
    );
}

function RowSection({
    days,
    timezone,
    cards,
    resourceUid,
    resourceIndex,
    animation,
    getCardContent,
    onCellRightClick,
}: {
    days: Date[];
    timezone: string;
    cards: SchedulerCard[];
    resourceUid: string;
    resourceIndex: number;
    animation: SideSwipeType;
    getCardContent: (
        card: SchedulerCardFormatted,
        displayStart: Date,
        displayEnd: Date
    ) => ReactNode;
    onCellRightClick?: (
        event: React.MouseEvent<HTMLElement>,
        resourceUid: string,
        day: Date
    ) => void;
}) {
    const cardsByDay = useMemo(() => {
        const startDate = days[0];
        const endDate = days[days.length - 1];
        return buildDayToCardMap(cards, startDate, endDate, timezone);
    }, [cards, days, timezone]);

    const getCardContentInDays = useCallback(
        (card: SchedulerCardFormatted) =>
            getCardContent(card, days[0], endOfDay(days[days.length - 1])),
        [days, getCardContent]
    );
    return (
        <>
            {days.map((day) => {
                /**
                 * Key is useful to avoid a stranger bug with after some dnd
                 * The first trip becomes undraggable...
                 */
                const cards = cardsByDay?.get(day.valueOf()) ?? [];
                const key = `cell-${resourceUid}-${resourceIndex}-${formatDate(day, "MM-dd")}-${
                    cards.length
                }`;
                return (
                    <Cell
                        key={key}
                        resourceUid={resourceUid}
                        day={day}
                        animation={animation}
                        cards={cards}
                        getCardContent={getCardContentInDays}
                        onCellRightClick={onCellRightClick}
                    />
                );
            })}
        </>
    );
}
