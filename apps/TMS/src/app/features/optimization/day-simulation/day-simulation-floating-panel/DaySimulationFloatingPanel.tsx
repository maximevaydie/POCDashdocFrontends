import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    DatePicker,
    Flex,
    FloatingPanel,
    IconButton,
    LoadingWheel,
    NumberInput,
    Text,
    TimePicker,
    toast,
    TooltipWrapper,
    Icon,
} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import add from "date-fns/add";
import sub from "date-fns/sub";
import React, {FunctionComponent, useEffect, useState} from "react";

import {TruckerForScheduler} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {useExtendedView} from "app/hooks/useExtendedView";

import {START_HOUR, ACTIVITY_DURATION_IN_MINUTES} from "../../constants";
import {DaySimulationTrip} from "../day-simulation.types";

import {DaySimulationIndicators} from "./day-simulation-indicators/DaySimulationIndicators";
import {DaySimulationTripCard} from "./day-simulation-trip-card/DaySimulationTripCard";
import {DaySimulationBreak} from "./DaySimulationBreak";
import {DaySimulationDayEndCard} from "./DaySimulationDayEndCard";
import {DaySimulationDrivingTimeAndDistance} from "./DaySimulationDrivingTimeAndDistance";
import {DaySimulationMap} from "./DaySimulationMap";

interface DaySimulationFloatingPanelProps {
    trucker: TruckerForScheduler;
    onClose: () => void;
    initialDate: Date;
}

