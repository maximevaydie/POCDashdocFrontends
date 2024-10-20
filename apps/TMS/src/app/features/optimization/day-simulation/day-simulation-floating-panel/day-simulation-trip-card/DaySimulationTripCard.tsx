import {Box} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {DaySimulationTrip} from "../../day-simulation.types";
import {DaySimulationCard} from "../day-simulation-base-components/DaySimulationCard";
import {DaySimulationBreak} from "../DaySimulationBreak";
import {DaySimulationDrivingTimeAndDistance} from "../DaySimulationDrivingTimeAndDistance";

import {DaySimulationActivityLine} from "./day-simulation-activity-line/DaySimulationActivityLine";

interface DaySimulationTripCardProps {
    trip: DaySimulationTrip;
    tripFirstActivityIndex: number;
    selectedDate: Date;
    lastActivityWithRealStartIndex: number;
}

export const DaySimulationTripCard: FunctionComponent<DaySimulationTripCardProps> = ({
    trip,
    tripFirstActivityIndex,
    selectedDate,
    lastActivityWithRealStartIndex,
}) => {
    return (
        <DaySimulationCard>
            {trip.activities.map((activity, index) => (
                <>
                    <DaySimulationActivityLine
                        activity={activity}
                        key={index}
                        activityIndex={tripFirstActivityIndex + index}
                        selectedDate={selectedDate}
                    />
                    {index < trip.activities.length - 1 &&
                        (tripFirstActivityIndex + index >= lastActivityWithRealStartIndex ? (
                            <Box borderY="1px dotted" borderColor="grey.light">
                                <DaySimulationDrivingTimeAndDistance
                                    drivingTime={activity.estimated_driving_time_to_next_activity}
                                    distance={activity.estimated_distance_to_next_activity}
                                    color="grey"
                                    isEmptyKm={!!activity.is_distance_to_next_activity_empty_km}
                                />
                                {!!activity.simulated_break_before_next_activity && (
                                    <DaySimulationBreak
                                        breakTime={activity.simulated_break_before_next_activity}
                                        color="grey"
                                    />
                                )}
                            </Box>
                        ) : (
                            <Box borderTop="1px dotted" borderColor="grey.light" />
                        ))}
                </>
            ))}
        </DaySimulationCard>
    );
};
