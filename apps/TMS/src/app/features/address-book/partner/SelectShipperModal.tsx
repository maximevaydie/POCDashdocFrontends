import {
    PartnerDetailOutput,
    PartnerLink,
    PartnerModal,
    PartnerSelect,
    type DefaultPartnerValue,
    type PartnerInListOutput,
    type UpdatablePartner,
} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Modal} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {AmendTransportWarningBanner} from "app/features/transport/amend-transport-warning-banner";

import {partnerService} from "../partner.service";

type Props = {
    onClose: () => void;
    initialShipper: UpdatablePartner | null;
    isModifyingFinalInfo: boolean;
    isRental: boolean;
    onSelected: (shipperPk: number) => void;
};

export function SelectShipperModal({
    initialShipper,
    isRental,
    isModifyingFinalInfo,
    onClose,
    onSelected,
}: Props) {
    const [shipper, setPartner] = useState<UpdatablePartner | null>(initialShipper);
    const [addDefaultValue, setAddDefaultValue] = useState<DefaultPartnerValue>({
        is_shipper: true,
    });
    const [loading, setIsLoading, setIsNotLoading] = useToggle(false);
    const [showAddModal, openAddModal, closeAddModal] = useToggle();

    return (
        <Modal
            title={t("components.shipperModification")}
            onClose={onClose}
            data-testid="update-shipper-modal"
            mainButton={{
                ["data-testid"]: "update-shipper-modal-submit",
                type: "button",
                disabled: loading,
                loading: loading,
                children: t("common.save"),
                onClick: handleSelect,
            }}
        >
            <>
                <Flex flexDirection="column">
                    {isModifyingFinalInfo && (
                        <AmendTransportWarningBanner isRental={isRental ?? false} />
                    )}
                    <Box width="400px">
                        <PartnerSelect<PartnerInListOutput>
                            label={t("common.shipper")}
                            data-testid="update-shipper-modal-select"
                            value={shipper}
                            variant="shipper"
                            displayTooltip
                            isClearable={false}
                            loadPartners={partnerService.searchShippers}
                            onChange={handleChange}
                            onCreate={handleCreate}
                        />
                        {shipper && (
                            <>
                                <Flex justifyContent="flex-end" pt={2}>
                                    <PartnerLink pk={shipper.pk}>
                                        <Flex>
                                            {
                                                // eslint-disable-next-line react/jsx-no-literals
                                                `${t("common.view")} ${shipper.name}`
                                            }
                                            <Icon name="openInNewTab" ml={2} />
                                        </Flex>
                                    </PartnerLink>
                                </Flex>
                            </>
                        )}
                    </Box>
                </Flex>

                {showAddModal && (
                    <PartnerModal
                        partner={addDefaultValue}
                        onSaved={handleChange}
                        onClose={closeAddModal}
                    />
                )}
            </>
        </Modal>
    );

    function handleChange(shipper: PartnerInListOutput | PartnerDetailOutput | null) {
        setPartner(shipper);
        closeAddModal();
    }

    function handleCreate(name: string) {
        setAddDefaultValue((prev) => ({...prev, name}));
        openAddModal();
    }

    async function handleSelect() {
        setIsLoading();
        if (shipper === null) {
            Logger.error("SelectPartnerModal: cannot unset shipper");
        } else if (initialShipper?.pk === shipper.pk) {
            // Nothing to do, the shipper remains the same
        } else {
            onSelected(shipper.pk);
        }
        setIsNotLoading();
        onClose();
    }
}
