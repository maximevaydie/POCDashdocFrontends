import {apiService, getErrorMessage, getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Modal, Text, toast} from "@dashdoc/web-ui";
import {ActivityType, useToggle} from "dashdoc-utils";
import {cloneDeep} from "lodash";
import React, {FunctionComponent, useMemo, useState} from "react";

import {
    fetchRetrieveTransport,
    fetchSetTransportIsMultipleCompartments,
    fetchSetTransportRequiresWashing,
    fetchUpdateDelivery,
} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {activityService} from "app/services/transport/activity.service";
import {transportViewerService} from "app/services/transport/transportViewer.service";

import {LoadFormModal} from "../../../../load/load-form/LoadFormModal";

import {ActivityLoad} from "./activity-load";
import ActivityLoadAddButton from "./activity-load-add-button";
import {
    AddPlannedLoadData,
    AmendAddLoadData,
    AmendEditLoadData,
    EditPlannedLoadData,
    SubmitLoadData,
} from "./load-action-types";
import {MultipleRoundsLoads} from "./multiple-rounds-loads";
import {getDeliveryPlannedAndRealLoads} from "./utils";

import type {Activity, Delivery, Load, Transport} from "app/types/transport";

type ActivityLoadsProps = {
    activity: Activity;
    transport: Transport;
    realLoadsUpdatesAllowed: boolean;
    plannedLoadsUpdatesAllowed: boolean;
    loadCardBackground?: string;
};

