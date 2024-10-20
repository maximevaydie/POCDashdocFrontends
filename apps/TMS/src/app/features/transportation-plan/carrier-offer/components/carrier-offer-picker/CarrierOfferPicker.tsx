import {HasFeatureFlag, HasNotFeatureFlag, fetchCompany} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Checkbox,
    Flex,
    Icon,
    Modal,
    Text,
    themeAwareCss,
    toast,
} from "@dashdoc/web-ui";
import {DecoratedSection} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {Company, SimpleContact, useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";

import {CompanyAndContactPicker} from "app/features/company/contact/contacts-picker/CompanyAndContactPicker";
import {useSendToCarrier} from "app/features/transport/hooks/useSendToCarrier";
import {OffersHeaderModal} from "app/features/transportation-plan/carrier-offer/components/OffersHeaderModal";
import {useDispatch} from "app/redux/hooks";

import {CarrierOffer} from "../../../types";
import {OfferTooltip} from "../OfferTooltip";

const HoverStyledFlex = styled(Flex)(
    themeAwareCss({
        cursor: "pointer",
        "&:hover > *": {
            cursor: "pointer",
            color: "grey.ultradark",
        },
    })
);

type Selection = {
    company: Company;
    contacts: SimpleContact[];
    offer: CarrierOffer;
};

export interface CarrierOfferPickerProps {
    count: number;
    offers: CarrierOffer[];
    selectedOffer?: CarrierOffer;
    defaultCollapsed?: boolean;
    onSelectOffer: (
        offer: CarrierOffer,
        contacts: SimpleContact[],
        sendToCarrier: boolean
    ) => void;
    onSelectAnotherCarrier?: () => void;
}
export const CarrierOfferPicker: FunctionComponent<CarrierOfferPickerProps> = ({
    count,
    offers,
    selectedOffer,
    defaultCollapsed = false,
    onSelectOffer,
    onSelectAnotherCarrier,
}) => {
    const [collapsed, collapse, expand] = useToggle(defaultCollapsed);
    const [assignationModalVisible, showAssignationModal, hideAssignationModal] = useToggle(false);
    const {sendToCarrier, persistSendToCarrier} = useSendToCarrier();
    const [offerSelection, setOfferSelection] = useState<Selection | null>(null);

    const dispatch = useDispatch();

    const handlePickOffer = async (offer: CarrierOffer) => {
        try {
            const response = await dispatch(fetchCompany(offer.carrierPk.toString()));
            setOfferSelection({company: response, offer: offer, contacts: []});
            showAssignationModal();
        } catch (error) {
            Logger.error(error);
            toast.error(t("common.couldNotFetchCompanyContacts"));
        }
    };

    return (
        <>
            <Box onClick={collapsed ? expand : collapse}>
                <HoverStyledFlex alignItems="center" justifyContent="space-between">
                    <Box pb={4} flexGrow={1}>
                        <OffersHeaderModal offersCount={count} />
                    </Box>
                    {offers.length > 0 && (
                        <Icon name={"arrowDown"} fontSize={0} borderRadius={"50%"} />
                    )}
                </HoverStyledFlex>
            </Box>
            {!collapsed && (
                <Box mr={4}>
                    <Box borderTop="1px solid" borderColor="grey.light">
                        {offers.map((offer) => (
                            <Box
                                key={offer.id}
                                borderBottom="1px solid"
                                borderColor="grey.light"
                                pt={1}
                                pb={1}
                                data-testid={`carrier-card-${offer.id}`}
                            >
                                <DecoratedSection {...offer}>
                                    <Flex
                                        style={{gap: "8px"}}
                                        justifyContent="space-between"
                                        flexGrow={1}
                                        maxWidth="320px"
                                    >
                                        <Flex
                                            alignItems="center"
                                            minWidth="fit-content"
                                            justifyContent="space-between"
                                        >
                                            <Text pr={2}>{offer.value}</Text>
                                            <OfferTooltip rows={offer.rows} value={offer.value} />
                                        </Flex>
                                        <Box justifyContent="flex-end">
                                            <HasFeatureFlag flagName="recipientsOrder">
                                                <Button
                                                    variant="secondary"
                                                    disabled={selectedOffer?.id === offer.id}
                                                    onClick={() => handlePickOffer(offer)}
                                                    ml={2}
                                                    data-testid="select-carrier-offer-button"
                                                >
                                                    {t("common.select")}
                                                </Button>
                                            </HasFeatureFlag>
                                            <HasNotFeatureFlag flagName="recipientsOrder">
                                                <Button
                                                    variant="secondary"
                                                    disabled={selectedOffer?.id === offer.id}
                                                    onClick={() =>
                                                        onSelectOffer(offer, [], sendToCarrier)
                                                    }
                                                    ml={2}
                                                    data-testid="select-carrier-offer-button"
                                                >
                                                    {sendToCarrier
                                                        ? t("components.sendToCarrier")
                                                        : t("common.select")}
                                                </Button>
                                            </HasNotFeatureFlag>
                                        </Box>
                                    </Flex>
                                </DecoratedSection>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
            <Flex alignItems={"center"} mt={4}>
                {offers.length > 0 && !collapsed && (
                    <Checkbox
                        style={{marginTop: 6}}
                        checked={sendToCarrier}
                        onChange={persistSendToCarrier}
                        label={t("components.sendToCarrier")}
                        data-testid="carrier-offer-picker-send-to-carrier-checkbox"
                    />
                )}
                <Flex flex={1}></Flex>
                {onSelectAnotherCarrier && (
                    <Button
                        variant="plain"
                        onClick={onSelectAnotherCarrier}
                        data-testid="select-another-carrier-button"
                    >
                        {offers.length == 0
                            ? t("shipper.selectACarrier")
                            : t("shipper.selectAnotherCarrier")}
                    </Button>
                )}
            </Flex>
            {assignationModalVisible && offerSelection && (
                <Modal
                    title={t("transportationPlan.selectACarrierContact")}
                    data-testid="assign-carrier-and-contacts-from-plan"
                    onClose={hideAssignationModal}
                    mainButton={{
                        children: offerSelection.contacts.length
                            ? t("transportationPlan.assignCarrier")
                            : t("transportationPlan.assignCarrierWithoutContacts"),
                        "data-testid": "assign-carrier-and-contacts-from-plan-modal-save",
                        onClick: () =>
                            onSelectOffer(
                                offerSelection.offer,
                                offerSelection.contacts,
                                sendToCarrier
                            ),
                    }}
                    secondaryButton={{
                        "data-testid": "assign-carrier-and-contacts-from-plan-modal-close",
                        onClick: hideAssignationModal,
                    }}
                >
                    <CompanyAndContactPicker
                        companySelectorMode="hidden"
                        initialSendToCarrier="disabled"
                        initialSelection={{
                            key: "_",
                            company: offerSelection.company,
                            contacts: [],
                        }}
                        companyCategory="carrier"
                        multipleContacts
                        onUpdate={(contactSelection) => {
                            setOfferSelection({
                                ...offerSelection,
                                contacts: contactSelection.contacts,
                            });
                        }}
                        displayTooltip
                    />
                </Modal>
            )}
        </>
    );
};
