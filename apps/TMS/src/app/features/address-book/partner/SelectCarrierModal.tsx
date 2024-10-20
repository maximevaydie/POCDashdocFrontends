import {
    PartnerDetailOutput,
    PartnerLink,
    PartnerModal,
    PartnerSelect,
    getConnectedCompany,
    type CarrierInListOutput,
    type DefaultPartnerValue,
    type UpdatablePartner,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Checkbox, Flex, Icon, Modal} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {AmendTransportWarningBanner} from "app/features/transport/amend-transport-warning-banner";
import {useSendToCarrier} from "app/features/transport/hooks/useSendToCarrier";
import {useSelector} from "app/redux/hooks";

import {partnerService} from "../partner.service";

type Props = {
    initialCarrier: UpdatablePartner | null;
    isModifyingFinalInfo: boolean;
    isRental: boolean;
    onSelected: (partnerPk: number | null, sendToCarrier?: boolean) => void;
    onClose: () => void;
};

export function SelectCarrierModal({
    initialCarrier,
    isRental,
    isModifyingFinalInfo,
    onClose,
    onSelected,
}: Props) {
    const [carrier, setCarrier] = useState<UpdatablePartner | null>(initialCarrier);
    const [addDefaultValue, setAddDefaultValue] = useState<DefaultPartnerValue>({
        is_carrier: true,
    });
    const [loading, setIsLoading, setIsNotLoading] = useToggle(false);
    const [showAddModal, openAddModal, closeAddModal] = useToggle();
    const {sendToCarrier, persistSendToCarrier} = useSendToCarrier();

    const connectedCompany = useSelector(getConnectedCompany);

    const isSelf = connectedCompany?.pk !== undefined && connectedCompany?.pk === carrier?.pk;

    return (
        <Modal
            title={getTitle()}
            onClose={onClose}
            data-testid="update-carrier-modal"
            mainButton={{
                ["data-testid"]: "update-carrier-modal-submit",
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
                        <PartnerSelect<CarrierInListOutput>
                            label={t("common.carrier")}
                            data-testid="update-carrier-modal-select"
                            value={carrier}
                            variant="carrier"
                            displayTooltip
                            isClearable
                            loadPartners={partnerService.searchCarriers}
                            onChange={handleChange}
                            onCreate={handleCreate}
                        />
                        {carrier && (
                            <>
                                <Flex justifyContent="flex-end" pt={2}>
                                    <PartnerLink pk={carrier.pk}>
                                        <Flex>
                                            {
                                                // eslint-disable-next-line react/jsx-no-literals
                                                `${t("common.view")} ${carrier.name}`
                                            }
                                            <Icon name="openInNewTab" ml={2} />
                                        </Flex>
                                    </PartnerLink>
                                </Flex>

                                {!isSelf && (
                                    <Box pt={3}>
                                        <Checkbox
                                            checked={sendToCarrier}
                                            onChange={persistSendToCarrier}
                                            label={t("components.sendToCarrier")}
                                            disabled={!carrier}
                                            data-testid="update-address-send-to-carrier-checkbox"
                                        />
                                    </Box>
                                )}
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

    function handleChange(partner: CarrierInListOutput | PartnerDetailOutput | null) {
        setCarrier(partner);
        closeAddModal();
    }

    function handleCreate(name: string) {
        setAddDefaultValue((prev) => ({...prev, name}));
        openAddModal();
    }

    async function handleSelect() {
        setIsLoading();
        if (carrier === null) {
            await onSelected(null);
        } else {
            // WHEN the carrier of the transport is also the current company,
            // THEN sendToCarrier must be true in all cases.
            const sendToCarrierToSubmit = sendToCarrier || isSelf;

            if (initialCarrier?.pk === carrier.pk && !sendToCarrierToSubmit) {
                // Nothing to do, the carrier remains the same
            } else {
                await onSelected(carrier.pk, sendToCarrierToSubmit);
            }
        }

        setIsNotLoading();
        onClose();
    }

    function getTitle() {
        if (carrier) {
            return t("components.carrierModification");
        } else {
            return t("components.carrierSet");
        }
    }
}
