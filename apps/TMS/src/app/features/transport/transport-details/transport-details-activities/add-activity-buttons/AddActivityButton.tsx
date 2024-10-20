import {guid} from "@dashdoc/core";
import {
    apiService,
    getConnectedCompanyId,
    getErrorMessageFromServerError,
    useFeatureFlag,
    useSelector,
} from "@dashdoc/web-common";
import {Button, Flex, Icon, Modal, Popover, toast} from "@dashdoc/web-ui";
import {translate as t, useToggle} from "dashdoc-utils";
import {normalize} from "normalizr";
import React, {useCallback, useState} from "react";

import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {useExtendedView} from "app/hooks/useExtendedView";
import {fetchAddTransportSite, fetchBreakSegment} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {transportSchema} from "app/redux/schemas";
import {transportRightService} from "app/services/transport";

import {BreakModal, BreakModalProps} from "../means/BreakModal";

import {AddOptionItem} from "./AddButtonItem";
import {AddPickupDeliveryButton} from "./AddPickupDeliveryButton";

import type {Segment, Site, Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    segmentToBreak?: Segment;
    canAddBreak: boolean;
    canAddLoadingActivity: boolean;
    canAddUnloadingActivity: boolean;
    siteBeforeWhichToInsertNewActivity: Site | null;
};

