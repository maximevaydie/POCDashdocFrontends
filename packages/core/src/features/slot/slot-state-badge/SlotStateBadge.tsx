import {Text} from "@dashdoc/web-ui";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import {slotServices} from "services/slot.service";
import {Slot} from "types";

type Props = {
    slot: Slot;
};
export function SlotStateBadge({slot}: Props) {
    const timezone = useSiteTimezone();
    const stateDisplay = slotServices.getSlotStateDisplay(slot, timezone);
    if (!stateDisplay.smallBadgeColor) {
        return null;
    }
    return (
        <Text
            data-testid="slot-card-right-text"
            backgroundColor={stateDisplay.smallBadgeColor}
            color="grey.white"
            py={1}
            px={2}
            borderRadius={1}
            variant="captionBold"
            textAlign="center"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            overflow="hidden"
        >
            {stateDisplay.text}
        </Text>
    );
}
