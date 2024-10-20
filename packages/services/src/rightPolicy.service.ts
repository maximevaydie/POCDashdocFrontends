import {FlowProfile, Slot} from "types";

/**
 * Business rule to know if a user can create a company.
 * This company will be selectable in the company selector for a slot.
 */
function canCreateCompany(profile: FlowProfile) {
    return ["siteManager", "delegate"].includes(profile);
}

/**
 * Implementation of the right policy for slot update.
 * https://www.notion.so/dashdoc/Delegation-be86e6d75da94491a18d467bb3add200?pvs=4#ceb739cee8b6413fa17b5f4746610990
 */
function canUpdateSlot(
    slot: Slot,
    profile: FlowProfile,
    mutationOn:
        | "reschedule"
        | "cancel"
        | "references"
        | "custom_fields"
        | "notes"
        | "company"
        | "state"
) {
    if (mutationOn === "cancel") {
        return canCancel(slot, profile);
    }
    if (profile === "siteManager") {
        if (mutationOn === "reschedule") {
            return slot.state === "planned";
        }
        return true; // The site manager can update everything
    }
    if (profile === "delegate") {
        /**
         * Note is always updatable
         */
        if (mutationOn === "notes") {
            return true;
        }

        /**
         * A delegate cannot update the state (excepted for a cancellation handled before)
         */
        if (mutationOn === "state") {
            return false;
        }

        /**
         * Reschedule, references and company are updatable only for planned and in window slots
         */
        if (["reschedule", "references", "custom_fields", "company"].includes(mutationOn)) {
            const {state, within_booking_window} = slot;
            return state === "planned" && within_booking_window;
        }
    }
    return false;
}

function canCancel(slot: Slot, profile: FlowProfile) {
    const {state} = slot;
    // only planned slots can be cancelled
    if (state !== "planned") {
        return false;
    }
    // A site manager can cancel any slot at any time
    if (profile === "siteManager") {
        return true;
    }
    // A delegate cannot cancel a slot out of the booking window
    if (profile === "delegate") {
        const {within_booking_window} = slot;
        if (within_booking_window) {
            return true;
        }
    }
    return false;
}

export const rightPolicyServices = {
    canCreateCompany,
    canUpdateSlot,
};
