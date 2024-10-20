import {t} from "@dashdoc/web-core";
import {IconButton, TooltipWrapper} from "@dashdoc/web-ui";
import {differenceInDays} from "date-fns";
import React, {useState} from "react";

import {RawCarrierCharteringSchedulerSegment} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";

import SendInstructionModal from "./SendInstructionsModal";
export function SendInstructionStatus({
    day,
    currentDate,
    notSentSegments,
    allRowsLoaded,
    loadAllRows,
    isLoadingRows,
    isLoadingSegments,
    onInstructionsSent,
}: {
    day: Date;
    currentDate: Date;
    notSentSegments: RawCarrierCharteringSchedulerSegment[];
    allRowsLoaded: boolean;
    loadAllRows: () => void;
    isLoadingRows: boolean;
    isLoadingSegments: boolean;
    onInstructionsSent: (string: string) => void;
}) {
    let icon, tooltipText;
    const [instructionsModalOpen, setInstructionsModalOpen] = useState(false);

    if (differenceInDays(currentDate, day) > 0) {
        icon = <IconButton name="calendarTimes" disabled fontSize={4} />;
        tooltipText = t("scheduler.instructions.dayEndedTooltip");
    } else if (notSentSegments.length || !allRowsLoaded) {
        tooltipText = t("scheduler.instructions.toSendTooltipCharter");
        icon = (
            <IconButton
                name="calendar"
                color="blue.default"
                onClick={() => setInstructionsModalOpen(true)}
                fontSize={4}
            />
        );
    } else {
        icon = <IconButton name="calendarCheck" color="green.dark" fontSize={4} />;
        tooltipText = t("scheduler.instructions.alreadySentTooltipCharter");
    }

    return (
        <>
            {instructionsModalOpen && (
                <SendInstructionModal
                    day={day}
                    onClose={() => setInstructionsModalOpen(false)}
                    notSentSegments={notSentSegments}
                    loadAllRows={loadAllRows}
                    isLoadingRows={isLoadingRows}
                    isLoadingSegments={isLoadingSegments}
                    onInstructionsSent={onInstructionsSent}
                />
            )}
            <TooltipWrapper content={tooltipText} placement="top">
                {icon}
            </TooltipWrapper>
        </>
    );
}
