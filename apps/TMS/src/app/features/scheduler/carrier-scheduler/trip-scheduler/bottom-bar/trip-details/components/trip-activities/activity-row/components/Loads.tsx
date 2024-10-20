import {getLoadText, t} from "@dashdoc/web-core";
import {
    ClickableFlex,
    ClickableUpdateRegion,
    Icon,
    LoadingWheel,
    Modal,
    Text,
    toast,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import {cloneDeep} from "lodash";
import React, {useEffect, useState} from "react";

import {LoadFormModal} from "app/features/transport/load/load-form/LoadFormModal";
import {isTripActivityComplete, isTripActivityStarted} from "app/features/trip/trip.service";
import {DeliveryTrip, SimilarActivityWithTransportData} from "app/features/trip/trip.types";
import {
    fetchSetTransportRequiresWashing,
    fetchSetTransportIsMultipleCompartments,
    fetchUpdateDelivery,
    fetchRetrieveTransport,
} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getFullTransport} from "app/redux/selectors/entities";

import type {Delivery, Load, Transport} from "app/types/transport";

type LoadData = {
    delivery: DeliveryTrip;
    transportUid: string;
    load: Load;
};
type LoadEditionData =
    | (LoadData & {
          isEditing: true;
      })
    | {
          isEditing: false;
          transportUid: string;
      };
