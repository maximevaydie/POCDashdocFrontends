import {addressDisplayService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Checkbox, ConfirmationModal, Text} from "@dashdoc/web-ui";
import React from "react";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router";

import {useDeleteScheduledDates} from "app/features/transport/hooks/useDeleteScheduledDates";
import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchRemoveActivityFromTrip} from "app/redux/actions/trips";

import {getActivityKeyLabel, getTransportRelatedActivities} from "../../trip.service";
import {SimilarActivityWithTransportData} from "../../trip.types";
type DeleteActivityFromTripModalProps = {
    tripUid: string;
    activities: SimilarActivityWithTransportData[];
    activityToDelete: SimilarActivityWithTransportData;
    onClose: () => void;
    onDelete: () => void;
};
export function DeleteActivityFromTripModal({
    tripUid,
    activities,
    activityToDelete,
    onClose,
    onDelete,
}: DeleteActivityFromTripModalProps) {
    const history = useHistory();
    const {extendedView} = useExtendedView();
    const dispatch = useDispatch();
    const activitiesToDelete = activityToDelete
        ? getTransportRelatedActivities(activities, activityToDelete)
        : [];
    const deleteActivity = (activityToDelete: SimilarActivityWithTransportData) => {
        onDelete();
        fetchRemoveActivityFromTrip(
            tripUid,
            activityToDelete.uid,
            extendedView,
            deleteScheduledDates
        )(dispatch).then((response) => {
            if (response?.entities?.schedulerTrips?.[response.result]?.is_prepared === false) {
                history.push("/app/scheduler");
            }
        });
    };
    const [deleteScheduledDates, setDeleteScheduledDates] = useDeleteScheduledDates(true);
    return (
        <ConfirmationModal
            title={t("trip.deleteActivityTitle")}
            onClose={onClose}
            mainButton={{
                onClick: () => {
                    deleteActivity(activityToDelete);
                    onClose();
                },
                severity: "danger",
                children: t("common.remove"),
            }}
            data-testid="remove-activity-from-trip-modal"
            confirmationMessage={
                <>
                    <Text>{t("trip.deleteActivity")}</Text>
                    <Text as="li">
                        {
                            getActivityKeyLabel(activityToDelete.category)
                            // eslint-disable-next-line react/jsx-no-literals
                        }{" "}
                        - {activityToDelete.address?.name ?? t("components.addressNotProvided")}{" "}
                        {addressDisplayService.getActivityAddressLabel(activityToDelete.address)}
                    </Text>
                    <Text mt={2}>{t("trip.deleteLinkedActivities")}</Text>
                    {activitiesToDelete.map((a, idx) => (
                        <Text as="li" key={idx}>
                            {
                                getActivityKeyLabel(a.category)
                                // eslint-disable-next-line react/jsx-no-literals
                            }{" "}
                            - {a.address?.name ?? t("components.addressNotProvided")}{" "}
                            {addressDisplayService.getActivityAddressLabel(a.address)}
                        </Text>
                    ))}
                    <Text mt={2} mb={3}>
                        {t("trip.deleteActivityConfirmation")}
                    </Text>
                    <Checkbox
                        checked={deleteScheduledDates}
                        onChange={setDeleteScheduledDates}
                        label={t("components.deletedScheduledDates")}
                        data-testid="deleted-scheduled-dates"
                    />
                </>
            }
        />
    );
}
