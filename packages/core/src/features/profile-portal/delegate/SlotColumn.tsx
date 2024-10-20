import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import {SlotCardDetails} from "features/slot/slot-card-details/SlotCardDetails";
import React from "react";
import {Slot} from "types";

type Props = {
    slots: Slot[];
    timezone: string;
    label: string;
    onSlotClick: (slot: Slot) => void;
};

export function SlotColumn({slots, timezone, label, onSlotClick}: Props) {
    return (
        <Box
            style={{
                display: "grid",
                gridTemplateRows: `min-content 1fr`,
            }}
            minHeight={100}
            backgroundColor="grey.ultralight"
            borderRadius={2}
            flexGrow={1}
        >
            <Box
                textAlign="center"
                paddingY={2}
                borderBottom="1px solid"
                borderBottomColor="grey.light"
            >
                <Text variant="h2">{label}</Text>
                <Text color="grey.dark" variant="caption">
                    {t("flow.profilePortal.slotsBooked", {smart_count: slots.length})}
                </Text>
            </Box>
            <Flex
                flexDirection="column"
                overflowY="auto"
                mx={[0, 0, 3]}
                my={3}
                flexGrow={1}
                style={{gap: "10px"}}
            >
                {slots.map((slot) => (
                    <Box
                        data-testid="slot-column-card"
                        key={slot.id}
                        onClick={() => onSlotClick(slot)}
                    >
                        <SlotCardDetails isSelected={false} slot={slot} timezone={timezone} />
                    </Box>
                ))}
            </Flex>
        </Box>
    );
}
