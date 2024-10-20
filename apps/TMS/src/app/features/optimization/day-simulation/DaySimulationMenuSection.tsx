import {
    getConnectedManager,
    getConnectedCompany,
    analyticsService,
    AnalyticsEvent,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {ContextMenuItem} from "@dashdoc/web-ui";
import React, {FunctionComponent, useContext} from "react";
import {useSelector} from "react-redux";

import {TruckerForScheduler} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

import {DaySimulationTruckerContext} from "./DaySimulationTruckerContext";

type DaySimulationMenuSectionProps = {
    trucker: TruckerForScheduler;
    initialDate: Date;
};

export const DaySimulationMenuSection: FunctionComponent<DaySimulationMenuSectionProps> = ({
    trucker,
    initialDate,
}) => {
    const {setDaySimulationParameters} = useContext(DaySimulationTruckerContext);

    const manager = useSelector(getConnectedManager);
    const company = useSelector(getConnectedCompany);

    return (
        <ContextMenuItem
            data-testid="day-simulation"
            onClick={() => {
                sendEvent();
                setDaySimulationParameters({trucker, initialDate});
            }}
            icon="truck"
            label={t("optimization.seeDaySimulation")}
        />
    );

    function sendEvent() {
        analyticsService.sendEvent(AnalyticsEvent.actionAfterRightClick, {
            "company id": company?.pk,
            "is staff": manager?.user.is_staff,
            action: `day_simulation_details`,
        });
    }
};
