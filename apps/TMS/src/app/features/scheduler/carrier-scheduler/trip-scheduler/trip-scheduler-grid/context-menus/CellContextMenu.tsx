import {useFeatureFlag} from "@dashdoc/web-common";
import {ContextMenu, MenuSeparator} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {DaySimulationMenuSection} from "app/features/optimization/day-simulation/DaySimulationMenuSection";
import {
    TripResource,
    TripSchedulerView,
    TruckerForScheduler,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

import {useUnavailabilityModal} from "./hooks/useUnavailabilityModal";
import {ResourceReadOnly} from "./menu-sections/ResourceReadOnly";
import {ResourceSectionLabel} from "./menu-sections/ResourceSectionLabel";
import {UnavailabilityMenuSection} from "./menu-sections/UnavailabilityMenuSection";

type CellContextMenuProps = {
    resource: TripResource | undefined;
    day: Date | undefined;
    view: TripSchedulerView;
    onUnavailabilityUpdated: () => void;
};

export const CELL_CONTEXT_MENU_ID = "CELL_CONTEXT_MENU_ID";
export const CellContextMenu: FunctionComponent<CellContextMenuProps> = ({
    resource,
    day,
    view,
    onUnavailabilityUpdated,
}) => {
    const {addUnavailability, AddUnavailabilityModal, addUnavailabilityModalProps} =
        useUnavailabilityModal({resource, day, view, onUnavailabilityUpdated});

    const daySimulationEnabled = useFeatureFlag("daySimulation");

    return (
        <>
            <ContextMenu id={CELL_CONTEXT_MENU_ID}>
                <ResourceSectionLabel resource={resource} view={view} />
                {resource?.owned_by_company ? (
                    <UnavailabilityMenuSection view={view} addUnavailability={addUnavailability} />
                ) : (
                    <ResourceReadOnly />
                )}
                {daySimulationEnabled && resource !== undefined && view === "trucker" && (
                    <>
                        <MenuSeparator />
                        <DaySimulationMenuSection
                            trucker={resource as TruckerForScheduler}
                            initialDate={day ?? new Date()}
                        />
                    </>
                )}
            </ContextMenu>
            {addUnavailabilityModalProps && (
                <AddUnavailabilityModal {...addUnavailabilityModalProps} />
            )}
        </>
    );
};
