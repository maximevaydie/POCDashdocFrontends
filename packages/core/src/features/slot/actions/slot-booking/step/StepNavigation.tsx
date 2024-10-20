import {t} from "@dashdoc/web-core";
import {Box, Flex, OnDesktop, OnMobile, Text, HorizontalStepper} from "@dashdoc/web-ui";
import {SlotTime, Step, TurnToStep} from "features/slot/actions/slot-booking/step/types";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import {addMinutes, isSameDay, tz} from "services/date";
import {TzDate, Zone} from "types";

import {SidebarStep} from "./SidebarStep";

const ZONE_SELECTION_STEP = 1;
const SLOT_SELECTION_STEP = 2;
const INFORMATIONS_STEP = 3;

function getStepDescriptions(): {label: string; step: Step}[] {
    return [
        {label: t("flow.slot.zoneChoice"), step: 1},
        {label: t("flow.slot.slotChoice"), step: 2},
        {label: t("components.complementaryInformation"), step: 3},
    ];
}

interface Props {
    currentStep: Step;
    turnToStep: TurnToStep;
    selectedSlotTime: SlotTime | null;
    selectedZone: Zone | null;
}

export function StepNavigation({currentStep, turnToStep, selectedZone, selectedSlotTime}: Props) {
    const timezone = useSiteTimezone();
    const slotTime = getTimeLabel();
    const stepDescriptions = getStepDescriptions();
    const currentStepDescription = stepDescriptions.find(({step}) => step === currentStep);

    return (
        <>
            <OnDesktop>
                <Box>
                    {stepDescriptions.map(({label, step}) => (
                        <SidebarStep
                            key={step}
                            step={step}
                            currentStep={currentStep}
                            stepName={label}
                            turnToStep={turnToStepWithValidation}
                            selected={
                                step === ZONE_SELECTION_STEP
                                    ? selectedZone?.name
                                    : step === SLOT_SELECTION_STEP
                                    ? slotTime
                                    : null
                            }
                        />
                    ))}
                </Box>
            </OnDesktop>

            {/* TODO Refactor SidebarStep to avoid this OnMobile case */}
            <OnMobile>
                <Box>
                    <Flex justifyContent="center">
                        <Box width="220px">
                            <HorizontalStepper
                                currentStep={currentStep - 1}
                                finalStep={stepDescriptions.length - 1}
                                turnToStep={handleTurnToStep}
                            />
                        </Box>
                    </Flex>
                    {currentStepDescription && (
                        <Text mt={4} variant="h2" textAlign="center" color="blue.default">
                            {currentStepDescription.label}
                        </Text>
                    )}
                </Box>
            </OnMobile>
        </>
    );

    function handleTurnToStep(step: number) {
        turnToStepWithValidation((step + 1) as Step);
    }

    async function turnToStepWithValidation(newStep: Step) {
        if (newStep === SLOT_SELECTION_STEP && !selectedZone) {
            // Stop the User from going next step without selecting a zone
            return;
        }
        if (newStep === INFORMATIONS_STEP && !selectedSlotTime) {
            // Stop the User from going next step without selecting a slot time
            return;
        }
        await turnToStep(newStep);
    }

    function getTimeLabel() {
        if (selectedSlotTime && selectedZone) {
            const startTime = tz.convert(selectedSlotTime.startTime, timezone);
            let endTime: TzDate;
            if ("endTime" in selectedSlotTime) {
                endTime = tz.convert(selectedSlotTime.endTime, timezone);
            } else {
                endTime = addMinutes(startTime, selectedZone.slot_duration);
            }
            if (isSameDay(startTime, endTime)) {
                return `${tz.format(startTime, "EEEE dd MMMM, HH:mm")} ${t(
                    "common.timeTo"
                )} ${tz.format(endTime, "HH:mm")}`;
            } else {
                return `${tz.format(startTime, "EEEE dd MMMM, HH:mm")} ${t(
                    "common.timeTo"
                )} ${tz.format(endTime, "EEEE dd MMMM, HH:mm")}`;
            }
        } else {
            return "";
        }
    }
}
