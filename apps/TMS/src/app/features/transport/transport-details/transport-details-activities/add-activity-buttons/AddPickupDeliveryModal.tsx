import {AddressSelect, useDispatch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, Badge, Modal, Text, Icon, Box} from "@dashdoc/web-ui";
import {OriginalAddress} from "dashdoc-utils";
import React, {useState} from "react";

import {complexTransportForm} from "app/features/transport/transport-form/complex-section/complexTransportForm.service";
import {fetchAddTransportDelivery} from "app/redux/actions";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    onClose: () => void;
    onActivityAdded?: () => void;
    activityUidBeforeWhichInsertNewActivities?: string;
    isAddingActivity: boolean;
    setIsAddingActivity: (value: boolean) => void;
};
export function AddPickupDeliveryModal({
    transport,
    onClose,
    onActivityAdded,
    activityUidBeforeWhichInsertNewActivities,
    isAddingActivity,
    setIsAddingActivity,
}: Props) {
    const [loadingAddress, setLoadingAddress] = useState<OriginalAddress | undefined>();
    const [unloadingAddress, setUnloadingAddress] = useState<OriginalAddress | undefined>();
    const [error, setError] = useState(false);

    const dispatch = useDispatch();

    const deliveryColor = complexTransportForm.getColorByDeliveryIndex(
        transport.deliveries.length
    );

    return (
        <Modal
            title={t("transportsForm.addPickupDelivery")}
            onClose={onClose}
            mainButton={{
                ["data-testid"]: "add-pickup-delivery-submit",
                type: "button",
                disabled: isAddingActivity,
                loading: isAddingActivity,
                children: t("common.save"),
                onClick: handleSubmit,
            }}
            secondaryButton={{}}
            size="large"
            data-testid="add-pickup-delivery-modal"
        >
            <Flex alignItems="center" mb={3}>
                <Text mr={2}>{t("transport.addPickupDelivery.modalContent")}</Text>
                <Badge
                    variant="none"
                    backgroundColor={`${deliveryColor}.ultralight`}
                    borderColor={`${deliveryColor}.dark`}
                    shape="squared"
                >
                    {t("common.pickupDelivery")}
                </Badge>
            </Flex>
            <Flex>
                <Box width="45%">
                    <AddressSelect
                        label={t("common.pickupAddress")}
                        data-testid="select-loading-address"
                        categories={["origin"]}
                        value={loadingAddress}
                        onChange={setLoadingAddress}
                        isDisabled={isAddingActivity}
                        required
                        error={error && !loadingAddress ? t("common.mandatoryField") : false}
                    />
                </Box>
                <Icon name="thickArrowRight" mx={2} />
                <Box width="45%">
                    <AddressSelect
                        label={t("common.deliveryAddress")}
                        data-testid="select-unloading-address"
                        categories={["destination"]}
                        value={unloadingAddress}
                        onChange={setUnloadingAddress}
                        isDisabled={isAddingActivity}
                        required
                        error={error && !unloadingAddress ? t("common.mandatoryField") : false}
                    />
                </Box>
            </Flex>
        </Modal>
    );

    async function handleSubmit() {
        if (!loadingAddress || !unloadingAddress) {
            setError(true);
            return;
        }
        setIsAddingActivity(true);

        try {
            dispatch(
                await fetchAddTransportDelivery({
                    transport_uid: transport.uid,
                    origin_address: {pk: loadingAddress.pk},
                    destination_address: {pk: unloadingAddress.pk},
                    site_uid_before_which_to_insert_new_sites:
                        activityUidBeforeWhichInsertNewActivities ?? null,
                })
            );
            onClose();
            onActivityAdded?.();
        } finally {
            setIsAddingActivity(false);
        }
    }
}
