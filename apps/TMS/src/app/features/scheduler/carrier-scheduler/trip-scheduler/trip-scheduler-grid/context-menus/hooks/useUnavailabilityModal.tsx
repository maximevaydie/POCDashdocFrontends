import {t} from "@dashdoc/web-core";
import {ConfirmationModal, ButtonProps} from "@dashdoc/web-ui";
import {Unavailability, useToggle} from "dashdoc-utils";
import {useState} from "react";

import {getFleetUnavailabilityFunctionsByType} from "app/features/fleet/unavailabilities/unavailability.service";
import UnavailabilityModal from "app/features/fleet/unavailabilities/UnavailabilityModal";
import {
    TripResource,
    TripSchedulerView,
    TruckerForScheduler,
    VehicleOrTrailerForScheduler,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {useDispatch} from "app/redux/hooks";

type UseUnavailabilityModalParams = {
    resource: TripResource | undefined;
    day?: Date;
    view: TripSchedulerView;
    onUnavailabilityUpdated: () => void;
};

export const useUnavailabilityModal = ({
    resource,
    day,
    view,
    onUnavailabilityUpdated,
}: UseUnavailabilityModalParams) => {
    const dispatch = useDispatch();
    const [isAddingUnavailability, openUnavailabilityAddition, closeUnavailabilityAddition] =
        useToggle();
    const [editingUnavailability, editUnavailability] = useState<Unavailability | undefined>();
    const [deletingUnavailability, deleteUnavailability] = useState<Unavailability | undefined>();

    const unavailabilityUpdated = (unavailability?: Unavailability[]) => {
        if (resource) {
            resource.unavailability = unavailability;
            onUnavailabilityUpdated();
        }
    };

    const handleDeleteUnavailability = async () => {
        if (!deletingUnavailability?.id || !resource) {
            return;
        }
        const {deleteUnavailability, retrieveFleetItem} =
            getFleetUnavailabilityFunctionsByType(view);
        await dispatch(deleteUnavailability(resource.pk, deletingUnavailability.id));
        const result = await dispatch(retrieveFleetItem(resource.pk));
        let fleetResult;
        switch (view) {
            case "trucker":
                fleetResult = result.response.entities[view + "s"][resource.pk];
                break;
            case "vehicle":
                fleetResult = result.vehicle;
                break;
            case "trailer":
                fleetResult = result.trailer;
                break;
        }
        resource.unavailability = fleetResult.unavailability;
        onUnavailabilityUpdated();
    };

    const resourceLabel =
        view === "trucker"
            ? (resource as TruckerForScheduler)?.user?.last_name +
              " " +
              (resource as TruckerForScheduler)?.user?.first_name
            : (resource as VehicleOrTrailerForScheduler)?.license_plate;

    return {
        addUnavailability: openUnavailabilityAddition,
        AddUnavailabilityModal: UnavailabilityModal,
        addUnavailabilityModalProps:
            isAddingUnavailability && resource
                ? {
                      fleetItemPk: resource.pk,
                      fleetItemName: resourceLabel,
                      type: view,
                      onClose: closeUnavailabilityAddition,
                      onSave: unavailabilityUpdated,
                      defaultDate: day,
                  }
                : null,
        editUnavailability,
        EditUnavailabilityModal: UnavailabilityModal,
        editUnavailabilityModalProps:
            editingUnavailability && resource
                ? {
                      unavailability: editingUnavailability,
                      fleetItemPk: resource.pk,
                      fleetItemName: resourceLabel,
                      type: view,
                      onClose: () => editUnavailability(undefined),
                      onSave: unavailabilityUpdated,
                  }
                : null,
        deleteUnavailability,
        DeleteUnavailabilityModal: ConfirmationModal,
        deleteUnavailabilityModalProps:
            deletingUnavailability && resource
                ? {
                      title:
                          view === "trucker"
                              ? t("unavailability.deleteAbsence")
                              : t("unavailability.deleteUnavailability"),
                      onClose: () => deleteUnavailability(undefined),
                      mainButton: {
                          onClick: () => {
                              handleDeleteUnavailability();
                              deleteUnavailability(undefined);
                          },
                          severity: "danger",
                      } as ButtonProps,
                      secondaryButton: {},
                      confirmationMessage:
                          view === "trucker"
                              ? t("unavailability.confirmDeleteAbsence")
                              : t("unavailability.confirmDeleteUnavailability"),
                  }
                : null,
    };
};
