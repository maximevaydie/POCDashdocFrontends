import {Logger, t} from "@dashdoc/web-core";
import {Badge, Box, Flex, IconButton, Text} from "@dashdoc/web-ui";
import {RegularSlotTime} from "features/slot/actions/slot-booking/step/types";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import cloneDeep from "rfdc/default";
import {tz} from "services/date";

type Props = {
    slots: RegularSlotTime[];
    readonly: boolean;
    onChange: (slots: RegularSlotTime[]) => void;
};
export function Cart({slots, readonly, onChange}: Props) {
    const timezone = useSiteTimezone();
    if (slots.length === 0) {
        return (
            <Box>
                <Badge shape="squared" variant="neutral">
                    <Text> {t("flow.bookings.added", {smart_count: 0})}</Text>
                </Badge>
                <Flex justifyContent="center" mt={4}>
                    <CalendarAddSvg />
                </Flex>
            </Box>
        );
    }
    const groupedByDay: {[key: string]: RegularSlotTime[]} = {};
    slots
        .sort((left, right) => {
            const leftDate = tz.convert(left.startTime, timezone);
            const rightDate = tz.convert(right.startTime, timezone);
            return leftDate.getTime() - rightDate.getTime();
        })
        .forEach((item) => {
            const startDate = tz.convert(item.startTime, timezone);
            const formattedDate = tz.format(startDate, "E. dd MMMM");
            if (!groupedByDay[formattedDate]) {
                groupedByDay[formattedDate] = [];
            }
            if (groupedByDay[formattedDate]) {
                groupedByDay[formattedDate].push(item);
            }
        });
    return (
        <Flex flexDirection="column" justifyContent="center">
            <Badge shape="squared" variant="purple">
                <Box>
                    <Badge
                        variant="none"
                        backgroundColor="grey.white"
                        mr={2}
                        color="purple.dark"
                        fontWeight={600}
                    >
                        {slots.length}
                    </Badge>
                </Box>
                <Text justifyContent="center">
                    {t("common.bookings.added", {smart_count: slots.length})}
                </Text>
            </Badge>
            {Object.entries(groupedByDay).map(([day, slots]) => (
                <Flex flexDirection="column" key={day} justifyContent="center">
                    <Text paddingX={3} variant="h2" mt={4} mb={3}>
                        {day}
                    </Text>
                    {slots.map((slot, i) => (
                        <Box paddingX={3} paddingBottom={2} key={`${i}-${slot.startTime}`}>
                            <Flex>
                                <Box
                                    paddingX="22px"
                                    paddingY="10px"
                                    justifyContent="center"
                                    alignItems="center"
                                    backgroundColor="grey.light"
                                    borderRadius="4px"
                                >
                                    <Text variant="h2">
                                        {tz.format({date: slot.startTime, timezone}, "HH:mm")}
                                    </Text>
                                </Box>
                                {!readonly && (
                                    <Box margin="auto">
                                        <Flex>
                                            <IconButton
                                                name="close"
                                                onClick={() => handleDelete(slot)}
                                                fontSize={1}
                                                type="button"
                                                mr={2}
                                                color="grey.dark"
                                            />
                                        </Flex>
                                    </Box>
                                )}
                            </Flex>
                        </Box>
                    ))}
                </Flex>
            ))}
        </Flex>
    );

    function handleDelete(slot: RegularSlotTime) {
        const index = slots.indexOf(slot);
        if (index >= 0) {
            const newSlots = cloneDeep(slots);
            newSlots.splice(index, 1);
            onChange(newSlots);
        } else {
            Logger.error("Slot not found in slots", {slot});
        }
    }
}

function CalendarAddSvg() {
    return (
        <svg
            width="70"
            height="70"
            viewBox="0 0 70 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M24.7461 49.3555H8.33984C7.25204 49.3555 6.20879 48.9233 5.4396 48.1541C4.67041 47.385 4.23828 46.3417 4.23828 45.2539V12.4414C4.23828 11.3536 4.67041 10.3104 5.4396 9.54116C6.20879 8.77197 7.25204 8.33984 8.33984 8.33984H45.2539C46.3417 8.33984 47.385 8.77197 48.1541 9.54116C48.9233 10.3104 49.3555 11.3536 49.3555 12.4414V24.7461"
                stroke="#DFE7ED"
                strokeWidth="4.375"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M4.23828 20.6445H49.3555"
                stroke="#DFE7ED"
                strokeWidth="4.375"
                strokeLinejoin="round"
            />
            <path
                d="M16.543 12.4414V4.23828"
                stroke="#DFE7ED"
                strokeWidth="4.375"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M37.0508 12.4414V4.23828"
                stroke="#DFE7ED"
                strokeWidth="4.375"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M32.9492 49.3555C32.9492 53.7067 34.6777 57.8797 37.7545 60.9564C40.8313 64.0332 45.0043 65.7617 49.3555 65.7617C53.7067 65.7617 57.8797 64.0332 60.9564 60.9564C64.0332 57.8797 65.7617 53.7067 65.7617 49.3555C65.7617 45.0043 64.0332 40.8313 60.9564 37.7545C57.8797 34.6777 53.7067 32.9492 49.3555 32.9492C45.0043 32.9492 40.8313 34.6777 37.7545 37.7545C34.6777 40.8313 32.9492 45.0043 32.9492 49.3555Z"
                stroke="#DFE7ED"
                strokeWidth="4.375"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M49.3555 41.1523V57.5586"
                stroke="#DFE7ED"
                strokeWidth="4.375"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M41.1523 49.3555H57.5586"
                stroke="#DFE7ED"
                strokeWidth="4.375"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
