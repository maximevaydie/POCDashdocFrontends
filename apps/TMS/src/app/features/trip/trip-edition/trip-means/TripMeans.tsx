import {HasFeatureFlag, HasNotFeatureFlag, useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Callout, ClickableBox, Flex, ShortcutWrapper, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {useTripConflictWithUnavailability} from "app/features/fleet/unavailabilities/hooks/useConflictWithUnavailability";
import {MeansOverview} from "app/features/transport/transport-form/means/MeansOverview";
import {PlanOrSubcontractAction} from "app/features/transportation-plan/plan-or-subcontract/PlanOrSubcontractAction";
import {canEditTripMeans} from "app/features/trip/trip.service";

import {TripWithTransportData} from "../../trip.types";

import {SendToCarrierButton} from "./SendToCarrierButton";
import {SendToTruckerButton} from "./SendToTruckerButton";
import {TripMeansEditionPanel} from "./TripMeansEditionPanel";
import {TripMeansOverview} from "./TripMeansOverview";
import {TripSubcontractingOverview} from "./TripSubcontractingOverview";

interface TripMeansProps {
    trip: TripWithTransportData;
    readOnly: boolean;
    openEditionPanel: () => void;
    closeEditionPanel: () => void;
    onSubcontract?: () => void;
}

export const TripMeans: FunctionComponent<TripMeansProps> = ({
    trip,
    readOnly,
    openEditionPanel,
    closeEditionPanel,
    onSubcontract,
}) => {
    const [isEditingMeans, openEdition, closeEdition] = useToggle(false);

    const canEditMeans = !readOnly && canEditTripMeans(trip);

    const openMeansEdition = () => {
        if (!canEditMeans) {
            return;
        }
        openEdition();
        openEditionPanel();
    };
    const closeMeansEdition = () => {
        closeEdition();
        closeEditionPanel();
    };

    const hasMeans = !!(trip.trucker?.pk || trip.trailer?.pk || trip.vehicle?.pk);

    const means = {
        trucker: trip.trucker,
        trailer: trip.trailer,
        vehicle: trip.vehicle,
    };

    const {
        hasTruckerAvailabilityConflict,
        hasVehicleAvailabilityConflict,
        hasTrailerAvailabilityConflict,
    } = useTripConflictWithUnavailability(trip);

    const subcontractTripEnabled = useFeatureFlag("subcontractTrip");

    const isTripSubcontracted = trip.child_transport != null;
    const canSendToCarrier = isTripSubcontracted && !trip.child_transport!.sent_to_carrier;
    const canSendToTrucker = trip.trucker_status === "trucker_assigned" && !readOnly;

    return (
        <Box>
            <Flex alignItems="center" justifyContent="space-between" mt={4} mb={3}>
                <Text variant="h1">{t("common.means")}</Text>
                <HasFeatureFlag flagName="subcontractTrip">
                    {(canSendToCarrier || canSendToTrucker) && (
                        <Box ml={3}>
                            {canSendToCarrier ? (
                                <SendToCarrierButton
                                    tripUid={trip.uid}
                                    childTransportUid={trip.child_transport!.uid}
                                />
                            ) : (
                                <SendToTruckerButton tripUid={trip.uid} />
                            )}
                        </Box>
                    )}
                </HasFeatureFlag>
            </Flex>
            {/* TODO: Remove the following block when removing FF subcontractTrip */}
            {hasMeans && !subcontractTripEnabled ? (
                <Box>
                    <MeansOverview
                        means={means}
                        isEditing={isEditingMeans}
                        openEdition={openMeansEdition}
                        tripUid={trip.uid}
                        canSend={trip.trucker_status === "trucker_assigned" && !readOnly}
                        cannotEditMeans={!canEditMeans}
                        hideTitle={true}
                    />
                    {hasTruckerAvailabilityConflict && (
                        <Callout
                            mt={2}
                            variant="warning"
                            data-testid="conflict-availability-trucker"
                        >
                            <Text>{t("unavailability.truckerUnavailableOnPeriod")}</Text>
                        </Callout>
                    )}
                    {hasVehicleAvailabilityConflict && (
                        <Callout
                            mt={2}
                            variant="warning"
                            data-testid="conflict-availability-vehicle"
                        >
                            <Text>{t("unavailability.vehicleUnavailableOnPeriod")}</Text>
                        </Callout>
                    )}
                    {hasTrailerAvailabilityConflict && (
                        <Callout
                            mt={2}
                            variant="warning"
                            data-testid="conflict-availability-trailer"
                        >
                            <Text>{t("unavailability.trailerUnavailableOnPeriod")}</Text>
                        </Callout>
                    )}
                </Box>
            ) : isTripSubcontracted ? (
                <TripSubcontractingOverview
                    childTransport={trip.child_transport!}
                    tripUid={trip.uid}
                />
            ) : (
                <>
                    <HasFeatureFlag flagName="subcontractTrip">
                        <PlanOrSubcontractAction
                            canSubcontract={trip.status === "unstarted" && !hasMeans}
                            means={means}
                            disabled={!canEditMeans}
                            sentToTrucker={trip.trucker_status === "trucker_assigned"}
                            tripUid={trip.uid}
                            isPlanningPreparedTrip={true}
                            onSubcontracted={onSubcontract}
                        >
                            <>
                                {hasMeans && !trip.child_transport ? (
                                    <TripMeansOverview
                                        trip={trip}
                                        cannotEditMeans={!canEditMeans}
                                    />
                                ) : (
                                    <ClickableBox
                                        border="1px dashed"
                                        borderColor="grey.light"
                                        p={4}
                                        data-testid="empty-trip-means"
                                    >
                                        <Text mb={3}>
                                            <Text variant="h1" color="grey.dark" fontWeight={600}>
                                                {t("trip.addMeans")}
                                            </Text>
                                        </Text>
                                    </ClickableBox>
                                )}
                            </>
                        </PlanOrSubcontractAction>
                    </HasFeatureFlag>
                    <HasNotFeatureFlag flagName="subcontractTrip">
                        <ShortcutWrapper
                            onShortcutPressed={openMeansEdition}
                            shortcutKeyCodes={["Alt", "KeyZ"]}
                        >
                            <ClickableBox
                                border="1px dashed"
                                borderColor="grey.light"
                                p={4}
                                mt={3}
                                width="100%"
                                onClick={openMeansEdition}
                                data-testid="empty-trip-means"
                            >
                                <Text mb={3}>
                                    <Text variant="h1" color="grey.dark" fontWeight={600}>
                                        {t("trip.addMeans")}
                                    </Text>

                                    <Text color="grey.dark">{
                                        // eslint-disable-next-line react/jsx-no-literals
                                        `(Alt + ${t("transportForm.shortcut.keyZ")})`
                                    }</Text>
                                </Text>
                            </ClickableBox>
                        </ShortcutWrapper>
                    </HasNotFeatureFlag>
                </>
            )}

            {isEditingMeans && (
                <TripMeansEditionPanel trip={trip} closeEdition={closeMeansEdition} />
            )}
        </Box>
    );
};
