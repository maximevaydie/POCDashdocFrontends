import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import {SimpleContact} from "dashdoc-utils";
import React, {useCallback} from "react";
import cloneDeep from "rfdc/default";

import TrackingContactsPanel from "./tracking-contacts-panel";
import TrackingContactsSelector from "./tracking-contacts-selector";
import {DeletableSimpleContact} from "./types";

type ShipperTrackingContactsProps = {
    shipperPk: number;
    shipperContacts: DeletableSimpleContact[];
    contactsToHide?: SimpleContact[];
    onChange: (contact: SimpleContact[]) => void;
};

export default function ShipperTrackingContacts({
    shipperPk,
    shipperContacts,
    contactsToHide,
    onChange,
}: ShipperTrackingContactsProps) {
    const handleContactDelete = useCallback(
        (contact: SimpleContact) => {
            const newContacts = cloneDeep(shipperContacts).filter(({uid}) => contact.uid !== uid);
            onChange(newContacts);
        },
        [onChange, shipperContacts]
    );

    return (
        <TrackingContactsPanel>
            <Box mb={3}>
                <Text marginY={3} variant="h1">
                    {t("trackingContactsModal.shipperContacts")}
                </Text>
                <Text>{t("trackingContactsModal.shipperContactsInfo")}</Text>
            </Box>
            {/* The minHeight is set to prevent a visual change when adding the first contact badge (which is a bit larger than the select) */}
            <TrackingContactsSelector
                data-testid="tracking-contact-selector-shipper"
                contacts={shipperContacts}
                filteredCompanies={[shipperPk]}
                contactsToHide={contactsToHide}
                onChange={onChange}
                onContactDelete={handleContactDelete}
            />
        </TrackingContactsPanel>
    );
}