export function AddActivityButton(props: Props) {
    const dispatch = useDispatch();
    const transportListRefresher = useRefreshTransportLists();
    const {extendedView} = useExtendedView();
    const companyPk = useSelector(getConnectedCompanyId);
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const hasAddBreakToTripEnabled = useFeatureFlag("addBreakToTrip");

    const {
        transport,
        segmentToBreak,
        canAddBreak,
        canAddLoadingActivity,
        canAddUnloadingActivity,
        siteBeforeWhichToInsertNewActivity,
    } = props;

    const [key, setKey] = useState("_");
    const clearPopoverState = () => setKey(guid());
    const [isCreateBreakModalOpen, openCreateBreakModal, closeCreateBreakModal] = useToggle();
    const [
        isCannotAlterTransportModalOpen,
        openCannotAlterTransportModal,
        closeCannotAlterTransportModal,
    ] = useToggle();

    const [isAddingBreak, setIsAddingBreak] = useState(false);
    const addBreak: BreakModalProps["onSubmit"] = async (selectedBreakAddress) => {
        setIsAddingBreak(true);
        try {
            if (hasAddBreakToTripEnabled) {
                const body = {
                    trip_uid: segmentToBreak?.destination.trip?.uid,
                    activity_after_break_uid: segmentToBreak?.destination.uid,
                    break_address_pk: selectedBreakAddress ? selectedBreakAddress.pk : null,
                    extended_view: extendedView,
                };
                try {
                    const response = await apiService.post(
                        `/transports/${transport.uid}/add-break/`,
                        body,
                        {
                            apiVersion: "web",
                        }
                    );
                    dispatch({
                        type: "UPDATE_ENTITIES_SUCCESS",
                        response: normalize(response, transportSchema),
                    });
                    toast.success(t("segments.segmentBreakAdded"));
                } catch (error) {
                    toast.error(await getErrorMessageFromServerError(error));
                }
            } else {
                await dispatch(
                    fetchBreakSegment(
                        // @ts-ignore
                        segmentToBreak?.uid,
                        {address: selectedBreakAddress},
                        null,
                        null,
                        [],
                        false,
                        null,
                        extendedView
                    )
                );
            }
            closeCreateBreakModal();
            transportListRefresher();
        } finally {
            setIsAddingBreak(false);
        }
    };

    const [isAddingActivity, setIsAddingActivity] = useState(false);
    const addActivity = useCallback(
        async (category: "loading" | "unloading") => {
            setIsAddingActivity(true);
            try {
                await dispatch(
                    fetchAddTransportSite(
                        transport.uid,
                        category,
                        siteBeforeWhichToInsertNewActivity?.uid ?? null
                    )
                );
                clearPopoverState();
            } finally {
                setIsAddingActivity(false);
            }
        },
        [dispatch, siteBeforeWhichToInsertNewActivity]
    );

    const canAddDelivery = transportRightService.canAddDelivery(
        transport,
        companyPk ?? undefined,
        hasInvoiceEntityEnabled
    );

    return (
        <>
            <Popover placement="right" key={key}>
                <Popover.Trigger width="fit-content">
                    <Button
                        variant="secondary"
                        data-testid="add-activity-button"
                        width="2.3em"
                        height="2.3em"
                        borderRadius="100%"
                        px={0}
                        py={0}
                    >
                        <Icon
                            name="add"
                            fontFamily="monospace"
                            color="grey.dark"
                            scale={[0.8, 0.8]}
                        />
                    </Button>
                </Popover.Trigger>
                <Popover.Content>
                    <Flex flexDirection="column" justifyContent="center">
                        {canAddBreak && (
                            <AddOptionItem
                                icon="houseSimple"
                                label={t("components.addBulkingBreak")}
                                onClick={
                                    segmentToBreak?.child_transport
                                        ? openCannotAlterTransportModal
                                        : openCreateBreakModal
                                }
                                testId="add-break-button"
                                disabled={isAddingActivity}
                                isLast={
                                    !canAddDelivery &&
                                    !canAddUnloadingActivity &&
                                    !canAddLoadingActivity
                                }
                            />
                        )}
                        {canAddLoadingActivity && (
                            <AddOptionItem
                                icon="arrowUpFull"
                                label={t("transportsForm.newLoading")}
                                onClick={
                                    segmentToBreak?.child_transport
                                        ? openCannotAlterTransportModal
                                        : addActivity.bind(undefined, "loading")
                                }
                                testId="add-loading-activity"
                                disabled={isAddingActivity}
                                isLast={!canAddDelivery && !canAddUnloadingActivity}
                            />
                        )}
                        {canAddUnloadingActivity && (
                            <AddOptionItem
                                icon="arrowDownFull"
                                label={t("transportsForm.newUnloading")}
                                onClick={
                                    segmentToBreak?.child_transport
                                        ? openCannotAlterTransportModal
                                        : addActivity.bind(undefined, "unloading")
                                }
                                testId="add-unloading-activity"
                                disabled={isAddingActivity}
                                isLast={!canAddDelivery}
                            />
                        )}
                        {!segmentToBreak?.child_transport && canAddDelivery && (
                            <AddPickupDeliveryButton
                                transport={transport}
                                onActivityAdded={() => {
                                    clearPopoverState();
                                }}
                                activityUidBeforeWhichInsertNewActivities={
                                    siteBeforeWhichToInsertNewActivity?.uid
                                }
                                isAddingActivity={isAddingActivity}
                                setIsAddingActivity={setIsAddingActivity}
                            />
                        )}
                    </Flex>
                </Popover.Content>
            </Popover>

            {isCreateBreakModalOpen && (
                <BreakModal
                    isLoading={isAddingBreak}
                    onSubmit={(selectedBreakAddress) => {
                        clearPopoverState();
                        addBreak(selectedBreakAddress);
                    }}
                    onClose={() => {
                        closeCreateBreakModal();
                        clearPopoverState();
                    }}
                    breakingPreparedTrip={
                        siteBeforeWhichToInsertNewActivity?.trip?.is_prepared
                            ? siteBeforeWhichToInsertNewActivity?.trip
                            : undefined
                    }
                />
            )}
            {isCannotAlterTransportModalOpen && (
                <Modal
                    title={t("chartering.cannotAlterCharter.title")}
                    mainButton={{
                        onClick: closeCannotAlterTransportModal,
                        children: t("common.confirmUnderstanding"),
                    }}
                    secondaryButton={null}
                    onClose={closeCannotAlterTransportModal}
                >
                    {t("chartering.cannotAlterCharter")}
                </Modal>
            )}
        </>
    );
}
