import {getConnectedCompanyId, HasFeatureFlag, useFeatureFlag} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Box, Button, Card, Flex, Icon, IconButton, Text, toast} from "@dashdoc/web-ui";
import {OriginalAddress, Pricing, useToggle, type TransportAddress} from "dashdoc-utils";
import React, {useState} from "react";

import {UpdateAddressModal} from "app/features/address/modal/update-address-modal";
import {MarkSiteUndoneButton} from "app/features/transport/transport-details/transport-details-activities/activity/actions/mark-site-undone-button/MarkSiteUndoneButton";
import ActivityAddress from "app/features/transport/transport-details/transport-details-activities/activity/activity-address";
import SiteDateAndTime from "app/features/transport/transport-details/transport-details-activities/SiteDateAndTime";
import {
    DateLimits,
    getDateLimits,
} from "app/features/transport/transport-details/transport-details-activities/SiteDateAndTime.service";
import UpdateBreakDateModal from "app/features/transport/transport-details/transport-details-activities/update-break-date-modal";
import {BreakActivityCarbonFootprintBanner} from "app/features/transport/transport-information/carbon-footprint/carbon/BreakActivityCarbonFootprintBanner";
import {DeleteSubcontractAction} from "app/features/transportation-plan/plan-or-subcontract/subcontract/DeleteSubcontractAction";
import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {useCompaniesInGroupViews} from "app/hooks/useCompaniesInGroupViews";
import {useExtendedView} from "app/hooks/useExtendedView";
import {useTransportViewer} from "app/hooks/useTransportViewer";
import {
    fetchConfirmTransportDraftAssigned,
    fetchDeleteTransportSites,
    fetchRetrieveTransport,
    fetchUpdateSite,
} from "app/redux/actions";
import {fetchBulkSendTripTruckerNotification} from "app/redux/actions/trips";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    activityRightService,
    getSegmentUidsToCharter,
    transportRightService,
} from "app/services/transport";

import {MeansCardContent} from "./components/MeansCardContent";
import {MeansCardHeader} from "./components/MeansCardHeader";

import type {Activity, ActivityMeans, Segment, Site, Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    means: ActivityMeans;
    pricing: Pricing | null;
    meansUpdatesAllowed: boolean;
    addressUpdatesAllowed: boolean;
    assignedToTrucker: boolean;
    sentToTrucker: boolean;
    acknowledgedByTrucker: boolean;
    activities: Activity[];
    breakSite?: Site;
    breakIsDone: boolean;
    resumeIsDone: boolean;
    segmentToUpdate: Segment;
    segmentToBreakSite?: Segment;
    segmentFromBreakSite?: Segment;
    onMarkBreakDone: (activity: Partial<Activity>) => void;
    onSplitMeansTurnover: () => void;
    isTheOnlyTransportMean?: boolean;
};