export const ActivityLoads: FunctionComponent<ActivityLoadsProps> = ({
    activity,
    transport,
    realLoadsUpdatesAllowed,
    plannedLoadsUpdatesAllowed,
    loadCardBackground,
}) => {
    const dispatch = useDispatch();

    const [submitLoadData, setSubmitLoadData] = useState<SubmitLoadData>();
    const [isConfirmationModalDisplayed, openConfirmationModal, closeConfirmationModal] =
        useToggle();

    const {type} = activity;

    const plannedAndRealLoads =
        type === "loading"
            ? activity.deliveries.map((d) => {
                  return {
                      loads: getDeliveryPlannedAndRealLoads(d.planned_loads, d.origin_loads || []),
                      delivery: d,
                      extractedWeight:
                          d.origin_loads?.length === 1 ? d.origin_extracted_weight : null,
                      weightExtractionInProgress:
                          d.origin_loads?.length === 1
                              ? d.origin_weight_extraction_in_progress
                              : false,
                  };
              })
            : type === "unloading"
              ? activity.deliveries.map((d) => {
                    return {
                        loads: getDeliveryPlannedAndRealLoads(
                            d.planned_loads,
                            d.destination_loads || []
                        ),
                        delivery: d,
                        extractedWeight:
                            d.destination_loads?.length === 1
                                ? d.destination_extracted_weight
                                : null,
                        weightExtractionInProgress:
                            d.destination_loads?.length === 1
                                ? d.destination_weight_extraction_in_progress
                                : false,
                    };
                })
              : [];

    const canAmendAddLoadOnDestination =
        realLoadsUpdatesAllowed &&
        activity.deliveries?.[0]?.destination_loads?.[0]?.category !== "rental";
    const canAmendAddLoadOnOrigin =
        realLoadsUpdatesAllowed &&
        activity.deliveries?.[0]?.origin_loads?.[0]?.category !== "rental";

    const company = useSelector(getConnectedCompany);
    const canSeeWeightExtraction =
        transportViewerService.isCarrierOf(transport, company?.pk) ||
        transportViewerService.isCreatorOf(transport, company?.pk);

    // Both of these functions are for type-checking
    const submitIsEditing = (
        submitLoadData: SubmitLoadData
    ): submitLoadData is EditPlannedLoadData | AmendEditLoadData => {
        return ["AmendEditLoadData", "EditPlannedLoadData"].some(
            (type) => type === submitLoadData.type
        );
    };

    const submitIsAdding = (
        submitLoadData: SubmitLoadData
    ): submitLoadData is AddPlannedLoadData | AmendAddLoadData => {
        return (
            submitLoadData.type === "AmendAddLoadData" ||
            submitLoadData.type === "AddPlannedLoadData"
        );
    };

    const submitAmendEditLoadData = async (
        {siteType, roundId}: AmendEditLoadData,
        load: Load,
        delivery: Delivery
    ) => {
        try {
            await apiService.Deliveries.amendEditLoad(delivery.uid, {
                uid: load.uid,
                load: load,
                type: siteType === "loading" ? "origin" : "destination",
                round_id: delivery.multiple_rounds ? roundId : undefined,
            });
            dispatch(fetchRetrieveTransport(transport.uid));
        } catch (error) {
            const errorMessage = await getErrorMessage(error, null);
            toast.error(errorMessage);
        }
    };

    const submitAmendAddLoadData = async (
        {siteType, roundId, uid}: AmendAddLoadData,
        load: Load,
        delivery: Delivery
    ) => {
        if (uid) {
            load.uid = uid;
        }
        try {
            await apiService.Deliveries.amendAddLoad(delivery.uid, {
                load: load,
                type: siteType === "loading" ? "origin" : "destination",
                roundId: delivery.multiple_rounds ? roundId : undefined,
            });
            dispatch(fetchRetrieveTransport(transport.uid));
        } catch (error) {
            const errorMessage = await getErrorMessage(error, null);
            toast.error(errorMessage);
        }
    };

    const submitAddPlannedLoadData = async (
        _: AddPlannedLoadData,
        load: Load,
        delivery: Delivery
    ) => {
        const loads = [...delivery.planned_loads, load];

        await dispatch(
            fetchUpdateDelivery(delivery.uid, {
                planned_loads: loads,
                multiple_rounds: delivery.multiple_rounds,
            })
        );
    };

    const submitEditPlannedLoadData = async (
        _: EditPlannedLoadData,
        load: Load,
        delivery: Delivery
    ) => {
        const loads = cloneDeep(delivery.planned_loads);
        const editedLoadIndex = loads.findIndex(({uid}: {uid: string}) => uid === load.uid);
        loads.splice(editedLoadIndex, 1, load);

        await dispatch(
            fetchUpdateDelivery(delivery.uid, {
                planned_loads: loads,
                multiple_rounds: delivery.multiple_rounds,
            })
        );
    };

    const handleLoadSubmit = async (load: Load, delivery: Delivery) => {
        if (submitLoadData === undefined) {
            return;
        }
        if (submitLoadData.type === "AddPlannedLoadData") {
            return submitAddPlannedLoadData(submitLoadData, load, delivery);
        } else if (submitLoadData.type === "EditPlannedLoadData") {
            return submitEditPlannedLoadData(submitLoadData, load, delivery);
        } else if (submitLoadData.type === "AmendAddLoadData") {
            return submitAmendAddLoadData(submitLoadData, load, delivery);
        } else if (submitLoadData.type === "AmendEditLoadData") {
            return submitAmendEditLoadData(submitLoadData, load, delivery);
        }
    };

    const onChangeRequiresWashing = async (value: boolean) => {
        if (value !== undefined && value !== null) {
            await dispatch(fetchSetTransportRequiresWashing(transport.uid, value));
        }
    };

    const onChangeMultipleCompartments = async (value: boolean) => {
        if (
            value !== undefined &&
            value !== null &&
            transport.is_multiple_compartments !== value
        ) {
            await dispatch(fetchSetTransportIsMultipleCompartments(transport.uid, value));
        }
    };

    const onChangeMultipleRounds = (delivery: Delivery, value: boolean) => {
        delivery.multiple_rounds = value;
    };

    const handleMultipleRoundsLoadClick = (
        delivery: Delivery,
        load: Load,
        siteType: ActivityType
    ) => {
        if (activityService.isActivityComplete(activity)) {
            setSubmitLoadData({
                type: "AmendEditLoadData",
                siteType,
                roundId: load.round_id,
                editedLoad: load,
                editedDelivery: delivery,
            });
        } else {
            setSubmitLoadData({
                type: "EditPlannedLoadData",
                editedLoad: load,
                editedDelivery: delivery,
            });
        }
    };

    const handlePlannedAndRealLoadClick = (
        delivery: Delivery,
        plannedLoad: Load,
        realLoad: Load,
        siteType: ActivityType
    ) => {
        if (activityService.isActivityComplete(activity)) {
            if (realLoad) {
                setSubmitLoadData({
                    type: "AmendEditLoadData",
                    siteType,
                    editedLoad: realLoad,
                    editedDelivery: delivery,
                });
            } else {
                // If there is no real load, there is a planned load, and
                // we want to create a real load linked to that planned load
                setSubmitLoadData({
                    type: "AmendAddLoadData",
                    siteType: siteType,
                    activity,
                    uid: plannedLoad.uid,
                    plannedLoad: plannedLoad,
                });
            }
        } else {
            setSubmitLoadData({
                type: "EditPlannedLoadData",
                editedLoad: plannedLoad,
                editedDelivery: delivery,
            });
        }
    };

    const closeLoadModal = () => {
        setSubmitLoadData(undefined);
    };

    const handleDeleteLoad = () => {
        // @ts-ignore
        if (!submitIsEditing(submitLoadData)) {
            throw "No delivery or no load";
        }

        const {editedDelivery, editedLoad} = submitLoadData;
        let index = editedDelivery.planned_loads.indexOf(editedLoad);

        editedDelivery.planned_loads.splice(index, 1);
        dispatch(
            fetchUpdateDelivery(editedDelivery.uid, {
                planned_loads: editedDelivery.planned_loads,
                multiple_rounds: false,
            })
        );
    };

    const handleAddPlannedLoadModalShown = () => {
        setSubmitLoadData({type: "AddPlannedLoadData", activity});
    };

    const handleAmendAddLoadModalShown = (
        activity: Activity,
        siteType: ActivityType,
        roundId?: number
    ) => {
        setSubmitLoadData({
            type: "AmendAddLoadData",
            siteType: siteType,
            activity,
            roundId: roundId,
        });
    };

    const editedDelivery =
        submitLoadData && "editedDelivery" in submitLoadData
            ? submitLoadData.editedDelivery
            : null;

    const editedDeliveries = useMemo(() => {
        if (editedDelivery) {
            return [editedDelivery];
        }
        return [];
    }, [editedDelivery]);

    return (
        <>
            {!activity.isMultipleRounds && (
                <>
                    {plannedAndRealLoads.map((loadWithDelivery) =>
                        (loadWithDelivery.loads || []).map((plannedAndRealLoad, index) => (
                            <ActivityLoad
                                key={index}
                                plannedLoad={plannedAndRealLoad.planned}
                                realLoad={plannedAndRealLoad.real}
                                clickable={
                                    (plannedLoadsUpdatesAllowed && !!plannedAndRealLoad.planned) ||
                                    realLoadsUpdatesAllowed
                                }
                                onClick={() =>
                                    handlePlannedAndRealLoadClick(
                                        loadWithDelivery.delivery,
                                        plannedAndRealLoad.planned,
                                        plannedAndRealLoad.real,
                                        type
                                    )
                                }
                                extractedWeight={
                                    canSeeWeightExtraction
                                        ? loadWithDelivery.extractedWeight
                                        : undefined
                                }
                                weightExtractionInProgress={
                                    canSeeWeightExtraction
                                        ? loadWithDelivery.weightExtractionInProgress
                                        : undefined
                                }
                                background={loadCardBackground}
                                activityType={type}
                                deliveryIsCancelled={
                                    loadWithDelivery.delivery.is_cancelled &&
                                    !activity.isCancelled &&
                                    transport.global_status !== "cancelled"
                                }
                                dataTestId={`${
                                    type === "loading" ? "origin" : "destination"
                                }_load-${activity.index}-${index}`}
                            />
                        ))
                    )}
                    {plannedLoadsUpdatesAllowed &&
                        activity.deliveries?.[0]?.planned_loads?.[0]?.category !== "rental" && (
                            <ActivityLoadAddButton
                                onAddLoad={
                                    activity.status === "on_site"
                                        ? openConfirmationModal
                                        : handleAddPlannedLoadModalShown
                                }
                                data-testid={`planned_load-add-${activity.index}`}
                                text={t("components.addPlannedLoad")}
                            />
                        )}
                    {type === "loading" && canAmendAddLoadOnOrigin && (
                        <ActivityLoadAddButton
                            onAddLoad={() => handleAmendAddLoadModalShown(activity, "loading")}
                            data-testid={`origin_real_load-add-${activity.index}`}
                            text={t("components.addOriginLoad")}
                        />
                    )}
                    {type === "unloading" && canAmendAddLoadOnDestination && (
                        <ActivityLoadAddButton
                            onAddLoad={() => handleAmendAddLoadModalShown(activity, "unloading")}
                            data-testid={`destination_real_load-add-${activity.index}`}
                            text={t("components.addDestinationLoad")}
                        />
                    )}
                </>
            )}

            {activity.isMultipleRounds && activity.siteType !== "bulkingBreak" && (
                <>
                    {(!!activity.deliveries[0].planned_loads?.length ||
                        !!activity.deliveries[0].destination_loads?.length) && (
                        <MultipleRoundsLoads
                            activity={activity}
                            realLoadsUpdatesAllowed={realLoadsUpdatesAllowed}
                            onLoadClick={handleMultipleRoundsLoadClick}
                            onEmptyLoadClick={(round_id: number) =>
                                handleAmendAddLoadModalShown(activity, type, round_id)
                            }
                            background={loadCardBackground}
                            clickable={
                                plannedLoadsUpdatesAllowed &&
                                !!activity.deliveries[0].planned_loads?.length
                            }
                            canSeeWeightExtraction={canSeeWeightExtraction}
                        />
                    )}

                    {transport.status === "done" && (
                        <ActivityLoadAddButton
                            onAddLoad={() => handleAmendAddLoadModalShown(activity, type)}
                            data-testid={`round-add-${activity.index}`}
                            text={t("components.addRoundLoad")}
                        />
                    )}
                </>
            )}

            {submitLoadData && submitIsEditing(submitLoadData) && (
                <>
                    <LoadFormModal
                        transport={transport}
                        deliveries={editedDeliveries}
                        isEditing={true}
                        initialLoadData={submitLoadData.editedLoad}
                        isModifyingFinalInfo={activityService.isActivityComplete(activity)}
                        onSubmit={handleLoadSubmit}
                        onClose={closeLoadModal}
                        onDelete={handleDeleteLoad}
                        onChangeMultipleCompartments={onChangeMultipleCompartments}
                        onChangeMultipleRounds={onChangeMultipleRounds}
                        onChangeRequiresWashing={onChangeRequiresWashing}
                        activityType={type}
                    />
                </>
            )}

            {submitLoadData && submitIsAdding(submitLoadData) && (
                <>
                    <LoadFormModal
                        transport={transport}
                        deliveries={submitLoadData.activity.deliveries}
                        isModifyingFinalInfo={activityService.isActivityComplete(activity)}
                        isEditing={false}
                        initialLoadData={
                            "plannedLoad" in submitLoadData
                                ? submitLoadData.plannedLoad
                                : undefined
                        }
                        onSubmit={handleLoadSubmit}
                        onClose={closeLoadModal}
                        onChangeMultipleCompartments={onChangeMultipleCompartments}
                        onChangeMultipleRounds={onChangeMultipleRounds}
                        onChangeRequiresWashing={onChangeRequiresWashing}
                        activityType={type}
                    />
                </>
            )}
            {isConfirmationModalDisplayed && (
                <Modal
                    title={t("common.warning")}
                    mainButton={{
                        title: t("components.editPlannedLoad"),
                        onClick: () => {
                            handleAddPlannedLoadModalShown();
                            closeConfirmationModal();
                        },
                    }}
                    secondaryButton={{
                        title: t("common.cancel"),
                        onClick: closeConfirmationModal,
                    }}
                >
                    <Text mb={2}>{t("components.editLoadsWhileOnSite")}</Text>
                </Modal>
            )}
        </>
    );
};
