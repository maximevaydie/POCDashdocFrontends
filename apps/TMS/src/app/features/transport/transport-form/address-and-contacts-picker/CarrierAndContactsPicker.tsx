import {
    PartnerModal,
    PartnerSelect,
    type CarrierInListOutput,
    type CarrierInTransport,
    type DefaultPartnerValue,
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
    contactIsRequired?: boolean;
    autoFocus?: boolean;
    isMulti?: boolean;

    carrier: CarrierInListOutput | CarrierInTransport | null;
    onCarrierChange: (carrier: CarrierInListOutput | null) => void;
    carrierError?: string;
    carrierDisabled?: boolean;

    contacts: SimpleContact[];
    contactsError?: string;
    contactsDisabled?: boolean;
    onContactsChange: (contacts: SimpleContact[]) => void;
    onTouchedContacts?: () => void;
};

/**
 * This component handles the carrier and contact fields for the transport form.
 * If no contact is selected or a contact without email, no email will be sent.
 * (This component follow the recipientsOrder FF behavior)
 */
export function CarrierAndContactsPicker({
    direction,
    isClearable = false,
    isRequired = false,
    contactIsRequired = false,
    autoFocus = false,
    isMulti = true,

    carrier,
    carrierError,
    carrierDisabled = false,
    onCarrierChange,

    contacts,
    contactsError,
    contactsDisabled = false,
    onContactsChange,
    onTouchedContacts,
}: Props) {
    const [showAddModal, openAddModal, closeAddModal] = useToggle();
    const [addDefaultValue, setAddDefaultValue] = useState<DefaultPartnerValue>({
        is_carrier: true,
    });
    const initialContacts = contacts || [];

    const {missingEmailWarning, emailWarningType} = contactService.getUnsentEmailMessage(
        initialContacts,
        "carrier"
    );

    const contactCompany: SlimCompanyForInvitation | undefined = useMemo(() => {
        if (carrier === null) {
            return undefined;
        }
        return {
            pk: carrier.pk,
            name: carrier.name,
            can_invite_to: carrier.can_invite_to,
            country: carrier.administrative_address.country as CountryCode,
        };
    }, [carrier]);

    return (
        <>
            <Flex flexDirection={direction === "row" ? "row" : "column"} width="100%">
                <Box
                    minWidth={direction === "row" ? "50%" : "100%"}
                    pr={direction === "row" ? 3 : 0}
                >
                    <PartnerSelect<CarrierInListOutput>
                        label={t("common.carrier")}
                        data-testid="update-carrier-modal-select"
                        value={carrier}
                        displayTooltip
                        variant="carrier"
                        loadPartners={partnerService.searchCarriers}
                        onChange={handleCarrierChange}
                        onCreate={handleCreatePartner}
                        isClearable={isClearable}
                        required={isRequired}
                        isDisabled={carrierDisabled}
                        autoFocus={autoFocus}
                        error={carrierError}
                    />
                </Box>
                <Box {...(direction === "row" ? {flexGrow: 2, ml: 2} : {pt: 3})}>
                    <ContactCreatableSelect
                        autoSelectIfOnlyOne
                        company={contactCompany}
                        data-testid={"carrier-contact-select"}
                        defaultOptions={true}
                        isClearable={false}
                        required={contactIsRequired}
                        isDisabled={carrier === null || contactsDisabled}
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
            {carrier && missingEmailWarning && (
                <Callout
                    py={1}
                    mt={2}
                    variant="warning"
                    data-testid={`contact-picker-callout-carrier-${emailWarningType}`}
                >
                    {missingEmailWarning}
                </Callout>
            )}
            {showAddModal && (
                <PartnerModal
                    partner={addDefaultValue}
                    onSaved={handleCarrierChange}
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

    function handleCarrierChange(carrier: CarrierInListOutput | null) {
        onCarrierChange(carrier);
        if (!carrier || contacts.some((contact) => carrier?.pk !== contact?.company?.pk)) {
            onContactsChange([]);
        }
    }

    function handleCreatePartner(name: string) {
        setAddDefaultValue((prev) => ({...prev, name}));
        openAddModal();
    }
}
