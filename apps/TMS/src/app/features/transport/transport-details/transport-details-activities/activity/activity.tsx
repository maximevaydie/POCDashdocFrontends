import {apiService, getConnectedCompany, useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Button,
    Card,
    Flex,
    Icon,
    IconButton,
    Text,
    theme,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {
    formatNumber,
    NewSignatory,
    isTransportInvoiced,
    useToggle,
    type TransportAddress,
} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useMemo, useState} from "react";
import {DraggableProvidedDragHandleProps} from "react-beautiful-dnd";

import {UpdateAddressModal} from "app/features/address/modal/update-address-modal";
import {UpdateReferenceListModal} from "app/features/address/reference/list/update-reference-list-modal";
import {ViewReferenceListModal} from "app/features/address/reference/list/view-reference-list-modal";
import {ActivityMarker} from "app/features/maps/marker/activity-marker";
import QualimatHistoryModal from "app/features/settings/qualimat/QualimatHistoryModal";
import {AmendTransportWarningBanner} from "app/features/transport/amend-transport-warning-banner";
import {RentalWorkedHoursButton} from "app/features/transport/rental/RentalWorkedHoursButton";
import {SupportsExchangesInfoModal} from "app/features/transport/support-exchanges/SupportsExchangesInfoModal";
import {DeleteDeliveryButton} from "app/features/transport/transport-details/transport-details-activities/activity/actions/DeleteDeliveryButton";
import {MarkSiteUndoneButton} from "app/features/transport/transport-details/transport-details-activities/activity/actions/mark-site-undone-button/MarkSiteUndoneButton";
import {UpdateRealDateModal} from "app/features/transport/transport-details/transport-details-activities/activity/actions/update-real-date-modal";
import UpdateScheduledDateModal from "app/features/transport/transport-details/transport-details-activities/activity/actions/update-scheduled-date-modal";
import {ActivityBooking} from "app/features/transport/transport-details/transport-details-activities/activity/ActivityBooking";
import {ActivityDuration} from "app/features/transport/transport-details/transport-details-activities/activity/ActivityDuration";
import {DeliveriesBadges} from "app/features/transport/transport-details/transport-details-activities/activity/DeliveriesBadges";
import UpdateInstructionsModal from "app/features/transport/transport-details/transport-details-activities/instructions/update-site-instructions-modal";
import {getDateLimits} from "app/features/transport/transport-details/transport-details-activities/SiteDateAndTime.service";
import {UpdateActivityAskedDatesModal} from "app/features/transport/transport-details/transport-details-activities/UpdateActivityAskedDatesModal";
import {useExtendedView} from "app/hooks/useExtendedView";
import {useTransportViewer} from "app/hooks/useTransportViewer";
import {
    fetchCancelOnSiteStatus,
    fetchDeleteTransportSites,
    fetchUpdateSite,
} from "app/redux/actions";
import {useSelector} from "app/redux/hooks";
import {useDispatch} from "app/redux/hooks";
import {activityRightService, isTransportRental} from "app/services/transport";
import {activityService} from "app/services/transport/activity.service";

import ActivityAddress from "./activity-address";
import ActivityCell from "./activity-cell";
import {ActivityDocumentsModal} from "./activity-document/activity-documents-modal";
import ActivityExtraAction from "./activity-extra-action";
import {ActivityLoads} from "./activity-loads/activity-loads";
import ActivityDistanceCell from "./activity-telematic";
import ActivityWarnings from "./activity-warnings";
import HoursCell from "./hours-cell";

import type {
    Site,
    Transport,
    TransportStatus,
    Activity as ActivityData,
} from "app/types/transport";

const ActivityMarkerDnDWrapper = styled(Flex)`
    &:hover > .dnd-handle {
        display: flex;
    }
    &:hover > .marker {
        display: none;
    }
`;

type UpdatedReferenceState = {
    reference: string;
    siteUid: string;
    role: "carrier" | "shipper" | "origin" | "destination";
};

type ActivityProps = {
    activity: ActivityData;
    isFirstActivity: boolean;
    isLastActivity: boolean;
    isLastActivityOfBlock: boolean;
    updatesAllowed: boolean;
    realLoadsUpdatesAllowed: boolean;
    plannedLoadsUpdatesAllowed: boolean;
    transport: Transport;
    isQualimat: boolean;
    onMarkActivityDone: (activity: ActivityData) => any;
    canBeDeleted: boolean;
    onDistanceClick: () => void;
    onActivityDeleted?: () => void;
    isModifyingFinalInfo?: boolean;
    dragHandleProps?: DraggableProvidedDragHandleProps | null;
    isDragging?: boolean;
};

