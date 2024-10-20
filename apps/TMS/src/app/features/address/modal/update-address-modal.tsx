import {apiService, type SimpleAddress} from "@dashdoc/web-common";
import {getConnectedCompany} from "@dashdoc/web-common";
import {AddressType, addressService} from "@dashdoc/web-common";
import {AddressSelect} from "@dashdoc/web-common";
import {AddressModal} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    Checkbox,
    Flex,
    IconLink,
    Icon,
    Modal,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {
    ActivitySiteType,
    Address,
    OriginalAddress,
    NewSignatory,
    TransportAddressWithCompany,
    useToggle,
    CountryCode,
    type Company,
    type TransportAddress,
    type AddressWithFullCompany,
} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";

import {SignatoriesSelect} from "app/features/address/signatories/SignatoriesModal";
import {UpdateOrCreateSignatoryModal} from "app/features/address/signatories/update-or-create-modal";
import {AmendTransportWarningBanner} from "app/features/transport/amend-transport-warning-banner";
import {useSendToCarrier} from "app/features/transport/hooks/useSendToCarrier";
import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {useSelector} from "app/redux/hooks";

const getDefaultLanguageForCountry = (country_code: string): string => {
    const country_code_lower_case = country_code.toLowerCase();

    // French speaking countries
    if (["fr", "lu", "ch", "re", "gf"].includes(country_code_lower_case)) {
        return "fr";
    }

    // Dutch speaking countries
    if (["nl"].includes(country_code_lower_case)) {
        return "nl";
    }

    // German speaking countries
    if (["de", "at"].includes(country_code_lower_case)) {
        return "de";
    }

    // Polish speaking countries
    if (["pl"].includes(country_code_lower_case)) {
        return "pl";
    }

    // Default to english
    return "en";
};

interface UpdateAddressModalProps {
    onClose: () => void;
    onSubmit: (
        address: OriginalAddress | undefined,
        sendToCarrier?: boolean,
        signatory?: NewSignatory,
        signatoryRemoved?: boolean
    ) => Promise<any>;
    initialAddress:
        | SimpleAddress
        | Address
        | AddressWithFullCompany
        | OriginalAddress
        | TransportAddress
        | TransportAddressWithCompany
        | null;
    siteUID?: string;
    addressCategory: ActivitySiteType | "shipper" | "carrier" | "invoice";
    isClearable?: boolean;
    isModifyingFinalInfo?: boolean;
    initialSignatory?: NewSignatory;
    isRental?: boolean;
    showSignatoriesSection?: boolean;
    disableSubmit?: boolean;
}

