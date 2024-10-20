import {Flex} from "@dashdoc/web-ui";
import {RescheduleSlotAction} from "features/slot/actions/edit-slot/RescheduleSlotAction";
import {CancelSlotAction} from "features/slot/actions/edit-state/cancel/CancelSlotAction";
import React from "react";
import {rightPolicyServices} from "services/rightPolicy.service";
import {FlowProfile, Slot, Zone} from "types";

function doNothing() {}

type Props = {
    slot: Slot;
    zone: Zone;
    profile: FlowProfile;
};

export function SecondaryActions({slot, zone, profile}: Props) {
    const isCancelable = rightPolicyServices.canUpdateSlot(slot, profile, "cancel");
    const isReschedulable = rightPolicyServices.canUpdateSlot(slot, profile, "reschedule");
    if (isCancelable || isReschedulable) {
        return (
            <Flex mt={4} justifyContent="space-between" style={{gap: "4px"}}>
                {isCancelable && <CancelSlotAction slot={slot} onAction={doNothing} />}
                {isReschedulable && <RescheduleSlotAction slot={slot} zone={zone} />}
            </Flex>
        );
    }
    return null;
}
