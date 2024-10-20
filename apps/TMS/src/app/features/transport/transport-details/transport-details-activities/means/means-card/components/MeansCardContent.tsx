import {getConnectedManager, managerService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Button,
    ClickableUpdateRegion,
    Flex,
    Icon,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {Pricing, useToggle, type Trucker} from "dashdoc-utils";
import React, {useMemo} from "react";

import {MeanTurnoverRegion} from "app/features/transport/transport-details/transport-details-activities/means/means-card/components/MeanTurnoverRegion";
import {PlanAction} from "app/features/transportation-plan/plan-or-subcontract/plan/PlanAction";
import {PlanOrSubcontractAction} from "app/features/transportation-plan/plan-or-subcontract/PlanOrSubcontractAction";
import {type TripMeans} from "app/features/trip/trip.types";
import {useTransportViewer} from "app/hooks/useTransportViewer";
import {useSelector} from "app/redux/hooks";
import {selectExtensionTripIsSentToNetworkInProgress} from "app/redux/reducers/extensions";
import {pricingService} from "app/services/invoicing";

import {NameAndPlates} from "./NameAndPlates";
import {SubContract} from "./SubContract";

import type {Activity, ActivityMeans, Transport} from "app/types/transport";

type Props = {
    assignedToTrucker: boolean;
    sentToTrucker: boolean;
    meansUpdatesAllowed: boolean;
    acknowledgedByTrucker: boolean;
    activities: Activity[];
    transport: Transport;
    pricing: Pricing | null;
    segmentsUidsToCharter: string[];
    tripUid: string;
    means: ActivityMeans;
    resumeIsDone: boolean | undefined;
    isTheOnlyTransportMean?: boolean;
    onChange: () => void;
    onSplitMeansTurnover: () => void;
};

export function MeansCardContent({
    assignedToTrucker,
    sentToTrucker,
    meansUpdatesAllowed,
    acknowledgedByTrucker,
    activities,
    transport,
    pricing,
    segmentsUidsToCharter,
    tripUid,
    means,
    means: {child_transport},
    resumeIsDone,
    isTheOnlyTransportMean,
    onChange,
    onSplitMeansTurnover,
}: Props) {
    const {isCarrierGroup} = useTransportViewer(transport);
    const manager = useSelector(getConnectedManager);
    const isStaff = managerService.isDashdocStaff(manager);
    const displayDetailedMeans = isCarrierGroup || isStaff;

    const extensionTripIsSentInProgress = useSelector((state) =>
        selectExtensionTripIsSentToNetworkInProgress(state, tripUid)
    );

    const isLinkedToPreparedTrip =
        activities.length > 0 && !!activities[0].site?.trip?.is_prepared;

    const badge = getMeansBadge();
    const [isEditingPlan, openEditPlan, closeEditPlan] = useToggle();

    const activityUidForMeanTurnover = means.breakSite?.uid ?? activities[0].site.uid;
    const meanTurnoverIsOverridden = !!transport.split_turnover?.is_overridden;
    const meanTurnover =
        (!!means.breakSite || activities.length > 0) && transport.split_turnover
            ? transport.split_turnover.transport_share_until_next_break[activityUidForMeanTurnover]
            : null;
    const displayMeanTurnover = isCarrierGroup && meanTurnover;

    const priceWithoutPurchaseCosts = useMemo(() => {
        return pricingService.computePriceWithoutPurchaseCosts(pricing, transport.purchase_costs);
    }, [pricing?.final_price_with_gas_indexed, transport.purchase_costs?.total_without_tax]);

    const tripMeans: TripMeans = {
        vehicle: undefined,
        trucker: undefined,
        trailer: undefined,
    };
    const {vehicle, trucker, trailers} = means;
    if (vehicle) {
        tripMeans.vehicle = vehicle;
    }
    if (trucker) {
        //TODO: SegmentTrucker is not assignable to type Trucker
        tripMeans.trucker = trucker as any as Trucker;
    }
    if (trailers.length > 0 && trailers[0]) {
        tripMeans.trailer = trailers[0];
    }

    return (
        <Box minWidth="232px">
            <Flex flexWrap="wrap">
                <Box
                    mr={assignedToTrucker && !sentToTrucker ? 5 : 0}
                    mb={assignedToTrucker && !sentToTrucker ? 1 : 0}
                >
                    <Flex alignItems="center" flexWrap="wrap" maxWidth="100%">
                        <Text variant="captionBold" mr={3}>
                            {t("common.means")}
                        </Text>
                        {isLinkedToPreparedTrip && (
                            <TooltipWrapper content={t("means.transportBelongsToTripTooltip")}>
                                <Icon name="info" />
                            </TooltipWrapper>
                        )}
                        {badge}
                    </Flex>
                </Box>
            </Flex>
            {shouldShowPlanButton() ? (
                <Box mt={2}>
                    <PlanOrSubcontractAction
                        means={tripMeans}
                        disabled={isLinkedToPreparedTrip}
                        transport={transport}
                        sentToTrucker={sentToTrucker}
                        segmentsUidsToCharter={segmentsUidsToCharter}
                        tripUid={tripUid}
                        parentTransportPricing={pricing}
                        onSubcontracted={onChange}
                        onPlanned={onChange}
                        canSubcontract={transport.status !== "done"}
                        isSubcontractingTheWholeTransport={isTheOnlyTransportMean}
                    >
                        <Button
                            variant="primary"
                            data-testid="plan-or-charter-button"
                            disabled={isLinkedToPreparedTrip}
                        >
                            <Icon name="truck" mr={1} /> {t("components.planOrCharter")}
                        </Button>
                    </PlanOrSubcontractAction>
                    {displayMeanTurnover && (
                        <MeanTurnoverRegion
                            priceWithoutPurchaseCosts={priceWithoutPurchaseCosts}
                            meanTurnover={meanTurnover}
                            meanTurnoverIsOverridden={meanTurnoverIsOverridden}
                            onClick={onSplitMeansTurnover}
                        />
                    )}
                </Box>
            ) : (
                <>
                    {extensionTripIsSentInProgress ? (
                        <Box maxWidth={230}>
                            <Flex>
                                <Text variant="h1" mb={3} mt={1}>
                                    {extensionTripIsSentInProgress.name}
                                </Text>
                            </Flex>
                        </Box>
                    ) : (
                        <ClickableUpdateRegion
                            clickable={isClickable()}
                            onClick={openEditPlan}
                            data-testid={`activities-${activities[0]?.index}-${
                                activities[activities.length - 1]?.index
                            }-means`}
                        >
                            {child_transport ? (
                                /* FYI: We cannot edit subcontract directly */
                                <SubContract
                                    charteringChildTransport={child_transport}
                                    meanTurnover={meanTurnover}
                                />
                            ) : (
                                <NameAndPlates
                                    displayDetailedMeans={displayDetailedMeans}
                                    means={means}
                                />
                            )}
                        </ClickableUpdateRegion>
                    )}

                    {displayMeanTurnover && meanTurnover && (
                        <MeanTurnoverRegion
                            priceWithoutPurchaseCosts={priceWithoutPurchaseCosts}
                            meanTurnover={meanTurnover}
                            meanTurnoverIsOverridden={meanTurnoverIsOverridden}
                            onClick={onSplitMeansTurnover}
                        />
                    )}
                    {isEditingPlan && (
                        <PlanAction
                            means={tripMeans}
                            disabled={isLinkedToPreparedTrip}
                            transport={transport}
                            sentToTrucker={sentToTrucker}
                            tripUid={tripUid}
                            onPlanned={onChange}
                            onClose={closeEditPlan}
                            forceEdit
                        />
                    )}
                </>
            )}
        </Box>
    );

    function isClickable() {
        return (
            meansUpdatesAllowed &&
            !child_transport &&
            !isLinkedToPreparedTrip &&
            // We can allow editing the means if the transport is done
            // as long as the company has the right to amend the transport (which is defined in the property "meansUpdatesAllowed")
            (!resumeIsDone ||
                (transport.global_status === "done" &&
                    transport.invoicing_status === "UNVERIFIED"))
        );
    }

    function shouldShowPlanButton() {
        const {vehicle, trailers, trucker, child_transport} = means;
        return (
            meansUpdatesAllowed &&
            !extensionTripIsSentInProgress &&
            !child_transport &&
            !trucker &&
            !vehicle &&
            (!trailers || !trailers.length)
        );
    }

    function getMeansBadge() {
        if (acknowledgedByTrucker) {
            return (
                <Badge width="fit-content" fontSize={1}>
                    {t("components.receivedByTrucker")}
                </Badge>
            );
        }
        if (sentToTrucker) {
            return (
                <Badge width="fit-content" fontSize={1}>
                    {t("components.sentToTrucker")}
                </Badge>
            );
        }
        if (assignedToTrucker) {
            return (
                <Badge width="fit-content" fontSize={1}>
                    {t("components.planned")}
                </Badge>
            );
        }
        if (child_transport?.status === "declined") {
            return (
                <Badge width="fit-content" fontSize={1}>
                    {t("components.declined")}
                </Badge>
            );
        }
        if (child_transport?.status === "created" || child_transport?.status === "updated") {
            if (child_transport?.carrier_assignation_status === "draft_assigned") {
                return (
                    <Badge width="fit-content" fontSize={1}>
                        {t("components.planned")}
                    </Badge>
                );
            }
            if (child_transport?.carrier_assignation_status === "unassigned") {
                return (
                    <Badge width="fit-content" fontSize={1}>
                        {t("sidebar.ordersToAssign")}
                    </Badge>
                );
            }
            return (
                <Badge width="fit-content" fontSize={1}>
                    {t("components.sentToSubcontracter")}
                </Badge>
            );
        }
        if (child_transport?.status === "confirmed") {
            return (
                <Badge width="fit-content" fontSize={1}>
                    {t("components.accepted")}
                </Badge>
            );
        }
        if (extensionTripIsSentInProgress) {
            return (
                <Badge width="fit-content" fontSize={1}>
                    <Icon name="loader" mr={2} />
                    {t("sendToNetwork.sending")}
                </Badge>
            );
        }
        return null;
    }
}
