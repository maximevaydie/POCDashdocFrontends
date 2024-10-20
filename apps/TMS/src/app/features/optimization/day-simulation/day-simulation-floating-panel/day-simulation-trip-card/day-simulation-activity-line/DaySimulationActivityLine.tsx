import {useTimezone} from "@dashdoc/web-common";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import isNil from "lodash.isnil";
import React, {FunctionComponent} from "react";

import {getAddressAndNameLabel} from "app/features/trip/pool-of-unplanned-trips/columns";

import {daySimulationService} from "../../../day-simulation.service";
import {DaySimulationActivity} from "../../../day-simulation.types";
import {DaySimulationStartDate} from "../../DaySimulationStartDate";

import {DaySimulationActivityPlannedDate} from "./DaySimulationActivityPlannedDate";

interface DaySimulationActivityLineProps {
    activity: DaySimulationActivity;
    activityIndex: number;
    selectedDate: Date;
}

export const DaySimulationActivityLine: FunctionComponent<DaySimulationActivityLineProps> = ({
    activity,
    activityIndex,
    selectedDate,
}) => {
    const timezone = useTimezone();

    return (
        <Flex>
            <DaySimulationStartDate
                startDate={daySimulationService.getActivityStart(activity, timezone)}
                selectedDate={selectedDate}
                isReal={activity.real_datetime_range !== null}
                text={activityIndex + 1}
            />

            <Flex p={2} flexDirection="column" justifyContent="center" flex={8}>
                <>
                    {activity.address !== null ? getAddressAndNameLabel(activity.address) : "?"}
                    <DaySimulationActivityPlannedDate
                        activity={activity}
                        selectedDate={selectedDate}
                    />
                </>
            </Flex>
            <Flex
                borderLeft="1px solid"
                borderColor="grey.light"
                p={2}
                flex={1}
                maxWidth="72px"
                minWidth="72px"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
            >
                <Icon color="grey.dark" name="warehouse" size={14} />
                <Text color="grey.dark" variant="caption" mt={1}>
                    {formatNumber(daySimulationService.getActivityDuration(activity, timezone), {
                        style: "unit",
                        unit: "minute",
                    })}
                    {activity.real_datetime_range === null &&
                        isNil(activity.address?.theoretical_activity_duration_in_min) &&
                        " *"}
                </Text>
            </Flex>
        </Flex>
    );
};
