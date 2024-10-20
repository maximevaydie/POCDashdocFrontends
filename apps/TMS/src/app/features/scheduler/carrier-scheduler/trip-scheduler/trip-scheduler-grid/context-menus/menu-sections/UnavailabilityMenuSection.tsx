import {
    AnalyticsEvent,
    analyticsService,
    getConnectedCompany,
    getConnectedManager,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {ContextMenuItem, MenuSeparator} from "@dashdoc/web-ui";
import {Unavailability} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {useDispatch, useSelector} from "app/redux/hooks";
import {loadRequestAbsenceManagerConnector} from "app/redux/reducers/connectors";
import {getAbsencePlannerConnector} from "app/redux/selectors/connector";

type UnavailabilityMenuSectionProps = {
    view: TripSchedulerView;
    selectedUnavailability?: Unavailability;
    addUnavailability: () => void;
    editUnavailability?: (selectedUnavailability: Unavailability) => void;
    deleteUnavailability?: (selectedUnavailability: Unavailability) => void;
};

export const UnavailabilityMenuSection: FunctionComponent<UnavailabilityMenuSectionProps> = ({
    view,
    selectedUnavailability,
    addUnavailability,
    editUnavailability,
    deleteUnavailability,
}) => {
    const dispatch = useDispatch();
    dispatch(loadRequestAbsenceManagerConnector());
    const hasAbsencePlannerConnector = useSelector(getAbsencePlannerConnector);
    const manager = useSelector(getConnectedManager);
    const company = useSelector(getConnectedCompany);
    return (
        <>
            <ContextMenuItem
                onClick={() => {
                    sendEvent("add");
                    addUnavailability();
                }}
                data-testid={"add-unavailability"}
                icon="calendar"
                label={
                    view === "trucker"
                        ? t("unavailability.addAbsence")
                        : t("unavailability.addUnavailability")
                }
                disabled={hasAbsencePlannerConnector}
            />
            {selectedUnavailability && (
                <>
                    {(editUnavailability || deleteUnavailability) && <MenuSeparator />}
                    {editUnavailability && (
                        <ContextMenuItem
                            onClick={() => {
                                sendEvent("edit");
                                editUnavailability(selectedUnavailability);
                            }}
                            data-testid={"edit-unavailability"}
                            icon="edit"
                            label={
                                view === "trucker"
                                    ? t("unavailability.editAbsence")
                                    : t("unavailability.editUnavailability")
                            }
                            disabled={hasAbsencePlannerConnector}
                        />
                    )}
                    {deleteUnavailability && (
                        <ContextMenuItem
                            severity="danger"
                            onClick={() => {
                                sendEvent("delete");
                                deleteUnavailability(selectedUnavailability);
                            }}
                            data-testid={"delete-unavailability"}
                            icon="delete"
                            label={
                                view === "trucker"
                                    ? t("unavailability.deleteAbsence")
                                    : t("unavailability.deleteUnavailability")
                            }
                            disabled={hasAbsencePlannerConnector}
                        />
                    )}
                </>
            )}
        </>
    );
    function sendEvent(action: "add" | "edit" | "delete") {
        analyticsService.sendEvent(AnalyticsEvent.actionAfterRightClick, {
            "company id": company?.pk,
            "is staff": manager?.user.is_staff,
            action: `${action}_unavailabilities`,
        });
    }
};