export const DaySimulationFloatingPanel: FunctionComponent<DaySimulationFloatingPanelProps> = ({
    trucker,
    onClose,
    initialDate,
}) => {
    const {extendedView} = useExtendedView();

    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
    const [startTime, setStartTime] = useState<string | null>(`0${START_HOUR}:00`);
    const [activityDuration, setActivityDuration] = useState<number | null>(
        ACTIVITY_DURATION_IN_MINUTES
    );
    const [trips, setTrips] = useState<DaySimulationTrip[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchTrips();
    }, [selectedDate, startTime, activityDuration]);

    const tripsFirstActivityIndices = trips.reduce(
        (acc, trip) => {
            acc.push(acc[acc.length - 1] + trip.activities.length);
            return acc;
        },
        [0]
    );

    const activities = trips.map(({activities}) => activities).flat();

    const lastActivityWithRealStartIndex = activities
        .map((activity) => activity.real_datetime_range !== null)
        .lastIndexOf(true);

    return (
        <FloatingPanel
            onClose={onClose}
            width={0.45}
            backgroundColor="grey.ultralight"
            pb={3}
            data-testid="day-simulation-floating-panel"
        >
            <Box backgroundColor="grey.white">
                <Flex
                    py={3}
                    borderBottom={"1px solid"}
                    borderColor="grey.light"
                    alignItems="center"
                >
                    <IconButton name="arrowLeft" onClick={goToPreviousDay} ml="96px" />
                    <DatePicker
                        date={selectedDate}
                        onChange={(date) => {
                            setSelectedDate(date);
                        }}
                        data-testid="day-simulation-date-picker"
                    />
                    <IconButton name="arrowRight" onClick={goToNextDay} mr="96px" />
                </Flex>
                <Text variant="h1" p={3}>
                    {`${trucker.user.last_name} ${trucker.user.first_name}`}
                </Text>
            </Box>
            {isLoading ? (
                <LoadingWheel />
            ) : (
                <>
                    <Box height="25%">
                        <DaySimulationMap activities={activities} />
                    </Box>
                    <DaySimulationIndicators trips={trips} />
                    <Box backgroundColor="grey.white" mb={3}>
                        <Flex mx={1} alignItems="center">
                            <Box m={3} flex={1}>
                                <TimePicker
                                    onChange={(option: any) => {
                                        setStartTime(option !== null ? option.value : null);
                                    }}
                                    value={{
                                        value: startTime ?? "",
                                        label: startTime ?? "",
                                    }}
                                    isClearable={false}
                                    date={selectedDate}
                                    label={t("optimization.startTime")}
                                />
                            </Box>
                            <Box m={3} flex={1}>
                                <NumberInput
                                    min={0}
                                    onChange={(value) => {
                                        setActivityDuration(value);
                                    }}
                                    value={activityDuration}
                                    units={t("common.minute", {
                                        smart_count: activityDuration ?? 2,
                                    })}
                                    label={`${t("optimization.defaultOnSiteDuration")} *`}
                                />
                            </Box>
                            <TooltipWrapper
                                content={`${t("optimization.defaultOnSiteDurationUtility")}\n\n${t(
                                    "optimization.defineOnSiteDuration"
                                )}`}
                            >
                                <Icon name="info" mr={3} />
                            </TooltipWrapper>
                        </Flex>
                    </Box>

                    {trips.map((trip, index) => (
                        <>
                            <DaySimulationTripCard
                                trip={trip}
                                key={index}
                                tripFirstActivityIndex={tripsFirstActivityIndices[index]}
                                lastActivityWithRealStartIndex={lastActivityWithRealStartIndex}
                                selectedDate={selectedDate as Date}
                            />
                            {index < trips.length - 1 ? (
                                tripsFirstActivityIndices[index + 1] >
                                lastActivityWithRealStartIndex ? (
                                    <>
                                        <Box mx={3}>
                                            <DaySimulationDrivingTimeAndDistance
                                                distance={
                                                    trip.activities[trip.activities.length - 1]
                                                        ?.estimated_distance_to_next_activity
                                                }
                                                drivingTime={
                                                    trip.activities[trip.activities.length - 1]
                                                        ?.estimated_driving_time_to_next_activity
                                                }
                                                color="blue"
                                                isEmptyKm={
                                                    !!trip.activities[trip.activities.length - 1]
                                                        ?.is_distance_to_next_activity_empty_km
                                                }
                                            />
                                            {!!trip.activities[trip.activities.length - 1]
                                                ?.simulated_break_before_next_activity && (
                                                <DaySimulationBreak
                                                    breakTime={
                                                        trip.activities[trip.activities.length - 1]
                                                            ?.simulated_break_before_next_activity as number //cf boolean condition
                                                    }
                                                    color="blue"
                                                />
                                            )}
                                        </Box>
                                    </>
                                ) : (
                                    <Box
                                        mx={3}
                                        width="36px"
                                        height="16px"
                                        borderRight="1px solid"
                                        borderColor="grey.light"
                                    ></Box>
                                )
                            ) : (
                                trip.activities.length && (
                                    <>
                                        <Box
                                            mx={3}
                                            width="36px"
                                            height="16px"
                                            borderRight="1px solid"
                                            borderColor="grey.light"
                                        ></Box>
                                        <DaySimulationDayEndCard
                                            lastActivity={
                                                trip.activities[trip.activities.length - 1]
                                            }
                                            selectedDate={selectedDate as Date}
                                        />
                                    </>
                                )
                            )}
                        </>
                    ))}
                </>
            )}
        </FloatingPanel>
    );

    function goToPreviousDay() {
        if (selectedDate === null) {
            return;
        }
        setSelectedDate(sub(selectedDate, {days: 1}));
    }

    function goToNextDay() {
        if (selectedDate === null) {
            return;
        }
        setSelectedDate(add(selectedDate, {days: 1}));
    }

    async function fetchTrips() {
        let fetchedTrips: DaySimulationTrip[] = [];

        if (selectedDate === null || startTime === null) {
            setTrips(fetchedTrips);
            return;
        }

        setIsLoading(true);
        try {
            fetchedTrips = await apiService.get(
                `/trips/day-simulation/?date=${formatDate(
                    selectedDate,
                    "yyyy-MM-dd"
                )}&start_hour=${startTime.substring(0, 2)}&start_minute=${startTime.substring(
                    3,
                    5
                )}&activity_duration=${activityDuration ?? 0}&trucker_id=${
                    trucker.pk
                }&extended_view=${extendedView}`,
                {
                    apiVersion: "web",
                }
            );
        } catch {
            toast.error(t("common.error"));
        }

        setTrips(fetchedTrips);

        setIsLoading(false);
    }
};
