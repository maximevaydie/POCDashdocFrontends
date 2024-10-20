import {t} from "@dashdoc/web-core";
import {Icon} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {formatEstimatedDrivingTime} from "app/features/trip/trip.service";

import {DaySimulationLabel} from "./day-simulation-base-components/DaySimulationLabel";

interface Props {
    color: string;
    drivingTime: number | null | undefined;
    distance: number | null | undefined;
    isEmptyKm?: boolean;
}

export const DaySimulationDrivingTimeAndDistance: FunctionComponent<Props> = ({
    color,
    drivingTime,
    distance,

    isEmptyKm,
}) => {
    return (
        <DaySimulationLabel color={color}>
            <Icon name="clock" mr={2} />
            {drivingTime != null
                ? formatEstimatedDrivingTime(drivingTime)
                : `? ${t("pricingMetrics.unit.duration.short")}`}
            &nbsp; &nbsp;
            {"-"}
            &nbsp; &nbsp;
            <Icon name="truck" mr={2} />
            {`${distance != null ? distance : "?"} ${t(
                isEmptyKm ? "optimization.emptyKmUnit" : "pricingMetrics.unit.distance.short"
            )}`}
        </DaySimulationLabel>
    );
};
