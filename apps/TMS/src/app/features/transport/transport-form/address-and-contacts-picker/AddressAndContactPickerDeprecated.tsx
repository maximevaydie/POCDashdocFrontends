import {AddressCreatableSelect, SuggestedAddress, getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, SelectActionMeta, Text} from "@dashdoc/web-ui";
import {
    Address,
    ExtractedNewAddress,
    OriginalAddress,
    SimpleContact,
    type RealSimpleCompany,
    type SlimCompanyForInvitation,
} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";
import {useSelector} from "react-redux";

import {AddContactModal} from "app/features/company/contact/AddContactModal";
import {ContactCreatableSelect} from "app/features/company/contact/contact-select/ContactCreatableSelect";

interface AddressPickerProps {
    field: "carrier" | "shipper" | "destination" | "origin";
    address: Address | ExtractedNewAddress | null;
    contact: SimpleContact | null;
    onAddressChange: (address: OriginalAddress) => void;
    onContactChange: (contact: SimpleContact | null) => void;
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
    onAddressChangeWithExtractedNewAddress?: (address: ExtractedNewAddress) => void;
    contactsError?: string;
}

/**
 * This component handles the address and contact fields for the transport form.
 * If no contact is selected, the contact is automatically selected with the contact_company will be used (backend behavior).
 *
 *
 * @deprecated to remove with recipientsOrder FF
 * This component will survive a bit because several customers use the API with the old behavior.
 * The recipientsOrder FF duty is to stop this "magic behavior" and force the user to select explicitly a contact.
 * Sadly, API users are not happy to have to change their code to adapt to the new behavior.
 *
 * PM contact: Pascal E.
 * Integration contact: Hugues F.
 *
 */
export const AddressAndContactPickerDeprecated: FunctionComponent<AddressPickerProps> = ({
    field,
    address,
    contact,
    onAddressChange,
    onContactChange,
    onTouchedField,
    addressRequiredError,
    isAddressDisabled,
    suggestedAddresses,
    confirmationExtractedAddresses,
    isRequired = false,
    isClearable = true,
    autoFocus = false,
    displayTooltip = false,
    autoSelectContactIfOnlyOne = true,
    onAddressChangeWithExtractedNewAddress,
    contactsError = undefined,
}) => {
    const company = useSelector(getConnectedCompany);
    const [addContactModalParam, setAddContactModalParam] = useState<RealSimpleCompany | null>(
        null
    );
    const isAddressFieldType = ["origin", "destination"].includes(field);

    const handleAddressChange = (address: OriginalAddress, {action}: SelectActionMeta) => {
        onAddressChange(address);
        if (address?.company?.pk !== contact?.company?.pk || !address) {
            onContactChange(null);
        }
        // WHEN I created an address for a carrier/shipper THEN I display a create contact modal
        if (action === "create-option" && !isAddressFieldType && address.company) {
            //TODO: RealSimpleCompany is not compatible with RealSimpleCompany
            setAddContactModalParam(address.company as RealSimpleCompany | null);
        }
    };

    const handleAddressChangeWithExtractedNewAddress = onAddressChangeWithExtractedNewAddress
        ? (address: ExtractedNewAddress) => {
              onAddressChangeWithExtractedNewAddress(address);
              onContactChange(null);
          }
        : undefined;

    const labels = {
        addContactLabel: {
            carrier: t("transportsForm.contactCarrier"),
            shipper: t("transportsForm.contactShipper"),
            origin: t("transportsForm.contactOrigin"),
            destination: t("transportsForm.contactDestination"),
        },
        addressLabel: {
            carrier: t("common.carrier"),
            shipper: t("common.shipper"),
            origin: t("common.pickupAddress"),
            destination: t("common.deliveryAddress"),
        },
    };

    const _renderNoContactWarning = () => {
        if (
            field !== "carrier" ||
            (company && "settings" in company && company.settings?.print_mode)
        ) {
            return null;
        }
        const hasAccount =
            (address && "company" in address && address?.company?.has_loggable_managers) ?? false;
        if (hasAccount || !address || contact) {
            return null;
        }

        return (
            <Text color="yellow.default">
                <Icon name="warning" mr={1} />
                {t("components.noContactWarning")}
            </Text>
        );
    };

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
                {(!!isAddressFieldType ||
                    (address && "company" in address && company?.pk !== address?.company?.pk)) && (
                    <Box
                        width={field === "shipper" ? "50%" : "100%"}
                        mt={field === "shipper" ? 0 : 3}
                    >
                        <ContactCreatableSelect
                            //TODO  Partial<Company> is not compatible with SlimCompanyForInvitation
                            company={
                                address && "company" in address
                                    ? (address.company as SlimCompanyForInvitation)
                                    : undefined
                            }
                            value={contact}
                            onChange={onContactChange}
                            onContactCreated={onContactChange}
                            label={labels.addContactLabel[field]}
                            wrap={field === "shipper"}
                            autoSelectIfOnlyOne={autoSelectContactIfOnlyOne}
                            error={contactsError}
                            data-testid={`${field}-contact-select`}
                        />
                        {_renderNoContactWarning()}
                    </Box>
                )}
            </Flex>
            {addContactModalParam !== null && (
                <AddContactModal
                    company={addContactModalParam}
                    onClose={() => setAddContactModalParam(null)}
                    onSubmit={onContactChange}
                />
            )}
        </>
    );
};
