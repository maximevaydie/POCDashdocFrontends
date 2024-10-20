import {CompanyCategory, CompanyCreatableSelect, getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Callout, Checkbox, Flex, theme} from "@dashdoc/web-ui";
import {Company, SimpleContact} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";

import {useSendToCarrier} from "app/features/transport/hooks/useSendToCarrier";
import {useSelector} from "app/redux/hooks";

import {ContactCreatableSelect} from "../contact-select/ContactCreatableSelect";

import {contactService} from "./contact.service";
import {ContactSelection} from "./types";

type CompanyAndContactPickerProps = {
    // Currently this is not always true but ultimately
    // contact will always be creatable.
    canCreateCompany?: boolean;
    canCreateContact?: boolean;
    companyCategory?: CompanyCategory;
    companyError?: string;
    companySelectorMode?: "hidden" | "frozen" | "editable";
    contactError?: string;
    contactRequired?: boolean;
    displayTooltip?: boolean;
    flexDirection?: "column" | "row";
    initialSendToCarrier: "disabled" | boolean;
    initialSelection: ContactSelection;
    // Will be removed as this will always be true
    multipleContacts?: boolean;
    onTouchedField?: (field: "company" | "contacts") => void;
    onUpdate: (selection: ContactSelection, sendToCarrier: boolean) => void;
};

/**
 * TODO: to remove with betterCompanyRoles FF
 * @deprecated use PartnerAndContactsPicker instead
 */
export const CompanyAndContactPicker: FunctionComponent<CompanyAndContactPickerProps> = ({
    companyCategory = "carrier",
    companyError,
    companySelectorMode = "editable",
    contactError,
    contactRequired,
    displayTooltip,
    flexDirection = "row",
    initialSendToCarrier,
    multipleContacts = false,
    initialSelection,
    onTouchedField,
    onUpdate,
}) => {
    type SelectionType = typeof initialSelection;
    const connectedCompany = useSelector(getConnectedCompany);
    const [selection, setState] = useState<Omit<SelectionType, "key">>(initialSelection);
    const {sendToCarrier: persistedSendToCarrier, persistSendToCarrier} = useSendToCarrier();

    let sendToCarrier = persistedSendToCarrier;
    if (initialSendToCarrier === "disabled") {
        sendToCarrier = false;
    }

    const {company, contacts} = selection;
    if (!multipleContacts) {
        contacts.splice(1);
    }

    const companyIsSet = company !== null;
    const isCompanySelf = companyIsSet && company?.pk === connectedCompany?.pk;
    const {missingEmailWarning, emailWarningType} = contactService.getUnsentEmailMessage(
        contacts,
        companyCategory
    );
    const companyBoxProps = flexDirection == "row" ? {minWidth: "50%"} : {width: "100%"};
    const contactBoxProps = flexDirection == "row" ? {flexGrow: 2, ml: 2} : {pt: 3};

    return (
        <Flex flexDirection="column" width="100%">
            <Flex
                flexDirection={flexDirection}
                justifyContent="space-around"
                flexGrow={1}
                data-testid="contact-picker"
            >
                {(!companyIsSet || companySelectorMode != "hidden") && (
                    <Box {...companyBoxProps}>
                        <CompanyCreatableSelect
                            companyCategory={companyCategory}
                            data-testid={`${companyCategory}-company-select`}
                            error={companyError}
                            isDisabled={companyIsSet && companySelectorMode == "frozen"}
                            label={contactService.getCompanyLabel(companyCategory)}
                            menuPortalTarget={document.body}
                            displayTooltip={displayTooltip}
                            required
                            styles={{
                                menuPortal: (base: any) => ({
                                    ...base,
                                    zIndex: theme.zIndices.topbar,
                                }),
                            }}
                            onChange={(newCompany: Company) => {
                                setState({company: newCompany, contacts: []});
                                const newSelection = {
                                    key: initialSelection.key,
                                    company: newCompany,
                                    contacts: [],
                                };
                                onUpdate(newSelection, sendToCarrier);
                            }}
                            onBlur={() => onTouchedField?.("company")}
                            value={company as Company}
                            displayAddress={true}
                        />
                    </Box>
                )}
                <Box {...contactBoxProps}>
                    <ContactCreatableSelect
                        autoSelectIfOnlyOne={true}
                        company={company === null ? undefined : company}
                        data-testid={`${companyCategory}-contact-select`}
                        defaultOptions={true}
                        error={contactError}
                        isClearable={false}
                        isDisabled={company === null}
                        isMulti={multipleContacts}
                        label={t("components.contact")}
                        required={contactRequired}
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base: any) => ({...base, zIndex: theme.zIndices.topbar}),
                        }}
                        value={multipleContacts ? contacts : contacts?.[0] || null}
                        /* Typing is a bit crazy here. The callback types on
                            ContactCreatableSelect do not take into account the
                            `isMultiParameter` AFAIK, so we can either get `SimpleContact`
                            or `SimpleContact[]` as callback arguments.*/
                        onChange={(selectedContact: SimpleContact | SimpleContact[]) => {
                            if (Array.isArray(selectedContact)) {
                                return setContacts(selectedContact);
                            } else {
                                return setContacts([selectedContact]);
                            }
                        }}
                        onContactCreated={(newContact: SimpleContact) => {
                            return addContact(newContact);
                        }}
                        onBlur={() => onTouchedField?.("contacts")}
                    />
                </Box>
            </Flex>
            {/* If the selected company is a carrier and not the current
            company, show "send to carrier" checkbox.
            TODO: Move this out into SubcontractForm, only used there. */}
            {!!company &&
                !!contacts.length &&
                !isCompanySelf &&
                companyCategory === "carrier" &&
                initialSendToCarrier != "disabled" && (
                    <Box pt={3}>
                        <Checkbox
                            checked={sendToCarrier}
                            label={t("components.sendToCarrier")}
                            data-testid="charter-modal-send-to-carrier-checkbox"
                            onChange={(sendToCarrierChecked) => {
                                persistSendToCarrier(sendToCarrierChecked);
                                onUpdate(
                                    {key: initialSelection.key, ...selection},
                                    sendToCarrierChecked
                                );
                            }}
                        />
                    </Box>
                )}
            {/* Warn about missing contacts and empty emails */}
            {!contactRequired && missingEmailWarning && company && (
                <Callout
                    mt={2}
                    py={1}
                    variant="warning"
                    data-testid={`contact-picker-callout-${companyCategory}-${emailWarningType}`}
                >
                    {missingEmailWarning}
                </Callout>
            )}
        </Flex>
    );

    function setContacts(newContacts: SimpleContact[]) {
        let newData = {
            contacts: newContacts,
        };

        setState((prev) => ({...prev, ...newData}));
        const newSelection = {
            key: initialSelection.key,
            company: company,
            ...newData,
        };

        onUpdate(newSelection, sendToCarrier);
    }

    function addContact(newContact: SimpleContact) {
        if (newContact) {
            const extendedContacts = [newContact].concat(contacts || []);
            const newSelection = {
                key: initialSelection.key,
                company: selection.company,
                contacts: extendedContacts,
            };
            setState((prev) => ({
                ...prev,
                contacts: newSelection.contacts,
            }));

            onUpdate(newSelection, sendToCarrier);
        }
    }
};
