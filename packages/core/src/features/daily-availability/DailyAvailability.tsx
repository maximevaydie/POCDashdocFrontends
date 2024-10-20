import {
    BackgroundOverlay,
    Box,
    Flex,
    LoadingWheel,
    OnDesktop,
    OnMobile,
    Text,
} from "@dashdoc/web-ui";
import {RegularSlotTime} from "features/slot/actions/slot-booking/step/types";
import {TodayDecorator} from "features/today-decorator/TodayDecorator";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import {addDays, tz} from "services/date";
import {AvailabilityStatus, LoadingState, TzDate} from "types";

import {BookingSlotItems} from "./components/BookingSlotItems";
import {NoAvailabilities} from "./components/NoAvailabilities";

type Props = {
    availabilities: AvailabilityStatus[];
    onSelectSlotTime: (selectedStartTime: RegularSlotTime) => Promise<void>;
    selectedSlotTime: RegularSlotTime | null;
    loading: LoadingState;
    currentDate: TzDate;
    dateRange: number;
    isMulti: boolean;
};

export function DailyAvailability({
    availabilities,
    loading,
    onSelectSlotTime,
    selectedSlotTime,
    currentDate,
    dateRange,
    isMulti,
}: Props) {
    const timezone = useSiteTimezone();
    const groupedAvailabilities: {[key: string]: AvailabilityStatus[]} = {};
    const days = generateDaysArray(currentDate, dateRange);

    days.forEach((day) => {
        groupedAvailabilities[day] = [];
    });

    availabilities.forEach((availability) => {
        const startDate = tz.convert(availability.start_time, timezone);
        const formattedDate = tz.format(startDate, "EEEE dd MMMM");

        if (groupedAvailabilities[formattedDate]) {
            groupedAvailabilities[formattedDate].push(availability);
        }
    });

    const length = Object.keys(groupedAvailabilities).length;
    const isLoading =
        (!isMulti && (loading === "reloading" || loading === "pending")) ||
        (isMulti && loading === "pending");
    const isDisabled = isMulti && loading === "reloading";
    return (
        <>
            {isDisabled && (
                <BackgroundOverlay
                    data-testid="floating-panel-background-overlay"
                    backgroundColor="neutral.lighterTransparentBlack"
                    position="absolute"
                >
                    <LoadingWheel noMargin />
                </BackgroundOverlay>
            )}
            <OnDesktop>
                <Box
                    style={{
                        display: "grid",
                        gridTemplateRows: `min-content 1fr`,
                    }}
                    height="100%"
                >
                    <Box
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${length}, 130px)`,
                        }}
                    >
                        {Object.entries(groupedAvailabilities).map(([day, availabilities]) => (
                            <Box marginX={1} key={day} textAlign="center">
                                <Text paddingX={3} variant="h2">
                                    {convertDate(day)}
                                </Text>
                                <TodayDecorator
                                    startTime={
                                        availabilities.length > 0
                                            ? availabilities[0].start_time ?? ""
                                            : ""
                                    }
                                />
                            </Box>
                        ))}
                    </Box>
                    {isLoading ? (
                        <Box height="100%" width="100%" mt={6}>
                            <LoadingWheel noMargin />
                        </Box>
                    ) : (
                        <Box
                            style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${length}, 130px)`,
                            }}
                            overflowY="auto"
                        >
                            {Object.entries(groupedAvailabilities).map(([day, availabilities]) => (
                                <Flex key={day} marginX={1} justifyContent="center">
                                    <Box paddingX={3} paddingBottom={2}>
                                        {availabilities.length > 0 ? (
                                            <Box paddingBottom={6}>
                                                <BookingSlotItems
                                                    availabilities={availabilities}
                                                    onSelectSlotTime={onSelectSlotTime}
                                                    selectedSlotTime={selectedSlotTime}
                                                    isMulti={isMulti}
                                                />
                                            </Box>
                                        ) : (
                                            <NoAvailabilities />
                                        )}
                                    </Box>
                                </Flex>
                            ))}
                        </Box>
                    )}
                </Box>
            </OnDesktop>
            <OnMobile>
                <Box width="100%">
                    {Object.entries(groupedAvailabilities).map(([day, availabilities]) => (
                        <Box key={day} my={4}>
                            <Flex mr={1} my={2}>
                                <Text paddingX={3} variant="h2">
                                    {convertDate(day)}
                                </Text>
                                <TodayDecorator
                                    startTime={
                                        availabilities.length > 0
                                            ? availabilities[0].start_time ?? ""
                                            : ""
                                    }
                                />
                            </Flex>
                            {isLoading ? (
                                <Box height="100%" width="100%" mt={6}>
                                    <LoadingWheel noMargin />
                                </Box>
                            ) : (
                                <>
                                    {availabilities.length > 0 ? (
                                        <Box
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: `repeat(4, 1fr)`,
                                                rowGap: "10px",
                                                columnGap: "16px",
                                            }}
                                            overflowY="auto"
                                        >
                                            <BookingSlotItems
                                                isMulti={isMulti}
                                                availabilities={availabilities}
                                                onSelectSlotTime={onSelectSlotTime}
                                                selectedSlotTime={selectedSlotTime}
                                            />
                                        </Box>
                                    ) : (
                                        <NoAvailabilities />
                                    )}
                                </>
                            )}
                        </Box>
                    ))}
                </Box>
            </OnMobile>
        </>
    );
}

function convertDate(date: string): string {
    const pattern = /(\w+)\s(\d+)\s(\w+)/g;
    const replacement: (match: string, dayOfWeek: string, day: string, month: string) => string = (
        _,
        dayOfWeek,
        day,
        month
    ) => {
        const abbreviatedDay: string = dayOfWeek.slice(0, 3);
        return `${abbreviatedDay}. ${day} ${month}`;
    };

    return date.replace(pattern, replacement);
}

function generateDaysArray(currentDate: TzDate, dateRange: number) {
    const days = Array.from({length: dateRange}, (_, i) => {
        const newDay = addDays(currentDate, i);
        return tz.format(newDay, "EEEE dd MMMM");
    });
    return days;
}
