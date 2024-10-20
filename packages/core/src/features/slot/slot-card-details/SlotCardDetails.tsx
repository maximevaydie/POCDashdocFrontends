import {Box, ClickableBox, Flex, Text, TooltipWrapper, useDevice} from "@dashdoc/web-ui";
import {SlotStateBadge} from "features/slot/slot-state-badge/SlotStateBadge";
import {SlotTooltip} from "features/slot/slot-tooltip/SlotTooltip";
import React from "react";
import {tz} from "services/date";
import {Slot} from "types";

import {CardInfos} from "./components/CardInfos";

export type Props = {
    slot: Slot;
    timezone: string;
    isSelected: boolean;
    onClick?: () => void;
};

export function SlotCardDetails({slot, isSelected, timezone, onClick}: Props) {
    const date = tz.convert(slot.start_time, timezone);
    const start = tz.format(date, "PPPp");
    const device = useDevice();
    return (
        <TooltipWrapper content={<SlotTooltip slot={slot} />} hidden={device !== "desktop"}>
            <ClickableBox
                onClick={onClick}
                border="1px solid"
                borderColor={isSelected ? "blue.default" : "grey.light"}
                borderRadius="1"
                hoverStyle={{bg: "grey.ultralight"}}
                backgroundColor="grey.white"
            >
                <Flex
                    paddingX="4"
                    paddingTop="2"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <CardInfos slot={slot} />
                    <SlotStateBadge slot={slot} />
                </Flex>
                <Box backgroundColor="grey.light" borderRadius="1">
                    <Text variant="caption" paddingY="2" marginX="3">
                        {start}
                    </Text>
                </Box>
            </ClickableBox>
        </TooltipWrapper>
    );
}
