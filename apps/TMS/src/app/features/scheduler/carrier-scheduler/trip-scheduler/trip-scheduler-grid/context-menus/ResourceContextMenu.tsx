import {useFeatureFlag} from "@dashdoc/web-common";
import {ContextMenu, MenuSeparator} from "@dashdoc/web-ui";
import {useToggle, type MeansCombination} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {getInitialMeansCombinations} from "app/features/fleet/means-combination/means-combination.service";
import MeansCombinationDeletionModal from "app/features/fleet/means-combination/MeansCombinationDeletionModal";
import MeansCombinationEditionModal from "app/features/fleet/means-combination/MeansCombinationEditionModal";
import {DaySimulationMenuSection} from "app/features/optimization/day-simulation/DaySimulationMenuSection";
import {
    TripResource,
    TripSchedulerView,
    TruckerForScheduler,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

import {useUnavailabilityModal} from "./hooks/useUnavailabilityModal";
import {LinkedMeansSection} from "./menu-sections/LinkedMeansSection";
import {ResourceLinkMenuItem} from "./menu-sections/ResourceLinkMenuItem";
import {ResourceReadOnly} from "./menu-sections/ResourceReadOnly";
import {ResourceSectionLabel} from "./menu-sections/ResourceSectionLabel";
import {UnavailabilityMenuSection} from "./menu-sections/UnavailabilityMenuSection";

import type {InitialMeans} from "app/features/fleet/means-combination/means-combination.types";
import type {InitialMeansCombination} from "app/features/fleet/types";

type ResourceContextMenuProps = {
    resource: TripResource | undefined;
    view: TripSchedulerView;
    onUnavailabilityUpdated: () => void;
    onUpdateResource: () => void;
};

export const RESOURCE_CONTEXT_MENU_ID = "RESOURCE_CONTEXT_MENU_ID";
export const ResourceContextMenu: FunctionComponent<ResourceContextMenuProps> = ({
    resource,
    view,
    onUnavailabilityUpdated,
    onUpdateResource,
}) => {
    const {addUnavailability, AddUnavailabilityModal, addUnavailabilityModalProps} =
        useUnavailabilityModal({resource, view, onUnavailabilityUpdated});

    const daySimulationEnabled = useFeatureFlag("daySimulation");

    const [
        isMeansCombinationEditionModalOpen,
        openMeansCombinationEditionModal,
        closeMeansCombinationEditionModal,
    ] = useToggle();
    const [
        isMeansCombinationDeletionModalOpen,
        openMeansCombinationDeletionModal,
        closeMeansCombinationDeletionModal,
    ] = useToggle();

    let initialMeansCombination: InitialMeansCombination | MeansCombination | undefined =
        resource?.means_combination ?? undefined;
    if (initialMeansCombination === undefined && resource) {
        //TODO: typescript does not check anything here
        const initialMeans = {
            means: resource,
            type: view,
        } as InitialMeans;
        initialMeansCombination = getInitialMeansCombinations(initialMeans);
    }

    return (
        <>
            <ContextMenu id={RESOURCE_CONTEXT_MENU_ID}>
                <ResourceSectionLabel resource={resource} view={view} />

                {resource?.pk && resource.owned_by_company ? (
                    <>
                        <ResourceLinkMenuItem resourceId={resource.pk} view={view} />
                        <MenuSeparator />

                        <UnavailabilityMenuSection
                            view={view}
                            addUnavailability={addUnavailability}
                        />
                        <MenuSeparator />
                        <LinkedMeansSection
                            resource={resource}
                            onDelete={openMeansCombinationDeletionModal}
                            onEdit={openMeansCombinationEditionModal}
                        />
                    </>
                ) : (
                    <ResourceReadOnly />
                )}
                {daySimulationEnabled && resource !== undefined && view === "trucker" && (
                    <>
                        <MenuSeparator />
                        <DaySimulationMenuSection
                            trucker={resource as TruckerForScheduler}
                            initialDate={new Date()}
                        />
                    </>
                )}
            </ContextMenu>
            {addUnavailabilityModalProps && (
                <AddUnavailabilityModal {...addUnavailabilityModalProps} />
            )}
            {isMeansCombinationEditionModalOpen && initialMeansCombination && (
                <MeansCombinationEditionModal
                    initialMeansCombination={initialMeansCombination}
                    initialMeansType={view}
                    onUpdate={onUpdateResource}
                    onClose={closeMeansCombinationEditionModal}
                />
            )}

            {isMeansCombinationDeletionModalOpen && (
                <MeansCombinationDeletionModal
                    meansCombination={resource!.means_combination!}
                    onClose={closeMeansCombinationDeletionModal}
                    onDelete={onUpdateResource}
                />
            )}
        </>
    );
};