export const Activity: FunctionComponent<ActivityProps> = ({
    activity,
    isFirstActivity,
    isLastActivity,
    isLastActivityOfBlock,
    updatesAllowed,
    realLoadsUpdatesAllowed,
    plannedLoadsUpdatesAllowed,
    transport,
    isQualimat,
    onMarkActivityDone,
    canBeDeleted,
    onDistanceClick,
    onActivityDeleted,
    isModifyingFinalInfo,
    dragHandleProps,
    isDragging,
}) => {
    const dispatch = useDispatch();

    const connectedCompany = useSelector(getConnectedCompany);
    const {isCarrier, isPublicViewer, isReadOnly} = useTransportViewer(transport);

    const {extendedView} = useExtendedView();
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");

    const activityTitle = useMemo(() => activityService.getActivityTitle(activity), [activity]);

    const activityComplete = useMemo(() => {
        // In this case, we display only one delivery, and no events is sent by the backend
        // So we need to check the public_tracking_status to know if the activity is complete
        if (isPublicViewer && transport.public_tracking_status) {
            return (
                (isFirstActivity &&
                    ["loading_complete", "on_unloading_site", "unloading_complete"].includes(
                        transport.public_tracking_status
                    )) ||
                (isLastActivity && transport.public_tracking_status === "unloading_complete")
            );
        }

        // Private viewer
        return activityService.isActivityComplete(activity);
    }, [
        activity,
        isPublicViewer,
        isFirstActivity,
        isLastActivity,
        transport.public_tracking_status,
    ]);
    const activityOnSite = useMemo(() => activityService.isActivityOnSite(activity), [activity]);

    const activityStatusText = useMemo(() => {
        if (activityComplete) {
            return activityService.getActivityCompleteStatusText(activity);
        }
        if (activityOnSite) {
            return activityService.getActivityOnSiteStatusText(activity);
        }
        return null;
    }, [activity, activityComplete, activityOnSite]);

    const [supportExchangesModalOpen, openSupportExchangesModal, closeSupportExchangesModal] =
        useToggle(false);

    const [documentsModalOpen, openDocumentsModal, closeDocumentsModal] = useToggle(false);
    const [
        updateScheduledDateModalOpen,
        openUpdateScheduledDateModal,
        closeUpdateScheduledDateModal,
    ] = useToggle();
    const [updateAskedDateModalOpen, openUpdateAskedDateModal, closeUpdateAskedDateModal] =
        useToggle();
    const [updateRealDateModalOpen, openUpdateRealDateModal, closeUpdateRealDateModal] =
        useToggle();
    const [
        updateActivityAddressModalOpen,
        openUpdateActivityAddressModal,
        closeUpdateActivityAddressModal,
    ] = useToggle();
    const [updateActivitySignatoryModal, setUpdateActivitySignatoryModal] =
        useState<NewSignatory>();
    const [qualimatHistoryModalOpen, openQualimatHistoryModal, closeQualimatHistoryModal] =
        useToggle();
    const [instructionsModalOpen, openInstructionsModal, closeInstructionsModal] = useToggle();

    const [updatedReference, setUpdatedReferenceModal] = useState<UpdatedReferenceState>();
    const [viewedReference, setViewedReferenceModal] = useState<string>();
    const exchangesHaveObservations = activity.site.supports_exchanges?.reduce((acc, exchange) => {
        return acc || !!exchange.observations;
    }, false);

    const canMarkActivityAsDone = activityRightService.canMarkActivityAsDone(
        transport,
        activity,
        connectedCompany?.pk
    );

    const canMarkActivityUndone = activityRightService.canMarkActivityAsUndone(
        transport,
        activity,
        connectedCompany?.pk
    );

    const onSiteStatusUid = useMemo(
        () =>
            activity.statusUpdates.find(
                ({category}) => category === "on_loading_site" || category === "on_unloading_site"
            )?.uid,
        [activity]
    );

    const canCancelOnSiteStatus = useMemo(
        () =>
            activityRightService.canCancelOnSiteStatus(
                transport,
                activity.isCancelled,
                activityComplete,
                !!onSiteStatusUid,
                connectedCompany?.pk
            ),
        [transport, activity.isCancelled, activityComplete, onSiteStatusUid, connectedCompany?.pk]
    );

    const canUpdateReferences =
        !isPublicViewer &&
        !isReadOnly &&
        !(hasInvoiceEntityEnabled && isTransportInvoiced(transport));

    const [isDeletingActivity, setIsDeletingActivity] = useState(false);
    const deleteActivity = useCallback(() => {
        setIsDeletingActivity(true);
        dispatch(fetchDeleteTransportSites(transport.uid, [activity.site.uid])).finally(() => {
            // @ts-ignore
            onActivityDeleted();
            setIsDeletingActivity(false);
        });
    }, [dispatch, transport.uid, activity.site.uid, onActivityDeleted]);

    const siteInstructions = [activity.site.instructions, activity.site.trucker_instructions]
        .filter(Boolean)
        .join("\n");

    const documentCount = activity.deliveryDocuments.length + activity.messageDocuments.length;

    const canUpdateHours =
        updatesAllowed &&
        !["done", "invoiced", "verified", "cancelled", "paid"].includes(transport.status);

    const canAmendExchange = updatesAllowed && transport.global_status === "done";

    const shouldDisplaySupportExchangesButton = useMemo(
        () =>
            activity.status !== "done" ||
            activity.site.supports_exchanges.length > 0 ||
            canAmendExchange,
        [activity.site.supports_exchanges, activity.status, canAmendExchange]
    );

    const onCancelOnSiteStatus = (
        siteUid: Site["uid"],
        onSiteStatusUid: TransportStatus["uid"]
    ) => {
        dispatch(fetchCancelOnSiteStatus(siteUid, onSiteStatusUid));
    };

    const onActivityAddressModalShown = () => {
        const signatureUpdateCandidate = transport.status_updates.find(
            (update) => update.site === activity?.site?.uid && update.signature?.signatory
        );
        const signatoryCandidate = signatureUpdateCandidate?.signature?.signatory;
        setUpdateActivitySignatoryModal(
            signatoryCandidate && "uid" in signatoryCandidate ? signatoryCandidate : undefined
        );
        openUpdateActivityAddressModal();
    };

    const handleSiteSignatorySubmit = async (
        signatory: NewSignatory,
        removeSignatory: boolean
    ) => {
        if (signatory) {
            await apiService.TransportSignatories.patch(
                signatory.uid,
                {
                    data: {...signatory, site: activity.site.uid},
                },
                {
                    apiVersion: "web",
                }
            );
        } else if (removeSignatory) {
            await apiService.SiteSignatories.delete(activity.site.uid);
        }
    };

    const dateLimits = getDateLimits(activity.site.uid, transport);

    const activityStatus = activityComplete ? "done" : activityOnSite ? "on_site" : "not_started";

    const isVehicleOnlyQualimat =
        isQualimat &&
        activity.segment?.vehicle?.used_for_qualimat_transports &&
        !activity.segment?.trailers?.some((trailer) => trailer.used_for_qualimat_transports);

    const hasQualimatFleet =
        !!activity.segment?.vehicle?.used_for_qualimat_transports ||
        !!activity.segment?.trailers?.some((trailer) => trailer.used_for_qualimat_transports);

    const stylesIfDisabled = {
        pointerEvents: "none",
        opacity: "0.66",
        cursor: "not-allowed",
    } as React.CSSProperties;

    return (
        <>
            <Flex style={activity.isCancelled ? stylesIfDisabled : {}}>
                <Flex flexDirection="column" alignItems="center">
                    {isModifyingFinalInfo && (
                        <AmendTransportWarningBanner isRental={isTransportRental(transport)} />
                    )}
                    <Box
                        flex={1}
                        // @ts-ignore
                        border={!isDragging && !(isFirstActivity && isPublicViewer) && "1px solid"}
                        borderColor="grey.light"
                    />
                    <ActivityMarkerDnDWrapper {...dragHandleProps}>
                        {dragHandleProps && (
                            <Box
                                width="2.3em"
                                height="2.3em"
                                alignItems="center"
                                justifyContent="center"
                                display="none"
                                className="dnd-handle"
                            >
                                <Icon name="drag" color="grey.dark" />
                            </Box>
                        )}
                        <TooltipWrapper
                            content={activityStatusText}
                            boxProps={{className: dragHandleProps ? "marker" : ""}}
                        >
                            <ActivityMarker
                                activityIndex={activity.index + 1}
                                activityStatus={activityStatus}
                                hasBackground={activityStatus !== "not_started"}
                            />
                        </TooltipWrapper>
                    </ActivityMarkerDnDWrapper>
                    <Box
                        flex={1}
                        border={!isLastActivity ? "1px solid" : undefined}
                        borderColor="grey.light"
                    />
                </Flex>
                <Card
                    flex={1}
                    py={3}
                    px={1}
                    mx={3}
                    mt={1}
                    mb={isLastActivityOfBlock ? 5 : 1}
                    backgroundColor={activityComplete ? "green.ultralight" : undefined}
                    data-testid={`activity-${activity.index}`}
                    overflow="visible"
                >
                    <Flex alignItems="baseline" px={3} pb={2} justifyContent="space-between">
                        <Flex alignItems="baseline">
                            <Text variant="h1" mr={4}>
                                {activityTitle}
                            </Text>
                            {canCancelOnSiteStatus && onSiteStatusUid && (
                                <Button
                                    variant="secondary"
                                    data-testid={`activity-${activity.index}-activity-cancel-on-site-status`}
                                    onClick={() =>
                                        onCancelOnSiteStatus(activity.site.uid, onSiteStatusUid)
                                    }
                                    modalProps={{
                                        title: t("activity.cancelOnSiteStatus"),
                                        mainButton: {
                                            children: t("common.confirm"),
                                        },
                                    }}
                                    withConfirmation
                                    confirmationMessage={t("activity.confirmCancelOnSiteStatus")}
                                    ml={4}
                                >
                                    <Icon name="removeCircle" mr={2} color="red.default" />
                                    {t("activity.cancelOnSiteStatus")}
                                </Button>
                            )}
                            {canMarkActivityUndone && (
                                <MarkSiteUndoneButton
                                    dataTestId={`activity-${activity.index}-activity-mark-undone-button`}
                                    site={activity.site}
                                    transport={transport}
                                    truckerPk={activity.segment?.trucker?.pk}
                                />
                            )}
                            {canMarkActivityAsDone ? (
                                <Button
                                    variant="secondary"
                                    data-testid={`activity-${activity.index}-activity-mark-done-button`}
                                    onClick={() => onMarkActivityDone(activity)}
                                    ml={4}
                                >
                                    <Icon name="check" mr={2} color="blue.default" />
                                    {t("common.markDone")}
                                </Button>
                            ) : (
                                <Box pt={5} />
                            )}
                        </Flex>
                        {canBeDeleted && transport.shape !== "complex" && (
                            <Box>
                                <IconButton
                                    name="delete"
                                    onClick={deleteActivity}
                                    disabled={isDeletingActivity}
                                    withConfirmation={true}
                                    confirmationMessage={t("components.deleteActivityAlert")}
                                    modalProps={{
                                        title: t("components.deleteActivity"),
                                        mainButton: {
                                            children: t("common.delete"),
                                        },
                                    }}
                                    data-testid="TODO-delete-activity"
                                />
                            </Box>
                        )}
                        {!activity.isCancelled && transport.shape === "complex" && (
                            <Flex alignItems="center">
                                <DeliveriesBadges
                                    activity={activity}
                                    deliveries={transport.deliveries}
                                />

                                <DeleteDeliveryButton
                                    transport={transport}
                                    activity={activity}
                                    isDeletingActivity={isDeletingActivity}
                                    setIsDeletingActivity={setIsDeletingActivity}
                                    onActivityDeleted={onActivityDeleted}
                                />
                            </Flex>
                        )}
                        {activity.isCancelled && (
                            <Box>
                                <Badge
                                    alignSelf="center"
                                    mr={2}
                                    variant={"errorDark"}
                                    data-testid="activity-cancelled-badge"
                                    shape="squared"
                                >
                                    <Text variant="h2" color="unset">
                                        {t("components.cancelled")}
                                    </Text>
                                </Badge>
                            </Box>
                        )}
                    </Flex>
                    <Flex pb={5}>
                        <ActivityCell flex="1.25">
                            <Text variant="captionBold" mb={1}>
                                {t("common.address")}
                            </Text>
                            <ActivityAddress
                                activity={activity}
                                updatesAllowed={updatesAllowed}
                                refUpdateAllowed={canUpdateReferences}
                                onActivityAddressModalShown={onActivityAddressModalShown}
                                onEditReferenceModalShown={setUpdatedReferenceModal}
                                onViewReferenceModalShown={setViewedReferenceModal}
                            />
                        </ActivityCell>
                        <HoursCell
                            activity={activity}
                            transport={transport}
                            updatesAllowed={canUpdateHours}
                            isCarrier={isCarrier}
                            dateLimits={dateLimits}
                            onAskedDateModalShown={openUpdateAskedDateModal}
                            onScheduledDateModalShown={openUpdateScheduledDateModal}
                            onRealDateModalShown={openUpdateRealDateModal}
                        />
                        <Flex flexDirection="column" flex={1} style={{gap: theme.space[3]}}>
                            <ActivityDistanceCell
                                activity={activity}
                                displayDistance={!isFirstActivity}
                                updatesAllowed={updatesAllowed}
                                showActivateETAButton={!isPublicViewer}
                                onDistanceClick={onDistanceClick}
                            />
                            <ActivityDuration activity={activity} />
                        </Flex>
                        {activity.siteType !== "bulkingBreak" ? (
                            <ActivityCell>
                                <Text variant="captionBold" mb={1}>
                                    {t("common.misc")}
                                </Text>
                                {documentCount > 0 && (
                                    <ActivityExtraAction
                                        onClick={() => openDocumentsModal()}
                                        data-testid={`activity-documents`}
                                        iconName="documents"
                                    >
                                        {t("activity.documents", {
                                            smart_count: formatNumber(documentCount),
                                        })}
                                    </ActivityExtraAction>
                                )}
                                <Flex
                                    position="relative"
                                    p={1}
                                    mx={"-5px"}
                                    onClick={openInstructionsModal}
                                    css={{
                                        "&:hover": {
                                            backgroundColor: theme.colors.grey.light,
                                        },
                                        cursor: "pointer",
                                    }}
                                    data-testid={`instructions-${
                                        activity.type === "loading" ? "loading" : "unloading"
                                    }`}
                                >
                                    <Icon name="instructions" color="blue.default" mr={2} />
                                    <Text ellipsis flexBasis="100%" color="blue.default">
                                        {t("common.instructions")}:{" "}
                                        {siteInstructions || t("common.emptyInstructions")}
                                    </Text>
                                </Flex>
                                {shouldDisplaySupportExchangesButton && (
                                    <ActivityExtraAction
                                        onClick={openSupportExchangesModal}
                                        data-testid={`exchange-info`}
                                    >
                                        {t("common.holderExchange")}{" "}
                                        {exchangesHaveObservations && (
                                            <Icon name="warning" color="orange.default" />
                                        )}
                                    </ActivityExtraAction>
                                )}
                                {isQualimat && hasQualimatFleet && (
                                    <ActivityExtraAction
                                        onClick={openQualimatHistoryModal}
                                        data-testid={`qualimat-history`}
                                    >
                                        {t("qualimatHistory.modalTitle")}
                                    </ActivityExtraAction>
                                )}
                                <RentalWorkedHoursButton
                                    transport={transport}
                                    canAmendRest={realLoadsUpdatesAllowed}
                                />
                                <ActivityWarnings activity={activity} />
                            </ActivityCell>
                        ) : (
                            <ActivityCell />
                        )}
                    </Flex>
                    {activity.site.address?.flow_site?.slug && (
                        <Flex mx={3} flexDirection="column">
                            <Text variant="captionBold" mb={3}>
                                {t("common.booking")}
                            </Text>
                            <ActivityBooking
                                isBookingNeeded={activity.site.is_booking_needed}
                                siteUid={activity.site.uid}
                                slug={activity.site.address.flow_site.slug}
                            />
                        </Flex>
                    )}
                    <Flex
                        borderTopColor="grey.light"
                        borderTopWidth={1}
                        borderTopStyle="solid"
                        pt={5}
                        mx={3}
                        flexDirection="column"
                    >
                        <Text variant="captionBold" mb={3}>
                            {t("common.loads")}
                        </Text>
                        <ActivityLoads
                            activity={activity}
                            transport={transport}
                            realLoadsUpdatesAllowed={realLoadsUpdatesAllowed}
                            plannedLoadsUpdatesAllowed={plannedLoadsUpdatesAllowed}
                            loadCardBackground={activityComplete ? "green.ultralight" : undefined}
                        />
                    </Flex>
                </Card>
            </Flex>
            {supportExchangesModalOpen && (
                <SupportsExchangesInfoModal
                    transport={transport}
                    siteType={activity.siteType}
                    exchanges={activity.site.supports_exchanges}
                    siteUid={activity.site.uid}
                    canEditExchanges={activity.status !== "done"}
                    canAmendExchange={canAmendExchange}
                    onClose={closeSupportExchangesModal}
                />
            )}

            {documentsModalOpen && (
                <ActivityDocumentsModal
                    onClose={closeDocumentsModal}
                    deliveryDocuments={activity.deliveryDocuments}
                    messageDocuments={activity.messageDocuments}
                    transport={transport}
                    readOnly={isPublicViewer}
                    activityIndex={activity.index + 1}
                />
            )}
            {instructionsModalOpen && (
                <UpdateInstructionsModal
                    truckerInstructionsVisible={isCarrier && !isPublicViewer}
                    onClose={closeInstructionsModal}
                    activity={activity}
                    editable={updatesAllowed}
                />
            )}
            {qualimatHistoryModalOpen && (
                <QualimatHistoryModal
                    type={isVehicleOnlyQualimat ? "vehicles" : "trailers"}
                    fleetItemId={
                        isVehicleOnlyQualimat //TODO:
                            ? (activity.segment?.vehicle?.original as number)
                            : (activity.segment?.trailers?.[0]?.original as number)
                    }
                    fleetLicensePlate={
                        isVehicleOnlyQualimat
                            ? (activity.segment?.vehicle?.license_plate as string)
                            : (activity.segment?.trailers?.[0]?.license_plate as string)
                    }
                    fleetUsedForQualimat={hasQualimatFleet}
                    fromTransportUid={transport.uid}
                    onClose={closeQualimatHistoryModal}
                />
            )}
            {updateActivityAddressModalOpen && (
                <UpdateAddressModal
                    onSubmit={async (address, _sendToCarrier, signatory, signatoryRemoved) => {
                        if (!activity) {
                            throw "No updateActivityAddressModalOpen";
                        }

                        await dispatch(
                            fetchUpdateSite(activity.site.uid, {
                                //TODO: OriginalAddress is not compatible with TransportAddress
                                address: address as TransportAddress | undefined,
                                extended_view: extendedView,
                            })
                        );

                        // @ts-ignore
                        await handleSiteSignatorySubmit(signatory, signatoryRemoved);
                    }}
                    //TransportAddressWithCompany is not compatible with TransportAddress
                    initialAddress={activity.site.address}
                    siteUID={activity.site.uid}
                    addressCategory={activity.siteType}
                    isModifyingFinalInfo={transport.status === "done"}
                    isRental={isTransportRental(transport)}
                    onClose={closeUpdateActivityAddressModal}
                    initialSignatory={updateActivitySignatoryModal}
                />
            )}
            {updateAskedDateModalOpen && (
                <UpdateActivityAskedDatesModal
                    tripUid={activity.site.trip?.uid as string}
                    activityUid={activity.site.uid}
                    askedDates={
                        activity.site.slots && activity.site.slots.length > 0
                            ? activity.site.slots[0]
                            : undefined
                    }
                    isActivityBookingNeeded={activity.site.is_booking_needed}
                    isActivityLockedRequestedTimes={activity.site.locked_requested_times ?? false}
                    onClose={closeUpdateAskedDateModal}
                    beforeLaterStartDate={dateLimits.asked.beforeLaterStartDate}
                    afterEarlierEndDate={dateLimits.asked.afterEarlierEndDate}
                    truckerPk={activity.segment?.trucker?.pk}
                    vehiclePk={
                        activity.segment?.vehicle?.original ?? activity.segment?.vehicle?.pk
                    }
                    trailerPk={
                        activity.segment?.trailers?.[0]?.original ??
                        activity.segment?.trailers?.[0]?.pk
                    }
                />
            )}
            {updateScheduledDateModalOpen && (
                <UpdateScheduledDateModal
                    onClose={closeUpdateScheduledDateModal}
                    activity={activity}
                    beforeLaterStartDate={dateLimits.scheduled.beforeLaterStartDate}
                    afterEarlierEndDate={dateLimits.scheduled.afterEarlierEndDate}
                />
            )}
            {updateRealDateModalOpen && (
                <UpdateRealDateModal
                    onClose={closeUpdateRealDateModal}
                    activity={activity}
                    isRental={isTransportRental(transport)}
                />
            )}
            {updatedReference && (
                <UpdateReferenceListModal
                    onClose={() => setUpdatedReferenceModal(undefined)}
                    referenceType={updatedReference.role}
                    siteUid={updatedReference.siteUid}
                    initialReference={updatedReference.reference}
                />
            )}
            {viewedReference && (
                <ViewReferenceListModal
                    onClose={() => {
                        setViewedReferenceModal(undefined);
                    }}
                    reference={viewedReference}
                />
            )}
        </>
    );
};
