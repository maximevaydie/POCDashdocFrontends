import {getCompanyAndAddressName, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {daySimulationService} from "../day-simulation.service";
import {DaySimulationActivity} from "../day-simulation.types";

import {DaySimulationCard} from "./day-simulation-base-components/DaySimulationCard";
import {DaySimulationStartDate} from "./DaySimulationStartDate";

interface DaySimulationDayEndCardProps {
    lastActivity: DaySimulationActivity;
    selectedDate: Date;
}

export const DaySimulationDayEndCard: FunctionComponent<DaySimulationDayEndCardProps> = ({
    lastActivity,
    selectedDate,
}) => {
    const timezone = useTimezone();

    return (
        <DaySimulationCard>
            <Flex data-testid="day-end-card">
                <DaySimulationStartDate
                    startDate={daySimulationService.getActivityEnd(lastActivity, timezone)}
                    selectedDate={selectedDate}
                    iconName="flag"
                    isReal={lastActivity.real_datetime_range !== null}
                />

                <Flex p={2} flexDirection="column" justifyContent="center" flex={9}>
                    <>
                        {lastActivity.address !== null
                            ? t("optimization.endOfDay", {
                                  address: getCompanyAndAddressName(lastActivity.address),
                              })
                            : "?"}
                    </>
                </Flex>
            </Flex>
        </DaySimulationCard>
    );
};
