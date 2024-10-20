import React from "react";

import {
    getLoadCategoryAndDescription,
    getLoadInformations,
} from "app/features/transport/transport-details/transport-details-activities/activity/activity-loads/utils";
import {LoadRecap} from "app/features/transportation-plan/rfq/quotation/transport-recap/LoadRecap";
import {getLoadQuantities} from "app/services/transport/load.service";

import {TransportAssignationHistoryDelivery} from "../types";

import type {Load} from "app/types/transport";

export function PlannedLoadsRecap({delivery}: {delivery: TransportAssignationHistoryDelivery}) {
    const {planned_loads} = delivery;
    return (
        <>
            {planned_loads.map((planned_load, index) => {
                const castedPlannedLoad = planned_load as Load;

                return (
                    <LoadRecap
                        key={index}
                        title={getLoadCategoryAndDescription(castedPlannedLoad)}
                        info={getLoadInformations(castedPlannedLoad)}
                        load={getLoadQuantities(castedPlannedLoad)}
                    />
                );
            })}
        </>
    );
}
