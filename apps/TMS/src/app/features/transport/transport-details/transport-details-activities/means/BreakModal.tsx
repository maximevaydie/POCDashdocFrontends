import {addressService} from "@dashdoc/web-common";
import {AddressSelect} from "@dashdoc/web-common";
import {AddressModal} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, IconLink, Modal, Text} from "@dashdoc/web-ui";
import {OriginalAddress, useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {Site} from "app/types/transport";

export type BreakModalProps = {
    isLoading: boolean;
    breakingPreparedTrip?: Site["trip"];
    onSubmit: (selectedBreakAddress: OriginalAddress | undefined) => void;
    onClose: () => void;
};

export function BreakModal({isLoading, breakingPreparedTrip, onSubmit, onClose}: BreakModalProps) {
    // nosemgrep
    const [selectedBreakAddress, setSelectedBreakAddress] = useState<
        OriginalAddress | undefined
    >();
    const [isNewAddressModalOpen, openNewAddressModal, closeNewAddressModal] = useToggle();

    const onSave = () => {
        onSubmit(selectedBreakAddress);
    };

    return (
        <Modal
            data-testid="break-modal"
            id="break-modal"
            title={t("components.addBulkingBreak")}
            mainButton={{
                children: t("components.addBulkingBreak"),
                onClick: onSave,
                loading: isLoading,
                ["data-testid"]: "break-modal-save-button",
            }}
            onClose={onClose}
        >
            <Box mt={4}>
                <AddressSelect
                    key={`address-${selectedBreakAddress?.name}`}
                    label={t("components.addressOfTheBreak")}
                    data-testid="update-address-modal-select"
                    categories={["origin", "destination", "carrier"]}
                    value={selectedBreakAddress}
                    onChange={setSelectedBreakAddress}
                    isDisabled={isLoading}
                />
                <Flex justifyContent="flex-end" pt={2}>
                    <IconLink
                        text={t("transportsForm.addAddress")}
                        iconName="add"
                        onClick={openNewAddressModal}
                        data-testid="add-address-link"
                    />
                </Flex>
                {breakingPreparedTrip && (
                    <Callout variant="warning" mt={4}>
                        <Text>{t("components.breakModal.breakPreparedTripCalloutText")}</Text>
                    </Callout>
                )}
            </Box>
            {isNewAddressModalOpen && (
                <AddressModal
                    addressCategory={`is_origin`}
                    onClose={closeNewAddressModal}
                    onSave={(breakAddress) => {
                        setSelectedBreakAddress(
                            addressService.convertAddressToIOriginalAddress(breakAddress)
                        );
                        closeNewAddressModal();
                    }}
                />
            )}
        </Modal>
    );
}
