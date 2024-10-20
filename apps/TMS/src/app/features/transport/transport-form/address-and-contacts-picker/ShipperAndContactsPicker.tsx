import {
    PartnerModal,
    PartnerSelect,
    type DefaultPartnerValue,
    type PartnerDetailOutput,
    type PartnerInListOutput,
    type ShipperInTransport,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, theme} from "@dashdoc/web-ui";
import {
    SimpleContact,
    useToggle,
    type CountryCode,
    type SlimCompanyForInvitation,
} from "dashdoc-utils";
import React, {useMemo, useState} from "react";

import {partnerService} from "app/features/address-book/partner.service";
import {ContactCreatableSelect} from "app/features/company/contact/contact-select/ContactCreatableSelect";
import {contactService} from "app/features/company/contact/contacts-picker/contact.service";

type Props = {
    direction: "row" | "column";
    isClearable?: boolean;
    isRequired?: boolean;
    autoFocus?: boolean;
    isMulti?: boolean;

    shipper: ShipperInTransport | PartnerInListOutput | null;
    shipperError?: string;
    shipperDisabled?: boolean;
    onShipperChange: (shipper: PartnerInListOutput | null) => void;

    contacts: SimpleContact[];
    contactsError?: string;
    contactsDisabled?: boolean;
    onContactsChange: (contacts: SimpleContact[]) => void;
    onTouchedContacts?: () => void;
};

/**
 * This component handles the shipper and contact fields for the transport form.
 * If no contact is selected or a contact without email, no email will be sent.
 * (This component follow the recipientsOrder FF behavior)
 */
export function ShipperAndContactsPicker({
    direction,
    isClearable = false,
    isRequired = false,
    autoFocus = false,
    isMulti = true,

    shipper,
    shipperError,
    shipperDisabled = false,
    onShipperChange,

    contacts,
    contactsError,
    contactsDisabled = false,
    onContactsChange,
    onTouchedContacts,
}: Props) {
    const [showAddModal, openAddModal, closeAddModal] = useToggle();
    const [addDefaultValue, setAddDefaultValue] = useState<DefaultPartnerValue>({
        is_shipper: true,
    });
    const initialContacts = contacts || [];

    const {missingEmailWarning, emailWarningType} = contactService.getUnsentEmailMessage(
        initialContacts,
        "shipper"
    );

    const contactCompany: SlimCompanyForInvitation | undefined = useMemo(() => {
        if (shipper === null) {
            return undefined;
        }
        return {
            pk: shipper.pk,
            name: shipper.name,
            can_invite_to: shipper.can_invite_to,
            country: shipper.administrative_address.country as CountryCode,
        };
    }, [shipper]);

    return (
        <>
            <Flex flexDirection={direction === "row" ? "row" : "column"} width="100%">
                <Box
                    minWidth={direction === "row" ? "50%" : "100%"}
                    pr={direction === "row" ? 3 : 0}
                >
                    <PartnerSelect<PartnerInListOutput>
                        label={t("common.shipper")}
                        data-testid="update-shipper-modal-select"
                        value={shipper}
                        displayTooltip
                        variant="shipper"
                        loadPartners={partnerService.searchShippers}
                        onChange={handleShipperChange}
                        onCreate={handlePartnerCreate}
                        isClearable={isClearable}
                        required={isRequired}
                        isDisabled={shipperDisabled}
                        autoFocus={autoFocus}
                        error={shipperError}
                    />
                </Box>
                <Box {...(direction === "row" ? {flexGrow: 2, ml: 2} : {pt: 3})}>
                    <ContactCreatableSelect
                        autoSelectIfOnlyOne
                        company={contactCompany}
                        data-testid={`shipper-contact-select`}
                        defaultOptions={true}
                        isClearable={false}
                        isDisabled={shipper === null || contactsDisabled}
                        isMulti={isMulti}
                        label={t("components.contact")}
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base) => ({...base, zIndex: theme.zIndices.topbar}),
                        }}
                        value={contacts}
                        onChange={handleContactChange}
                        onContactCreated={handleContactChange}
                        onBlur={onTouchedContacts}
                        error={contactsError}
                    />
                </Box>
            </Flex>

            {/* Warn about missing contacts and empty emails */}
            {shipper && missingEmailWarning && (
                <Callout
                    py={1}
                    mt={2}
                    variant="warning"
                    data-testid={`contact-picker-callout-shipper-${emailWarningType}`}
                >
                    {missingEmailWarning}
                </Callout>
            )}
            {showAddModal && (
                <PartnerModal
                    partner={addDefaultValue}
                    onSaved={handleShipperCreated}
                    onClose={closeAddModal}
                />
            )}
        </>
    );

    function handleContactChange(selectedContact: SimpleContact | SimpleContact[]) {
        if (Array.isArray(selectedContact)) {
            return onContactsChange(selectedContact);
        } else {
            return onContactsChange([selectedContact]);
        }
    }

    function handleShipperChange(shipper: PartnerInListOutput | null) {
        onShipperChange(shipper);
        if (!shipper || contacts.some((contact) => shipper?.pk !== contact?.company?.pk)) {
            onContactsChange([]);
        }
    }

    function handleShipperCreated(newPartner: PartnerDetailOutput) {
        // PartnerInListOutput is not at 100% a subtype PartnerDetailOutput of PartnerInListOutput (created_by not present for example)
        handleShipperChange(newPartner as any as PartnerInListOutput);
    }

    function handlePartnerCreate(name: string) {
        setAddDefaultValue((prev) => ({...prev, name}));
        openAddModal();
    }
}
