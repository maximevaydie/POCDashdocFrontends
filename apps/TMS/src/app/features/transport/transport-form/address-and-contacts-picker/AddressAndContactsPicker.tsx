import {AddressCreatableSelect, SuggestedAddress} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, theme} from "@dashdoc/web-ui";
import {
    Address,
    ExtractedNewAddress,
    OriginalAddress,
    SimpleContact,
    type SlimCompanyForInvitation,
} from "dashdoc-utils";
import React from "react";

import {ContactCreatableSelect} from "app/features/company/contact/contact-select/ContactCreatableSelect";
import {contactService} from "app/features/company/contact/contacts-picker/contact.service";

type Props = {
    field: "carrier" | "shipper" | "destination" | "origin";
    address: Address | ExtractedNewAddress | null;
    onAddressChange: (address: OriginalAddress) => void;
    onTouchedField: (field: string) => void;
    addressRequiredError?: string;
    isAddressDisabled?: boolean;
    suggestedAddresses?: SuggestedAddress[];
    confirmationExtractedAddresses?: (OriginalAddress | ExtractedNewAddress)[];
    isRequired?: boolean;
    isClearable?: boolean;
    autoFocus?: boolean;
    displayTooltip?: boolean;
    autoSelectContactIfOnlyOne?: boolean;
    contacts: SimpleContact[] | null;
    onContactsChange: (contacts: SimpleContact[]) => void;
    onAddressChangeWithExtractedNewAddress?: (address: ExtractedNewAddress) => void;
    contactsError?: string;
};

/**
 * This component handles the address and contact fields for the transport form.
 * If no contact is selected or a contact without email, no email will be sent.
 */
export function AddressAndContactsPicker({
    field,
    address,
    onAddressChange,
    onTouchedField,
    addressRequiredError,
    isAddressDisabled,
    suggestedAddresses,
    confirmationExtractedAddresses,
    isRequired = false,
    isClearable = true,
    autoFocus = false,
    displayTooltip = false,
    contacts,
    onContactsChange,
    onAddressChangeWithExtractedNewAddress,
    contactsError = undefined,
}: Props) {
    const handleAddressChange = (address: OriginalAddress) => {
        onAddressChange(address);
        if (
            !address ||
            (contacts && contacts.some((contact) => address?.company?.pk !== contact?.company?.pk))
        ) {
            onContactsChange([]);
        }
    };

    const handleAddressChangeWithExtractedNewAddress = onAddressChangeWithExtractedNewAddress
        ? (address: ExtractedNewAddress) => {
              onAddressChangeWithExtractedNewAddress(address);
              onContactsChange([]);
          }
        : undefined;

    const labels = {
        addressLabel: {
            carrier: t("common.carrier"),
            shipper: t("common.shipper"),
            origin: t("common.pickupAddress"),
            destination: t("common.deliveryAddress"),
        },
    };

    const initialContacts = contacts || [];

    const {missingEmailWarning, emailWarningType} = contactService.getUnsentEmailMessage(
        initialContacts,
        field
    );
    const disabled = address === null;
    return (
        <>
            <Flex flexDirection={field === "shipper" ? "row" : "column"}>
                <Box
                    minWidth={field === "shipper" ? "50%" : "100%"}
                    pr={field === "shipper" ? 3 : 0}
                >
                    <AddressCreatableSelect
                        value={address}
                        onChange={handleAddressChange}
                        onChangeWithExtractedNewAddress={
                            handleAddressChangeWithExtractedNewAddress
                        }
                        categories={[field]}
                        data-testid={`${field}-address-select`}
                        ordering={`-last_used_${field}`}
                        suggestedAddresses={suggestedAddresses}
                        confirmationExtractedAddresses={confirmationExtractedAddresses}
                        onBlur={() => onTouchedField("address")}
                        error={addressRequiredError}
                        isClearable={isClearable}
                        label={labels.addressLabel[field]}
                        required={isRequired}
                        isDisabled={isAddressDisabled}
                        autoFocus={autoFocus}
                        displayTooltip={displayTooltip}
                    />
                </Box>
                <Box {...(field === "shipper" ? {flexGrow: 2, ml: 2} : {pt: 3})}>
                    <ContactCreatableSelect
                        autoSelectIfOnlyOne
                        //TODO Partial<Company> is not compatible with SlimCompanyForInvitation
                        company={
                            address && "company" in address
                                ? (address.company as SlimCompanyForInvitation)
                                : undefined
                        }
                        data-testid={`${field}-contact-select`}
                        defaultOptions={!disabled}
                        isClearable={false}
                        isDisabled={disabled}
                        isMulti
                        label={t("components.contact")}
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base) => ({...base, zIndex: theme.zIndices.topbar}),
                        }}
                        value={contacts}
                        onChange={(selectedContact: SimpleContact | SimpleContact[]) => {
                            if (Array.isArray(selectedContact)) {
                                return onContactsChange(selectedContact);
                            } else {
                                return onContactsChange([selectedContact]);
                            }
                        }}
                        onContactCreated={(newContact: SimpleContact) => {
                            const extendedContacts = [newContact].concat(contacts || []);
                            onContactsChange(extendedContacts);
                        }}
                        onBlur={() => onTouchedField("contacts")}
                        error={contactsError}
                    />
                </Box>
            </Flex>

            {/* Warn about missing contacts and empty emails */}
            {address && missingEmailWarning && (
                <Callout
                    py={1}
                    mt={2}
                    variant="warning"
                    data-testid={`contact-picker-callout-${field}-${emailWarningType}`}
                >
                    {missingEmailWarning}
                </Callout>
            )}
        </>
    );
}
