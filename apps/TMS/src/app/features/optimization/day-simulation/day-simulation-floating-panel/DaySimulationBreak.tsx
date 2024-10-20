import {Icon} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {DaySimulationLabel} from "./day-simulation-base-components/DaySimulationLabel";

interface Props {
    color: string;
    breakTime: number;
}

export const DaySimulationBreak: FunctionComponent<Props> = ({color, breakTime}) => {
    return (
        <DaySimulationLabel color={color}>
            <Icon name="break" mr={2} />
            {formatNumber(breakTime, {
                style: "unit",
                unit: "minute",
            })}
        </DaySimulationLabel>
    );
};
