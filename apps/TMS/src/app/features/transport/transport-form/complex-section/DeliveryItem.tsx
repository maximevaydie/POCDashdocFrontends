import {SuggestedAddress} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {ErrorMessage, Badge, Flex, IconButton, theme} from "@dashdoc/web-ui";
import {useFormikContext} from "formik";
import React, {useRef, useEffect} from "react";

import {complexTransportForm} from "app/features/transport/transport-form/complex-section/complexTransportForm.service";
import {useSmartSuggestAddresses} from "app/features/transport/transport-form/transport-form-smart-suggestions";

import {ActivityFormPanel} from "../activity/ActivityFormPanel";
import {
    FormLoad,
    TransportFormActivity,
    TransportFormDelivery,
    TransportFormValues,
} from "../transport-form.types";

import {ActivityItem} from "./ActivityItem";
import {DeliveryLoads} from "./DeliveryLoads";

interface DeliveryItemProps {
    delivery: TransportFormDelivery;
    index: number;
    error: string | object | Array<object> | null;
    onUpdate: (newDelivery: TransportFormDelivery) => void;
    onDelete: (() => void) | undefined;
    testId?: string;
    originAddressesSuggestedByShipper: SuggestedAddress[];
}

export function DeliveryItem({
    delivery,
    index,
    error,
    onUpdate,
    onDelete,
    testId,
    originAddressesSuggestedByShipper,
}: DeliveryItemProps) {
    const [editingActivity, setEditingActivity] = React.useState<"loading" | "unloading" | null>(
        null
    );

    const {values, setFieldValue} = useFormikContext<TransportFormValues>();
    const {activities} = values;

    const loading = activities[delivery.loadingUid];
    const unloading = activities[delivery.unloadingUid];

    const {
        automaticOriginAddresses,
        setAutomaticOriginAddresses,
        automaticDestinationAddresses,
        fillSuggestedAddresses,
    } = useSmartSuggestAddresses();

    useEffect(() => {
        setAutomaticOriginAddresses(originAddressesSuggestedByShipper);
    }, [originAddressesSuggestedByShipper]);

    useEffect(() => {
        const address = loading.address;

        if (address && "created_by" in address) {
            fillSuggestedAddresses(
                "origin_address",
                address.original ?? address.pk,
                address.name ?? ""
            );
        }
    }, [activities, delivery.loadingUid, loading.address?.pk]);

    useEffect(() => {
        const address = unloading.address;

        if (address && "created_by" in address) {
            // If the address is a copy (original is not null),
            // it means it comes from a duplicated transport or a transport template.
            // In that case origin addresses are suggested thanks to originAddressesSuggestedByShipper,
            // and we do not want to override it here.
            if (!address.original) {
                fillSuggestedAddresses("destination_address", address.pk, address.name ?? "");
            }
        }
    }, [activities, delivery.unloadingUid, unloading.address?.pk]);

    const onEditLoads = (loads: Array<FormLoad>) => {
        onUpdate({...delivery, loads});
    };

    const onEditLoading = () => {
        setEditingActivity("loading");
    };

    const onEditUnloading = () => {
        setEditingActivity("unloading");
    };

    const onEditActivity = (newActivity: TransportFormActivity) => {
        if (editingActivity === "loading") {
            onUpdate({...delivery, loadingUid: newActivity.uid});
        } else {
            onUpdate({...delivery, unloadingUid: newActivity.uid});
        }

        setFieldValue("activities", {
            ...values.activities,
            [newActivity.uid]: newActivity,
        });

        setEditingActivity(null);
    };

    const isInconsistent = loading.slots?.[0]?.start > unloading.slots?.[0]?.start;

    const color = complexTransportForm.getColorByDeliveryIndex(index);

    const loadsRef = useRef<{addLoad: () => void}>(null);

    return (
        <Flex
            flexDirection="column"
            border="1px solid"
            borderColor="grey.light"
            boxShadow="0px 1px 4px 0px #27333F1A"
            style={{gap: 12}}
            paddingY={3}
            paddingX={4}
            data-testid={testId}
        >
            <Flex flex={1} style={{gap: 8}}>
                <Flex flex={1} flexDirection="column" style={{gap: theme.space[1]}}>
                    <ActivityItem
                        activity={loading}
                        isInconsistentDate={isInconsistent}
                        onEdit={onEditLoading}
                        testId={`transport-form-delivery-${index}-loading`}
                    />
                    {typeof error === "string" && <ErrorMessage error={error} />}
                </Flex>

                <ActivityItem
                    activity={unloading}
                    isInconsistentDate={isInconsistent}
                    onEdit={onEditUnloading}
                    testId={`transport-form-delivery-${index}-unloading`}
                />

                <Flex height="fit-content" alignItems="center">
                    <Badge
                        size="small"
                        height="fit-content"
                        mr={1}
                        variant="none"
                        backgroundColor={`${color}.ultralight`}
                        color={`${color}.dark`}
                        shape="squared"
                    >
                        {t("common.pickupDelivery")}
                    </Badge>

                    <IconButton
                        name="delete"
                        onClick={onDelete}
                        flexGrow={0}
                        fontSize={2}
                        width={12}
                        height={12}
                        style={{visibility: !onDelete ? "hidden" : "visible"}}
                        withConfirmation={Boolean(
                            delivery.loads.length || loading.address || unloading.address
                        )}
                        confirmationMessage={t(
                            "transportsForm.deleteDeliveryConfirmation.message"
                        )}
                        modalProps={{
                            title: t("transportsForm.deleteDeliveryConfirmation.title"),
                            mainButton: {
                                children: t("common.delete"),
                            },
                        }}
                    />
                </Flex>
            </Flex>
            <DeliveryLoads
                loads={delivery.loads}
                onEdit={onEditLoads}
                delivery={delivery}
                deliveryIndex={index}
                ref={loadsRef}
                error={Array.isArray(error) && error[index] ? error[index].loads : undefined}
            />
            {editingActivity && (
                <ActivityFormPanel
                    key={editingActivity}
                    activity={editingActivity === "loading" ? loading : unloading}
                    activityType={editingActivity}
                    onSubmit={onEditActivity}
                    suggestedAddresses={
                        editingActivity === "loading"
                            ? automaticOriginAddresses
                            : automaticDestinationAddresses
                    }
                    onClose={() => setEditingActivity(null)}
                    minDate={loading.slots?.[0]?.start}
                    maxDate={unloading.slots?.[0]?.start}
                    secondaryButton={getSecondaryButton()}
                />
            )}
        </Flex>
    );

    function getSecondaryButton() {
        if (editingActivity === "loading" && !loading.address && !unloading.address) {
            return {
                label: t("transportsForm.activityPanel.saveAndAddDelivery"),
                onClick: () => setEditingActivity("unloading"),
            };
        }
        if (editingActivity === "unloading" && !unloading.address && !delivery.loads.length) {
            return {
                label: t("transportsForm.activityPanel.saveAndAddLoad"),
                onClick: () => loadsRef.current?.addLoad(),
            };
        }
        return undefined;
    }
}