export function MeansCard(props: Props) {
    const {
        means,
        means: {trucker, child_transport},
        transport,
        pricing,
        meansUpdatesAllowed,
        addressUpdatesAllowed,
        assignedToTrucker,
        sentToTrucker,
        acknowledgedByTrucker,
        activities,
        breakSite,
        breakIsDone,
        resumeIsDone,
        segmentToUpdate,
        segmentToBreakSite,
        segmentFromBreakSite,
        isTheOnlyTransportMean,
        onMarkBreakDone,
        onSplitMeansTurnover,
    } = props;

    const dispatch = useDispatch();
    const transportListRefresher = useRefreshTransportLists();
    const {extendedView} = useExtendedView();
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");

    const connectedCompanyId = useSelector(getConnectedCompanyId);
    const companiesInGroupViews = useCompaniesInGroupViews();
    const {isPublicViewer, isCarrierGroup} = useTransportViewer(transport);

    const [isBreakAddressModalOpen, openBreakAddressModal, closeBreakAddressModal] = useToggle();

    const [isUpdatePlannedTimeModalOpen, openUpdatePlannedTimeModal, closeUpdatePlannedTimeModal] =
        useToggle();

    const [isLoading, setIsLoading] = useState(false);
    const [isDeletingBreak, setIsDeletingBreak] = useState(false);

    const segmentsUidsToCharter = getSegmentUidsToCharter(
        activities,
        breakSite,
        segmentFromBreakSite
    );

    const lastActivityTripIsPrepared = activities[activities.length - 1]?.site?.trip?.is_prepared;

    const isBreak = breakSite && segmentToBreakSite && segmentFromBreakSite && isCarrierGroup;
    const canEditTheBreak = transportRightService.canEditBreaks(
        transport,
        connectedCompanyId || undefined,
        companiesInGroupViews,
        hasInvoiceEntityEnabled
    );
    const canMarkBreakAsDone = canEditTheBreak && !resumeIsDone;
    const canMarkBreakAsUndone = activityRightService.canMarkBreakActivityAsUndone(
        activities,
        breakIsDone,
        resumeIsDone
    );
    const canDeleteBreak =
        canEditTheBreak && !breakIsDone && !resumeIsDone && !lastActivityTripIsPrepared;

    const disabled = isLoading || isDeletingBreak;
    const dateLimits = breakSite ? getDateLimits(breakSite.uid, transport) : undefined;

    const isActivitySiteTripPrepared = Boolean(
        activities.length > 0 && activities[0].site?.trip?.is_prepared
    );

    const canActOnTrucker = trucker && !trucker.is_dedicated; // TODO: this will probably change during the pitch

    return (
        <>
            <Card
                mt={1}
                display="inline-block"
                color="grey.ultradark"
                minWidth="450px"
                data-testid="activity-means-card"
            >
                <MeansCardHeader
                    means={means}
                    meansUpdatesAllowed={meansUpdatesAllowed}
                    isActivitySiteTripPrepared={isActivitySiteTripPrepared}
                    activities={activities}
                    isCarrierGroup={isCarrierGroup}
                />
                {/* {activity} */}
                <Flex flexDirection="column" mt={isBreak ? 0 : 3} padding={2}>
                    <Flex mb={2} mx={3} alignItems={isBreak ? "center" : "normal"}>
                        <Flex flex={1}>
                            {isBreak ? (
                                <Text variant="h1">{t("components.break")}</Text>
                            ) : (
                                <MeansCardContent
                                    assignedToTrucker={assignedToTrucker}
                                    sentToTrucker={sentToTrucker}
                                    meansUpdatesAllowed={meansUpdatesAllowed}
                                    acknowledgedByTrucker={acknowledgedByTrucker}
                                    activities={activities}
                                    transport={transport}
                                    pricing={pricing}
                                    segmentsUidsToCharter={segmentsUidsToCharter}
                                    tripUid={segmentToUpdate.origin.trip?.uid as string}
                                    means={means}
                                    resumeIsDone={resumeIsDone}
                                    isTheOnlyTransportMean={isTheOnlyTransportMean}
                                    onChange={handleMutation}
                                    onSplitMeansTurnover={onSplitMeansTurnover}
                                />
                            )}
                        </Flex>
                        <Flex justifyContent="space-between">
                            <Flex>
                                {canActOnTrucker &&
                                    assignedToTrucker &&
                                    !sentToTrucker &&
                                    !lastActivityTripIsPrepared &&
                                    transport.status !== "done" && (
                                        <Box ml={3}>
                                            <Button
                                                onClick={sendToTrucker}
                                                loading={isLoading}
                                                disabled={disabled}
                                                variant="secondary"
                                            >
                                                <Icon mr={1} name="send" />
                                                {t("components.sendToTrucker")}
                                            </Button>
                                        </Box>
                                    )}
                                {canMarkBreakAsDone && isBreak && (
                                    <Box ml={3}>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                onMarkBreakDone({
                                                    type: "bulkingBreakStart",
                                                    siteType: "bulkingBreak",
                                                    site: breakSite,
                                                    transportUid: transport.uid,
                                                    segment: segmentFromBreakSite,
                                                });
                                                transportListRefresher();
                                            }}
                                            data-testid="mark-break-done-button"
                                        >
                                            <Icon name="check" mr={2} color="blue.default" />
                                            {t("common.markDone")}
                                        </Button>
                                    </Box>
                                )}
                                {canMarkBreakAsUndone && isBreak && (
                                    <Box ml={3}>
                                        <MarkSiteUndoneButton
                                            site={breakSite}
                                            transport={transport}
                                            truckerPk={trucker?.pk}
                                            dataTestId="mark-break-undone-button"
                                            breakIsDone={breakIsDone}
                                            resumeIsDone={resumeIsDone}
                                        />
                                    </Box>
                                )}
                            </Flex>
                            {child_transport && !isActivitySiteTripPrepared && (
                                <>
                                    {child_transport.carrier_assignation_status ===
                                        "draft_assigned" && (
                                        <Box ml={3}>
                                            <Button
                                                onClick={sendToCarrier}
                                                loading={isLoading}
                                                disabled={disabled}
                                                variant="secondary"
                                                data-testid="send-chartering-button"
                                            >
                                                <Icon mr={1} name="send" />{" "}
                                                {t("components.sendToCarrier")}
                                            </Button>
                                        </Box>
                                    )}
                                    <Box ml={3}>
                                        <DeleteSubcontractAction
                                            childTransportUid={child_transport.uid}
                                            isDeclined={child_transport.status === "declined"}
                                            isDraftAssigned={
                                                child_transport.carrier_assignation_status ===
                                                "draft_assigned"
                                            }
                                            isLoading={isLoading}
                                            disabled={disabled}
                                            onSuccess={() => {
                                                dispatch(fetchRetrieveTransport(transport.uid));
                                                transportListRefresher();
                                            }}
                                        />
                                    </Box>
                                </>
                            )}
                            {isBreak && canDeleteBreak && !child_transport && (
                                <Box ml={3}>
                                    <IconButton
                                        data-testid="delete-break-button"
                                        name="delete"
                                        onClick={deleteBreak}
                                        loading={isDeletingBreak}
                                        disabled={disabled}
                                        withConfirmation={true}
                                        confirmationMessage={t("components.deleteBreakAlert")}
                                        modalProps={{
                                            title: t("components.deleteBreak"),
                                            mainButton: {
                                                children: t("common.delete"),
                                            },
                                        }}
                                    />
                                </Box>
                            )}
                        </Flex>
                    </Flex>
                    <Flex mx={3} mb={3}>
                        {isBreak && (
                            <>
                                <MeansCardContent
                                    assignedToTrucker={assignedToTrucker}
                                    sentToTrucker={sentToTrucker}
                                    meansUpdatesAllowed={meansUpdatesAllowed}
                                    acknowledgedByTrucker={acknowledgedByTrucker}
                                    activities={activities}
                                    transport={transport}
                                    means={means}
                                    pricing={pricing}
                                    segmentsUidsToCharter={segmentsUidsToCharter}
                                    tripUid={segmentToUpdate.destination.trip?.uid as string} //here we have to use destination because the segment origin is the breaking and not the resuming and so does belong to the trip we want
                                    resumeIsDone={resumeIsDone}
                                    onChange={handleMutation}
                                    onSplitMeansTurnover={onSplitMeansTurnover}
                                />
                                <Box ml={6}>
                                    <Text variant="captionBold" mb={1}>
                                        {t("components.addressOfTheBreak")}
                                    </Text>
                                    <ActivityAddress
                                        onActivityAddressModalShown={openBreakAddressModal}
                                        updatesAllowed={addressUpdatesAllowed}
                                        refUpdateAllowed={!isPublicViewer}
                                        showReference={false}
                                        activity={
                                            {
                                                type: "bulkingBreakStart",
                                                siteType: "bulkingBreak",
                                                site: breakSite,
                                            } as unknown as Activity
                                        }
                                    />
                                </Box>
                                <Box ml={6}>
                                    <SiteDateAndTime
                                        site={breakSite}
                                        updatesAskedAllowed={meansUpdatesAllowed}
                                        updatesScheduledAllowed={meansUpdatesAllowed}
                                        onSchedulerHoursClick={openUpdatePlannedTimeModal}
                                        scheduledStartRange={
                                            segmentToBreakSite.scheduled_end_range
                                        }
                                        scheduledEndRange={
                                            segmentFromBreakSite.scheduled_start_range
                                        }
                                        statuses={transport.status_updates}
                                        dateLimits={dateLimits as DateLimits}
                                    />
                                </Box>
                            </>
                        )}
                    </Flex>
                    <HasFeatureFlag flagName="carbonfootprintiso">
                        {isBreak && (
                            <BreakActivityCarbonFootprintBanner
                                transport={transport}
                                breakSite={breakSite}
                            />
                        )}
                    </HasFeatureFlag>
                </Flex>
            </Card>
            {isBreakAddressModalOpen && (
                <UpdateAddressModal
                    onSubmit={updateBreakAddress}
                    initialAddress={breakSite?.address ?? null}
                    addressCategory="bulkingBreak"
                    onClose={closeBreakAddressModal}
                />
            )}
            {isUpdatePlannedTimeModalOpen && segmentFromBreakSite && segmentToBreakSite && (
                <UpdateBreakDateModal
                    onClose={closeUpdatePlannedTimeModal}
                    transport={transport}
                    segmentToBreakSite={segmentToBreakSite}
                    segmentFromBreakSite={segmentFromBreakSite}
                    beforeLaterStartDate={dateLimits?.scheduled.beforeLaterStartDate}
                    afterEarlierEndDate={dateLimits?.scheduled.afterEarlierEndDate}
                ></UpdateBreakDateModal>
            )}
        </>
    );

    async function updateBreakAddress(address: OriginalAddress) {
        if (breakSite) {
            const site: Partial<Site> & {extended_view?: boolean} = {
                //TODO: OriginalAddress is not compatible with TransportAddress
                address: address as any as TransportAddress,
                extended_view: extendedView,
            };
            dispatch(fetchUpdateSite(breakSite.uid, site));
        }
    }

    function handleMutation() {
        transportListRefresher();
    }

    function sendToTrucker() {
        setIsLoading(true);
        dispatch(
            fetchBulkSendTripTruckerNotification(
                [
                    isBreak
                        ? (segmentToUpdate.destination.trip?.uid as string)
                        : (segmentToUpdate.origin.trip?.uid as string),
                ],
                extendedView
            )
        )
            .then(() => {
                toast.success(t("common.updateSaved"));
            })
            .finally(() => {
                setIsLoading(false);
                transportListRefresher();
            });
    }

    async function deleteBreak() {
        if (breakSite) {
            setIsDeletingBreak(true);
            try {
                await dispatch(fetchDeleteTransportSites(transport.uid, [breakSite?.uid]));
                transportListRefresher();
            } catch (error) {
                Logger.error(error);
            } finally {
                setIsDeletingBreak(false);
            }
        }
    }

    async function sendToCarrier() {
        if (child_transport) {
            try {
                await dispatch(
                    fetchConfirmTransportDraftAssigned({
                        uid__in: [child_transport.uid],
                    })
                );
                toast.success(t("chartering.charterSendSuccess"));
                dispatch(fetchRetrieveTransport(transport.uid));
                transportListRefresher();
            } catch (error) {
                Logger.error(error);
                toast.error(t("chartering.charterError"));
            } finally {
                setIsLoading(false);
            }
        }
    }
}
