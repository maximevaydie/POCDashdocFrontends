import {Box, Flex} from "@dashdoc/web-ui";
import {SimpleContact} from "dashdoc-utils";
import React from "react";

import ContactSelectNew from "./contact-select-new";
import ContactBadge from "./tracking-contacts-badge";
import {DeletableSimpleContact} from "./types";

type TrackingContactsSelectorProps = {
    contacts: DeletableSimpleContact[];
    filteredCompanies: number[];
    contactsToHide?: SimpleContact[];
    "data-testid"?: string;
    onChange: (contact: SimpleContact[]) => void;
    onContactDelete: (contact: SimpleContact) => void;
};

export default function TrackingContactsSelector({
    contacts,
    filteredCompanies,
    contactsToHide,
    "data-testid": dataTestId,
    onChange,
    onContactDelete,
}: TrackingContactsSelectorProps) {
    /* The minHeight is set to prevent a visual change when adding the first contact badge (which is a bit larger than the select) */
    return (
        <Flex minHeight="56px" data-testid={dataTestId}>
            <Box flexBasis="40%" flexShrink={0} m={1}>
                <ContactSelectNew
                    filteredCompanies={filteredCompanies}
                    contactsToHide={contactsToHide}
                    selectedContacts={contacts}
                    onChange={onChange}
                />
            </Box>
            <Flex flexWrap="wrap" m={1}>
                {contacts.map((contact, index) => (
                    <ContactBadge
                        key={`tracking-contact-badge-${contact.uid}`}
                        data-testid={`tracking-contact-badge-${index}`}
                        contact={contact}
                        // @ts-ignore
                        onDelete={contact.canBeDeleted ? () => onContactDelete(contact) : null}
                    />
                ))}
            </Flex>
        </Flex>
    );
}
