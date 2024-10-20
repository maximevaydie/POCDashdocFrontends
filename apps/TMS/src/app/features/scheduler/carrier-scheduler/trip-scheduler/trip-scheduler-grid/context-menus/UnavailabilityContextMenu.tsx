import {ContextMenu} from "@dashdoc/web-ui";
import {Unavailability} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {
    TripResource,
    TripSchedulerView,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

import {useUnavailabilityModal} from "./hooks/useUnavailabilityModal";
import {ResourceReadOnly} from "./menu-sections/ResourceReadOnly";
import {ResourceSectionLabel} from "./menu-sections/ResourceSectionLabel";
import {UnavailabilityMenuSection} from "./menu-sections/UnavailabilityMenuSection";

type UnavailabilityContextMenuProps = {
    resource: TripResource | undefined;
    view: TripSchedulerView;
    selectedUnavailability?: Unavailability;
    onUnavailabilityUpdated: () => void;
};

export const UNAVAILABILITY_CONTEXT_MENU_ID = "UNAVAILABILITY_CONTEXT_MENU_ID";
export const UnavailabilityContextMenu: FunctionComponent<UnavailabilityContextMenuProps> = ({
    resource,
    view,
    selectedUnavailability,
    onUnavailabilityUpdated,
}) => {
    const {
        addUnavailability,
        AddUnavailabilityModal,
        addUnavailabilityModalProps,
        editUnavailability,
        EditUnavailabilityModal,
        editUnavailabilityModalProps,
        deleteUnavailability,
        DeleteUnavailabilityModal,
        deleteUnavailabilityModalProps,
    } = useUnavailabilityModal({resource, view, onUnavailabilityUpdated});

    return (
        <>
            <ContextMenu id={UNAVAILABILITY_CONTEXT_MENU_ID}>
                <ResourceSectionLabel resource={resource} view={view} />
                {resource?.owned_by_company ? (
                    <UnavailabilityMenuSection
                        view={view}
                        selectedUnavailability={selectedUnavailability}
                        addUnavailability={addUnavailability}
                        editUnavailability={editUnavailability}
                        deleteUnavailability={deleteUnavailability}
                    />
                ) : (
                    <ResourceReadOnly />
                )}
            </ContextMenu>
            {addUnavailabilityModalProps && (
                <AddUnavailabilityModal {...addUnavailabilityModalProps} />
            )}
            {editUnavailabilityModalProps && (
                <EditUnavailabilityModal {...editUnavailabilityModalProps} />
            )}
            {deleteUnavailabilityModalProps && (
                <DeleteUnavailabilityModal {...deleteUnavailabilityModalProps} />
            )}
        </>
    );
};
