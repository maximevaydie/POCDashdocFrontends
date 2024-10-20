import {t} from "@dashdoc/web-core";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import ActivityExtraAction from "app/features/transport/transport-details/transport-details-activities/activity/activity-extra-action";
import {isTransportRental} from "app/services/transport/transport.service";

import {RentalWorkedHoursModal} from "./RentalWorkedHoursModal";

import type {Transport} from "app/types/transport";

type RentalWorkedHoursButtonProps = {
    transport: Transport;
    canAmendRest: boolean;
};
export const RentalWorkedHoursButton: FunctionComponent<RentalWorkedHoursButtonProps> = ({
    transport,
    canAmendRest,
}) => {
    const [rentalWorkedHoursModalOpen, openRentalWorkedHoursModal, closeRentalWorkedHoursModal] =
        useToggle(false);
    const isRental = isTransportRental(transport);
    if (!isRental) {
        return null;
    }
    return (
        <>
            <ActivityExtraAction
                onClick={() => openRentalWorkedHoursModal()}
                data-testid={`rental-worked-hours`}
            >
                {t("rentalWorkedHours.modalTitle")}
            </ActivityExtraAction>
            {rentalWorkedHoursModalOpen && (
                <RentalWorkedHoursModal
                    transport={transport}
                    onClose={closeRentalWorkedHoursModal}
                    canAmendRest={canAmendRest}
                />
            )}
        </>
    );
};
