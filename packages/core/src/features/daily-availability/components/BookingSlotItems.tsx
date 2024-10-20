import {Badge, Box, Flex, Icon, OnDesktop, OnMobile, Text, useDevice} from "@dashdoc/web-ui";
import {RegularSlotTime, SlotTime} from "features/slot/actions/slot-booking/step/types";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React, {useState} from "react";
import {useFormContext} from "react-hook-form";
import {tz} from "services/date";
import {AvailabilityStatus} from "types";

interface BookingSlotItemsProps {
    availabilities: AvailabilityStatus[];
    selectedSlotTime: SlotTime | null;
    isMulti: boolean;
    onSelectSlotTime: (selectedSlotTime: SlotTime) => Promise<void>;
}

export function BookingSlotItems({
    availabilities,
    onSelectSlotTime,
    selectedSlotTime,
    isMulti,
}: BookingSlotItemsProps) {
    const {setValue} = useFormContext(); // Access form context from parent form
    const timezone = useSiteTimezone();
    // TODO: avoid using this hook here : only to fix the responsive issue quickly
    const device = useDevice();
    const [hoveredSlotTime, setHoveredSlotTime] = useState<string | null>(null);

    return (
        <>
            {availabilities.map((availability) => {
                const date = tz.convert(availability.start_time, timezone);
                const formatted = tz.format(date, "HH:mm");

                const isSelected =
                    availability.start_time === selectedSlotTime?.startTime ||
                    availability.start_time === hoveredSlotTime;

                return (
                    <Box
                        data-testid="booking-slot-item"
                        border="2px solid"
                        minWidth="60px"
                        borderRadius={1}
                        marginY={device === "desktop" ? 4 : 0}
                        backgroundColor={"purple.ultralight"}
                        borderColor={isSelected ? "purple.light" : "transparent"}
                        key={availability.start_time}
                        onClick={() => handleSelect(availability)}
                        onMouseEnter={() => setHoveredSlotTime(availability.start_time)}
                        onMouseLeave={() => setHoveredSlotTime(null)}
                        style={{cursor: "pointer"}}
                    >
                        <OnDesktop>
                            <Box
                                paddingX="22px"
                                paddingY="10px"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Flex>
                                    <Text color="purple.dark" variant="h2">
                                        {formatted}
                                    </Text>
                                    {isMulti && availability.start_time === hoveredSlotTime && (
                                        <MultiDecorator />
                                    )}
                                </Flex>
                            </Box>
                        </OnDesktop>
                        <OnMobile>
                            <Box paddingY="6px">
                                <Text color="purple.dark" variant="h2" textAlign="center">
                                    {formatted}
                                </Text>
                            </Box>
                        </OnMobile>
                    </Box>
                );
            })}
        </>
    );

    function handleSelect(availability: AvailabilityStatus) {
        const selectedSlotTime: RegularSlotTime = {startTime: availability.start_time};
        setValue("start_time", selectedSlotTime.startTime, {shouldValidate: true});
        onSelectSlotTime(selectedSlotTime);
    }
}

function MultiDecorator() {
    return (
        <Box position="relative">
            <Box position="absolute">
                <Box position="relative">
                    <Badge variant="purpleDark" ml="14px" px={1}>
                        <Icon name="add" fontSize={0} />
                    </Badge>
                </Box>
            </Box>
        </Box>
    );
}
