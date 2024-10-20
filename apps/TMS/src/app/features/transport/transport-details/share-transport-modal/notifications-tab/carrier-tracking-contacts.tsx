import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import {SimpleContact} from "dashdoc-utils";
import React, {useCallback} from "react";
import cloneDeep from "rfdc/default";

import TrackingContactsPanel from "./tracking-contacts-panel";
import TrackingContactsSelector from "./tracking-contacts-selector";
import {DeletableSimpleContact} from "./types";

type CarrierTrackingContactsProps = {
    carrierPk?: number;
    carrierContacts: DeletableSimpleContact[];
    contactsToHide: SimpleContact[];
    onChange: (contact: SimpleContact[]) => void;
};

export function CarrierTrackingContacts({
    carrierPk,
    carrierContacts,
    contactsToHide,
    onChange,
}: CarrierTrackingContactsProps) {
    const handleContactDelete = useCallback(
        (contact: SimpleContact) => {
            const newContacts = cloneDeep(carrierContacts).filter(({uid}) => contact.uid !== uid);
            onChange(newContacts);
        },
        [onChange, carrierContacts]
    );

    return (
        <TrackingContactsPanel>
            <Box mb={3}>
                <Text marginY={3} variant="h1">
                    {t("trackingContactsModal.carrierContacts")}
                </Text>
                <Text>{t("trackingContactsModal.carrierContactsInfo")}</Text>
            </Box>
            <TrackingContactsSelector
                data-testid="tracking-contact-selector-carrier"
                contacts={carrierContacts}
                filteredCompanies={carrierPk ? [carrierPk] : []}
                contactsToHide={contactsToHide}
                onChange={onChange}
                onContactDelete={handleContactDelete}
            />
        </TrackingContactsPanel>
    );
}
