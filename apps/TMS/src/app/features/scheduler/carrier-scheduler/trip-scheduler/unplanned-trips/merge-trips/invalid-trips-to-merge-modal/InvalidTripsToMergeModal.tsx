import {t} from "@dashdoc/web-core";
import {Modal} from "@dashdoc/web-ui";
import sumBy from "lodash.sumby";
import React from "react";

import {InvalidTripType, CompactTrip} from "app/features/trip/trip.types";

import {InvalidHeader} from "./InvalidHeader";
import {InvalidTripDetails} from "./InvalidTripDetails";
import {TripValidationDetails} from "./TripValidationDetails";

type InvalidTripsToMergeModalProps = {
    invalidTripsInfo: {trip: CompactTrip; reason: InvalidTripType}[];
    validTrips: CompactTrip[];
    isCreation: boolean;
    onSubmit: (validTrips: CompactTrip[]) => void;
    onClose: () => void;
};

export function InvalidTripsToMergeModal({
    invalidTripsInfo,
    validTrips,
    isCreation,
    onSubmit,
    onClose,
}: InvalidTripsToMergeModalProps) {
    if (!invalidTripsInfo || invalidTripsInfo.length === 0) {
        return null;
    }

    return (
        <Modal
            id="merge-invalid-trip-types-modal"
            data-testid="merge-invalid-trip-types-modal"
            title={isCreation ? t("trip.invalidMerge.title") : t("trip.addActivity")}
            onClose={onClose}
            mainButton={
                validTrips?.length >= 1
                    ? {
                          onClick: () => {
                              onClose();
                              return onSubmit(validTrips);
                          },
                          "data-testid": "validate-partial-merge",
                          children: isCreation ? t("trip.createTrip") : t("common.confirm"),
                      }
                    : {
                          onClick: onClose,
                          "data-testid": "understood-invalid-merge",
                          children: t("common.confirmUnderstanding"),
                      }
            }
            secondaryButton={
                validTrips?.length >= 1
                    ? {
                          onClick: onClose,
                      }
                    : null
            }
        >
            <InvalidHeader validCount={validTrips.length} invalidCount={invalidTripsInfo.length} />
            <TripValidationDetails
                type="valid"
                tripCount={validTrips.length}
                activityCount={sumBy(validTrips, (trip: CompactTrip) => trip.activities.length)}
            />
            <TripValidationDetails type="invalid" tripCount={invalidTripsInfo.length} />

            {invalidTripsInfo.map(({trip, reason}, index) => (
                <InvalidTripDetails trip={trip} reason={reason} key={index} />
            ))}
        </Modal>
    );
}
