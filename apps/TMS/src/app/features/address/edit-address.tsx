import {
    AddressModal,
    addressService,
    PartnerDetailOutput,
    type PartnerLogisticPointOutput,
} from "@dashdoc/web-common";
import {Button, Link} from "@dashdoc/web-ui";
import {Address, Company, OriginalAddress, useToggle} from "dashdoc-utils";
import React, {FunctionComponent, createContext, useContext} from "react";

type EditAddressProps = {
    address: Address | PartnerLogisticPointOutput;
    children?: React.ReactNode;
    company: Company | OriginalAddress["company"] | PartnerDetailOutput;
    setNewAddress?: (address: OriginalAddress) => void;
};

type LinkButtonEditAddressProps = EditAddressProps & {label?: string};

const OpenAddressModalContext = createContext<() => void>(() => {});

const EditAddress: FunctionComponent<EditAddressProps> = ({
    address,
    company,
    children,
    setNewAddress = () => {},
}) => {
    const [isModalOpen, openModal, closeModal] = useToggle(false);
    return (
        <OpenAddressModalContext.Provider value={openModal}>
            {children}
            {isModalOpen && (
                <AddressModal
                    address={address}
                    company={company as Company}
                    onSave={(address) => {
                        setNewAddress(addressService.convertAddressToIOriginalAddress(address));
                        closeModal();
                    }}
                    onClose={closeModal}
                />
            )}
        </OpenAddressModalContext.Provider>
    );
};

export const LinkEditAddress = ({address, label, ...otherProps}: LinkButtonEditAddressProps) => {
    return (
        <EditAddress address={address} {...otherProps}>
            <OpenLinkButton label={label ?? address.name} />
        </EditAddress>
    );
};

export const ButtonEditAddress = ({address, label, ...otherProps}: LinkButtonEditAddressProps) => {
    return (
        <EditAddress address={address} {...otherProps}>
            <OpenModalButton label={label ?? address.name} />
        </EditAddress>
    );
};

const OpenModalButton = ({label}: {label?: string}) => {
    const openModal = useContext(OpenAddressModalContext);
    return (
        <Button data-testid="edit-address-button" name="address" onClick={openModal}>
            {label}
        </Button>
    );
};

const OpenLinkButton = ({label}: {label?: string}) => {
    const openModal = useContext(OpenAddressModalContext);
    return (
        <Link data-testid="edit-address-link" onClick={openModal}>
            {label}
        </Link>
    );
};
