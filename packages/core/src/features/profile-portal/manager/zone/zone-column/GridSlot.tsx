import {Flex} from "@dashdoc/web-ui";
import {SlotCard} from "features/slot/slot-card/SlotCard";
import React from "react";
import {useDispatch} from "redux/hooks";
import {selectSlot} from "redux/reducers/flow/slot.slice";
import {fetchSlotEvents} from "redux/reducers/flow/slotEvents.slice";
import {Slot, Zone} from "types";

type Props = {
    slots: Slot[];
    zone: Zone;
    overload: boolean;
};

export function GridSlot({overload, slots, zone}: Props) {
    const dispatch = useDispatch();
    if (slots.length === 0) {
        return null;
    }
    return (
        <Flex flexDirection="column" marginY={2} marginX={3} style={{gap: "8px"}}>
            {slots.map((slot) => (
                <SlotCard
                    key={slot.id}
                    slot={slot}
                    zone={zone}
                    overload={overload}
                    onClick={() => handleSlotClick(slot)}
                />
            ))}
        </Flex>
    );

    function handleSlotClick(slot: Slot) {
        dispatch(selectSlot(slot.id));
        dispatch(fetchSlotEvents({slot: slot.id}));
    }
}
