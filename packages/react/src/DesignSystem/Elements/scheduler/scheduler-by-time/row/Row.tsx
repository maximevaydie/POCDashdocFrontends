import {Box, Flex, useDevice} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

import {CollapsedCell} from "../../components/CollapsedCell";
import {
    CarrierRevenueCell,
    CarrierSchedulerBodyRow,
    CarrierSchedulerRowHeadingCell,
} from "../../gridStyles";
import {SchedulerCard} from "../../scheduler.types";
import {ResizeData} from "../schedulerByTime.types";
import {schedulerDatesService} from "../service/dates.service";

import {CardsRow} from "./CardsRow";
import {DatesGrid} from "./DatesGrid";
import {Dropzone} from "./Dropzone";

type SchedulerRowProps = {
    resourceUid: string;
    resourceLabel: string | ReactNode;
    resourceIndex: number;

    dateSections: Array<{start: Date; end: Date}>;
    minuteScale: number; // scale in minutes

    cards: SchedulerCard[] | undefined;
    getCardContent: (card: SchedulerCard, displayStart: Date, displayEnd: Date) => ReactNode;
    getAdditionalResourceInformation?: (resourceUid: string) => ReactNode;
    onCellRightClick?: (event: MouseEvent, resourceUid: string, day: Date) => void;
    resizeData: ResizeData;
};

export const SchedulerByTimeRow = React.memo(function SchedulerRow({
    resourceUid,
    resourceLabel,
    resourceIndex,
    dateSections,
    minuteScale,
    cards,
    getCardContent,
    getAdditionalResourceInformation,
    onCellRightClick,
    resizeData,
}: SchedulerRowProps) {
    const device = useDevice();
    return (
        <CarrierSchedulerBodyRow isOddRow data-testid="scheduler-row">
            {/* RESOURCE */}
            <CarrierSchedulerRowHeadingCell data-testid="scheduler-row-name">
                {resourceLabel}
            </CarrierSchedulerRowHeadingCell>
            {/* EXTRA CELL */}
            <CarrierRevenueCell
                data-testid={`scheduler-row-revenue-${resourceIndex}`}
                isOddRow
                sticky={device !== "mobile"}
            >
                {getAdditionalResourceInformation?.(resourceUid)}
            </CarrierRevenueCell>

            <Flex width="100%">
                {dateSections.map((dateSection, index) => (
                    <>
                        <TimeRowSection
                            key={index}
                            cards={cards}
                            getCardContent={getCardContent}
                            resizeData={resizeData}
                            onCellRightClick={onCellRightClick}
                            start={dateSection.start}
                            end={dateSection.end}
                            minuteScale={minuteScale}
                            dateSections={dateSections}
                            resourceUid={resourceUid}
                            resourceIndex={resourceIndex}
                        />
                        {index !== dateSections.length - 1 && (
                            <CollapsedCell
                                start={dateSection.end}
                                end={dateSections[index + 1].start}
                                cards={cards}
                            />
                        )}
                    </>
                ))}
            </Flex>
        </CarrierSchedulerBodyRow>
    );
});

function TimeRowSection({
    cards,
    getCardContent,
    resizeData,
    onCellRightClick,
    start,
    end,
    minuteScale,
    dateSections,
    resourceUid,
    resourceIndex,
}: {
    cards: SchedulerCard[] | undefined;
    getCardContent: (card: SchedulerCard, displayStart: Date, displayEnd: Date) => ReactNode;
    resizeData: ResizeData;
    onCellRightClick?: (event: MouseEvent, resourceUid: string, day: Date) => void;

    start: Date;
    end: Date;
    minuteScale: number; // scale in minutes
    dateSections: Array<{start: Date; end: Date}>;

    resourceUid: string;
    resourceIndex: number;
}) {
    return (
        <Box
            width={schedulerDatesService.getDayWidth(start, end, minuteScale)}
            position="relative"
            data-testid="scheduler-row-content"
        >
            <Flex position="absolute" top={0} left={0} height="100%" width="100%">
                <Dropzone
                    startDate={start}
                    minuteScale={minuteScale}
                    resourceUid={resourceUid}
                    isFirstRow={resourceIndex === 0}
                />
                <DatesGrid
                    start={start}
                    end={end}
                    minuteScale={minuteScale}
                    resourceUid={resourceUid}
                    onCellRightClick={onCellRightClick}
                />
            </Flex>

            <CardsRow
                cards={cards}
                start={start}
                end={end}
                minuteScale={minuteScale}
                dateSections={dateSections}
                resourceUid={resourceUid}
                getCardContent={getCardContent}
                resizeData={resizeData}
            />
        </Box>
    );
}
