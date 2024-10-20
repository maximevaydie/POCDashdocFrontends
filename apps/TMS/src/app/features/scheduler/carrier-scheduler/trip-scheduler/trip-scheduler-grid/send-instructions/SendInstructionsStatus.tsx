import {t} from "@dashdoc/web-core";
import {IconButton, TooltipWrapper} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import {differenceInDays} from "date-fns";
import React, {useState} from "react";

import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

import {SendInstructionModal} from "./components/SendInstructionsModal";

export function SendInstructionStatus({
    day,
    currentDate,
    hasTripsToSend,
    allRowsLoaded,
    viewMode,
    size = "medium",
}: {
    day: Date;
    currentDate: Date;
    hasTripsToSend: boolean;
    allRowsLoaded: boolean;
    viewMode: TripSchedulerView;
    size?: "small" | "medium";
}) {
    let icon, tooltipText;
    const [instructionsModalOpen, setInstructionsModalOpen] = useState(false);
    const iconSize = size === "medium" ? 4 : 2;

    if (differenceInDays(currentDate, day) > 0) {
        icon = (
            <IconButton
                data-testid={`send-instruction-day-ended-${formatDate(day, "MM-dd")}`}
                name="calendarTimes"
                disabled
                fontSize={iconSize}
            />
        );
        tooltipText = t("scheduler.instructions.dayEndedTooltip");
    } else if (hasTripsToSend || !allRowsLoaded) {
        tooltipText = t("scheduler.instructions.toSendTooltip");
        icon = (
            <IconButton
                data-testid={`send-instruction-open-modal-${formatDate(day, "MM-dd")}`}
                name="calendar"
                color="blue.default"
                onClick={() => setInstructionsModalOpen(true)}
                fontSize={iconSize}
            />
        );
    } else {
        icon = (
            <IconButton
                data-testid={`send-instruction-already-sent-${formatDate(day, "MM-dd")}`}
                name="calendarCheck"
                color="green.dark"
                fontSize={iconSize}
            />
        );
        tooltipText = t("scheduler.instructions.alreadySentTooltip");
    }

    return (
        <>
            {instructionsModalOpen && (
                <SendInstructionModal
                    day={day}
                    onClose={() => setInstructionsModalOpen(false)}
                    viewMode={viewMode}
                />
            )}
            <TooltipWrapper content={tooltipText} placement="top">
                {icon}
            </TooltipWrapper>
        </>
    );
}