export function Loads({
    activity,
    isMergedActivity,
}: {
    activity: SimilarActivityWithTransportData;
    isMergedActivity: boolean;
}) {
    const [editingLoadData, setEditingLoadData] = useState<LoadEditionData | null>(null);
    const [isConfirmationModalDisplayed, openConfirmationModal, closeConfirmationModal] =
        useToggle();

    let loadsData: LoadData[] = [];
    [...(activity.deliveries_from || []), ...(activity.deliveries_to || [])].forEach(
        (delivery) => {
            delivery.planned_loads.map((load) =>
                loadsData.push({
                    delivery: delivery,
                    transportUid: activity.transports[0].uid,
                    load: load,
                })
            );
        }
    );

    const canBeEdited =
        !isMergedActivity &&
        (["loading", "unloading"] as Array<string | undefined>).includes(activity.category) &&
        !isTripActivityComplete(activity);

    const canAddLoad = loadsData.length === 0 || loadsData[0].load.category !== "rental";

    return (
        <>
            {loadsData.map((loadData, index) => (
                <ClickableUpdateRegion
                    key={index}
                    clickable={canBeEdited && loadData.delivery.origin_loads.length === 0}
                    onClick={() => setEditingLoadData({...loadData, isEditing: true})}
                    data-testid="edit-activity-load"
                >
                    <Text as={"li"} variant="subcaption" lineHeight={0}>
                        {getLoadText(loadData.load)}{" "}
                    </Text>
                </ClickableUpdateRegion>
            ))}

            {canBeEdited && canAddLoad && (
                <ClickableFlex hoverStyle={{bg: "grey.ultralight"}} onClick={handleAddLoad}>
                    <Icon
                        name="add"
                        mr={1}
                        color="grey.default"
                        scale={0.5}
                        data-testid="add-load"
                    />
                    <Text variant="subcaption" color="grey.default">
                        {t("components.addPlannedLoad")}
                    </Text>
                </ClickableFlex>
            )}

            {editingLoadData !== null &&
                (editingLoadData.isEditing ? (
                    <LoadModal
                        isEditing={true}
                        activity={activity}
                        load={editingLoadData.load}
                        delivery={editingLoadData.delivery}
                        transportUid={editingLoadData.transportUid}
                        onClose={() => setEditingLoadData(null)}
                    />
                ) : (
                    <LoadModal
                        isEditing={false}
                        activity={activity}
                        transportUid={editingLoadData.transportUid}
                        onClose={() => setEditingLoadData(null)}
                    />
                ))}
            {isConfirmationModalDisplayed && (
                <Modal
                    title={t("common.warning")}
                    mainButton={{
                        title: t("components.editPlannedLoad"),
                        onClick: () => {
                            addLoad();
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

    function handleAddLoad() {
        const needConfirmationBeforeEdit = isTripActivityStarted(activity);
        needConfirmationBeforeEdit ? openConfirmationModal() : addLoad();
    }
    function addLoad() {
        setEditingLoadData({
            transportUid: activity.transports[0].uid,
            isEditing: false,
        });
    }
}

function LoadModal({
    isEditing,
    load,
    activity,
    delivery,
    transportUid,
    onClose,
}: {
    isEditing: boolean;
    activity: SimilarActivityWithTransportData;
    delivery?: DeliveryTrip;
    transportUid: string;
    load?: Load;
    onClose: () => void;
}) {
    const dispatch = useDispatch();
    const editingLoadTransport: Transport | null = useSelector((state) =>
        state.entities.transports ? getFullTransport(state, transportUid) : null
    );
    const editingDeliveries =
        editingLoadTransport && editingLoadTransport.deliveries
            ? editingLoadTransport.deliveries.filter(
                  (d) => d.origin.uid === activity.uid || d.destination.uid === activity.uid
              )
            : [];
    useEffect(() => {
        dispatch(fetchRetrieveTransport(transportUid));
    }, [dispatch, transportUid]);

    if (editingDeliveries.some((d) => d.origin.real_end !== null)) {
        toast.error(t("loadEdition.notAllowedOnOngoingDelivery"));
        onClose();
    }

    return editingLoadTransport &&
        editingLoadTransport.deliveries &&
        editingLoadTransport.segments ? (
        <LoadFormModal
            transport={editingLoadTransport}
            deliveries={editingDeliveries}
            isEditing={isEditing}
            initialLoadData={load}
            isModifyingFinalInfo={false}
            onSubmit={handleLoadSubmit}
            onClose={onClose}
            onDelete={isEditing ? handleDeleteLoad : undefined}
            onChangeMultipleCompartments={onChangeMultipleCompartments}
            onChangeMultipleRounds={onChangeMultipleRounds}
            onChangeRequiresWashing={onChangeRequiresWashing}
            activityType={activity.category as "loading" | "unloading"}
        />
    ) : (
        <Modal
            title={""}
            mainButton={{
                children: t("common.save"),
                disabled: true,
            }}
            secondaryButton={{}}
            onClose={onClose}
        >
            <LoadingWheel />
        </Modal>
    );

    async function handleLoadSubmit(editedLoad: Load, editedDelivery: Delivery) {
        let loads = [];
        if (isEditing) {
            loads = cloneDeep(editedDelivery.planned_loads);
            const editedLoadIndex = loads.findIndex(
                ({uid}: {uid: string}) => uid === editedLoad.uid
            );
            loads.splice(editedLoadIndex, 1, editedLoad);
        } else {
            loads = [...editedDelivery.planned_loads, editedLoad];
        }

        await dispatch(
            fetchUpdateDelivery(editedDelivery.uid, {
                planned_loads: loads,
                multiple_rounds: editedDelivery.multiple_rounds,
            })
        );
    }

    function handleDeleteLoad() {
        if (!delivery || !load) {
            throw "cannot delete load";
        }
        let index = delivery.planned_loads.indexOf(load);

        delivery.planned_loads.splice(index, 1);
        dispatch(
            fetchUpdateDelivery(delivery.uid, {
                planned_loads: delivery.planned_loads,
                multiple_rounds: delivery.multiple_rounds,
            })
        );
    }

    async function onChangeRequiresWashing(value: boolean) {
        if (value !== undefined && value !== null) {
            await dispatch(fetchSetTransportRequiresWashing(transportUid, value));
        }
    }

    async function onChangeMultipleCompartments(value: boolean) {
        if (
            editingLoadTransport &&
            value !== undefined &&
            value !== null &&
            editingLoadTransport.is_multiple_compartments !== value
        ) {
            await dispatch(fetchSetTransportIsMultipleCompartments(transportUid, value));
        }
    }

    function onChangeMultipleRounds(editedDelivery: Delivery, value: boolean) {
        editedDelivery.multiple_rounds = value;
    }
}