export const UpdateAddressModal: FunctionComponent<UpdateAddressModalProps> = (props) => {
    const {
        addressCategory,
        isClearable,
        initialAddress,
        siteUID,
        isModifyingFinalInfo,
        onClose,
        onSubmit,
        initialSignatory,
        isRental,
        showSignatoriesSection = true,
        disableSubmit = false,
    } = props;

    const [address, setAddress] = useState<OriginalAddress | undefined>(
        initialAddress
            ? addressService.convertAddressToIOriginalAddress(initialAddress)
            : undefined
    );

    const [detailedAddress, setDetailedAddress] = useState<Address | null>(null);

    const [loading, setIsLoading, setIsNotLoading] = useToggle(false);
    const [showAddAddressModal, openAddAddressModal, closeAddAddressModal] = useToggle();
    const [showEditAddressModal, openEditAddressModal, closeEditAddressModal] = useToggle();
    const {sendToCarrier, persistSendToCarrier} = useSendToCarrier();

    const [showEditSignatoryModal, setShowUpdateSignatoryModal] = useState<
        null | "create" | "update"
    >();

    const [selectedSignatory, _setSelectedSignatory] = useState<NewSignatory | null>(
        initialSignatory ?? null
    );

    const [signatoryRemoved, setSignatoryRemoved] = useState<boolean>(false);

    const setSelectedSignatory = (signatory: NewSignatory | null) => {
        /* because the address can change from an address with signatory
        to an address without signatory it isn't
        enough to just remove the old signatory if
        the selected signatory is null since this would
        remove the signatory for the original address.
        So we handle the state for removing signatory more explicitly
        */
        if (selectedSignatory !== null && signatory === null) {
            setSignatoryRemoved(true);
        } else if (signatory !== null) {
            setSignatoryRemoved(false);
        }
        _setSelectedSignatory(signatory);
    };

    const isSignableSite = addressCategory == "origin" || addressCategory == "destination";

    const connectedCompany = useSelector(getConnectedCompany);
    const companiesFromConnectedGroupView = useCompaniesInConnectedGroupView();

    const isCarrierSelf =
        connectedCompany?.pk !== undefined && connectedCompany?.pk === address?.company?.pk;

    const handleAddressChange = (address: Address | OriginalAddress | undefined) => {
        const newAddress = address
            ? addressService.convertAddressToIOriginalAddress(address)
            : undefined;
        setAddress(newAddress);

        // if the address changes from one with signatory to one without signatory, signatory goes
        // from not null -> null and activates the removal for the old address, so we set it null preemptively
        setSelectedSignatory(null);
        // and reset the state to remove a signatory
        setSignatoryRemoved(false);

        closeAddAddressModal();
        closeEditAddressModal();
    };

    const handleSubmit = async () => {
        let sendToCarrierToSubmit = sendToCarrier;
        if (isCarrierSelf) {
            // When the carrier of the transport is also the current company,
            // then sendToCarrier must be true in all cases.
            sendToCarrierToSubmit = true;
        }

        if (initialAddress?.pk === address?.pk && !sendToCarrierToSubmit) {
            return onClose();
        }

        setIsLoading();
        if (address || isClearable) {
            await onSubmit(
                address,
                sendToCarrierToSubmit,
                selectedSignatory ? selectedSignatory : undefined, // to please TS, convert null to undefined
                signatoryRemoved
            );
        }
        setIsNotLoading();
        onClose();
    };

    const getTitle = () => {
        if (addressCategory === "carrier") {
            if (address) {
                return t("components.carrierModification");
            } else {
                return t("components.carrierSet");
            }
        } else if (addressCategory === "shipper") {
            return t("components.shipperModification");
        }
        return t("components.addressModification");
    };

    const getLinkToEditAddress = () => {
        if (!address) {
            // Only for typing, this method is actually called only when an address is defined
            return;
        }

        const addressCanBeEdited = companiesFromConnectedGroupView.includes(address.created_by);

        const text_edit = t("transportsForm.editAddress", {
            addressName: address.company ? address.company.name : address.name,
        });
        const iconName = "edit";

        if (addressCanBeEdited) {
            return (
                <IconLink
                    text={text_edit}
                    iconName={iconName}
                    onClick={async () => {
                        if (
                            !detailedAddress ||
                            (detailedAddress && detailedAddress.pk != address.pk)
                        ) {
                            // When we search for an address we return a lightened address (OriginalAddress)
                            // for performance reasons. But in the case we need to actually edit the address, we fetch
                            // the full address again (Address). This case seems pretty rare as of today (May 2023)
                            // so the tradeoff (doing 2 optimized API calls here instead of 1 slower everywhere else)
                            // is acceptable.
                            const result = await apiService.Addresses.get(address.pk);
                            setDetailedAddress(result);
                        }
                        openEditAddressModal();
                    }}
                    data-testid="edit-address-link"
                />
            );
        } else {
            return (
                <TooltipWrapper content={t("components.cannotEditAddress")}>
                    <Icon name={iconName} fontSize={1} /> {text_edit}
                </TooltipWrapper>
            );
        }
    };

    return (
        <Modal
            title={getTitle()}
            onClose={props.onClose}
            data-testid="update-address-modal"
            mainButton={{
                ["data-testid"]: "update-address-modal-submit",
                type: "button",
                disabled: loading || disableSubmit,
                loading: loading,
                children: t("common.save"),
                onClick: handleSubmit,
            }}
        >
            <>
                <Flex flexDirection="column">
                    {isModifyingFinalInfo && (
                        <AmendTransportWarningBanner isRental={isRental ?? false} />
                    )}
                    {disableSubmit && (
                        <Callout mb={6} variant="warning">
                            {t("carrier.update.warning")}
                        </Callout>
                    )}
                    <Box width="400px">
                        <AddressSelect
                            label={address && t("common.address")}
                            data-testid="update-address-modal-select"
                            categories={addressService.getAddressCategories(addressCategory)}
                            value={address}
                            onChange={handleAddressChange}
                            isClearable={isClearable}
                            ordering={`-last_used_${addressCategory}`}
                            // Some categories are not available as ordering in backend but in these cases it will
                            // fall back to default ordering (-updated)
                        />
                    </Box>
                    <Flex justifyContent="flex-end" pt={2}>
                        <IconLink
                            text={t("transportsForm.addAddress")}
                            iconName="add"
                            onClick={openAddAddressModal}
                            data-testid="add-address-link"
                        />
                    </Flex>
                    {address && (
                        <>
                            <Flex justifyContent="flex-end" pt={2}>
                                {getLinkToEditAddress()}
                            </Flex>

                            {isSignableSite && showSignatoriesSection && (
                                <>
                                    <Callout mt={4}>
                                        {t("signatories.infoTruckerCanSelectSignatory")}
                                    </Callout>
                                    <Flex>
                                        <Box flex={1}>
                                            <SignatoriesSelect
                                                signatory={selectedSignatory}
                                                setSignatory={setSelectedSignatory}
                                                addressPk={address.pk}
                                                // @ts-ignore
                                                siteUID={siteUID}
                                            />
                                        </Box>
                                    </Flex>
                                    <Flex justifyContent="flex-end" pt={1}>
                                        <IconLink
                                            text={t("signatories.create").toLowerCase()}
                                            iconName="add"
                                            onClick={() => {
                                                setShowUpdateSignatoryModal("create");
                                            }}
                                            data-testid="add-signatory-link"
                                        />
                                    </Flex>
                                    {selectedSignatory && (
                                        <Flex justifyContent="flex-end" pt={2}>
                                            <IconLink
                                                text={t("signatories.update").toLowerCase()}
                                                iconName="edit"
                                                onClick={() => {
                                                    setShowUpdateSignatoryModal("update");
                                                }}
                                                data-testid="edit-signatory-link"
                                            />
                                        </Flex>
                                    )}
                                </>
                            )}
                            {addressCategory === "carrier" && !isCarrierSelf && (
                                <Box pt={3}>
                                    <Checkbox
                                        checked={sendToCarrier}
                                        onChange={persistSendToCarrier}
                                        label={t("components.sendToCarrier")}
                                        disabled={!address}
                                        data-testid="update-address-send-to-carrier-checkbox"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Flex>

                {showAddAddressModal && (
                    <AddressModal
                        addressCategory={`is_${addressCategory}` as AddressType}
                        company={
                            //TODO: Partial<Company> is not compatible with Company
                            initialAddress && "company" in initialAddress
                                ? (initialAddress?.company as Company)
                                : undefined
                        }
                        onSave={handleAddressChange}
                        onClose={closeAddAddressModal}
                        noCompanyOption={
                            !["carrier", "shipper", "invoice"].includes(addressCategory)
                        }
                    />
                )}

                {showEditAddressModal && detailedAddress && (
                    <AddressModal
                        companyBrowsable
                        address={detailedAddress}
                        onSave={handleAddressChange}
                        onClose={closeEditAddressModal}
                        noCompanyOption={
                            !["carrier", "shipper", "invoice"].includes(addressCategory)
                        }
                    />
                )}

                {showEditSignatoryModal && (
                    <UpdateOrCreateSignatoryModal
                        onConfirm={(signatory) => {
                            // @ts-ignore
                            setSelectedSignatory(signatory);
                            setShowUpdateSignatoryModal(null);
                        }}
                        onCancel={() => {
                            setShowUpdateSignatoryModal(null);
                        }}
                        siteUID={siteUID}
                        // @ts-ignore
                        signatory={showEditSignatoryModal == "update" && selectedSignatory}
                        default_language={
                            address ? getDefaultLanguageForCountry(address.country) : undefined
                        }
                        // @ts-ignore
                        country={initialAddress.country as CountryCode}
                    />
                )}
            </>
        </Modal>
    );
};
