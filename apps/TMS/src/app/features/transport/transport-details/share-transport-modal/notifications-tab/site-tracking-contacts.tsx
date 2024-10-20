import {NamedAddressLabel} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import {SimpleContact, TrackingContactRole} from "dashdoc-utils";
import React, {useCallback} from "react";
import cloneDeep from "rfdc/default";

import TrackingContactsPanel from "./tracking-contacts-panel";
import TrackingContactsSelector from "./tracking-contacts-selector";
import {DeletableSimpleContact, NormalizedTrackingContact} from "./types";

import type {Delivery, Site} from "app/types/transport";

type SitesTrackingContactsProps = {
    deliveries: Delivery[];
    sites: Site[];
    contactsToHide?: SimpleContact[];
    contactsBySite: {
        [siteUid: string]: NormalizedTrackingContact[];
    };
    onChange: (contacts: {[siteUid: string]: NormalizedTrackingContact[]}) => void;
};

export default function SitesTrackingContacts({
    deliveries,
    sites,
    contactsBySite,
    contactsToHide,
    onChange,
}: SitesTrackingContactsProps) {
    const handleContactsChange = useCallback(
        (contacts: SimpleContact[], siteUid: string) => {
            const newContactsBySite = cloneDeep(contactsBySite);

            // Find each contacts in tracking contacts by site
            // For each existing one, update it
            // For each new one, create one TrackingContact by given deliveryUid
            contacts.forEach((contact) => {
                const existingContactIndex = newContactsBySite[siteUid].findIndex(
                    ({contact: {uid}}) => uid === contact.uid
                );
                if (existingContactIndex !== -1) {
                    newContactsBySite[siteUid].forEach(
                        (_, index) => (newContactsBySite[siteUid][index].toDelete = false)
                    );
                } else {
                    const deliveriesUidsIncludingSiteUid = deliveries.reduce((acc, delivery) => {
                        if (
                            delivery.origin.uid === siteUid ||
                            delivery.destination.uid === siteUid
                        ) {
                            acc.add(delivery.uid);
                        }
                        return acc;
                    }, new Set<string>());

                    deliveriesUidsIncludingSiteUid.forEach((deliveryUid) => {
                        newContactsBySite[siteUid].push({
                            contact,
                            delivery: deliveryUid,
                            role: TrackingContactRole.Site,
                            toDelete: false,
                            owned_by_user: true,
                        });
                    });
                }
            });

            // For each old contacts that are not selected anymore, set toDelete to true
            newContactsBySite[siteUid].forEach((trackingContact, index) => {
                if (!contacts.find(({uid}) => trackingContact.contact.uid === uid)) {
                    newContactsBySite[siteUid][index].toDelete = true;
                }
            });

            onChange(newContactsBySite);
        },
        [onChange, contactsBySite]
    );

    const handleContactDelete = useCallback(
        (contactUid: string, siteUid: string) => {
            const newContactsByDelivery = cloneDeep(contactsBySite);
            newContactsByDelivery[siteUid].forEach((_, index) => {
                if (newContactsByDelivery[siteUid][index].contact.uid === contactUid) {
                    newContactsByDelivery[siteUid][index].toDelete = true;
                }
            });
            onChange(newContactsByDelivery);
        },
        [onChange, contactsBySite]
    );

    const getFilteredContacts = (
        trackingContacts: NormalizedTrackingContact[]
    ): DeletableSimpleContact[] => {
        /**
         * Retrieve all unique DeletableSimpleContact objects
         * that doesn't have `toDelete === true`
         */
        return Object.values(
            trackingContacts.reduce(
                (acc, trackingContact: NormalizedTrackingContact) => {
                    if (!trackingContact.toDelete && !acc[trackingContact.contact.uid]) {
                        acc[trackingContact.contact.uid] = {
                            ...trackingContact.contact,
                            canBeDeleted: trackingContact.owned_by_user,
                        };
                    }
                    return acc;
                },
                {} as Record<SimpleContact["uid"], DeletableSimpleContact>
            )
        );
    };

    return (
        <TrackingContactsPanel>
            <Box mb={3}>
                <Text marginY={3} variant="h1">
                    {t("trackingContactsModal.siteContacts")}
                </Text>
                <Text>{t("trackingContactsModal.siteContactsInfo")}</Text>
            </Box>
            <Box>
                {sites.map((site, index) => {
                    const company_pk = site?.address?.company?.pk;
                    return (
                        <React.Fragment key={`delivery-contacts-${site.uid}`}>
                            {/* Site line separator */}
                            {index > 0 && (
                                <Box
                                    margin={3}
                                    borderTop="1px solid"
                                    borderTopColor="grey.light"
                                ></Box>
                            )}
                            <NamedAddressLabel
                                address={site.address}
                                data-testid="tracking-contact-activity-address-text"
                            />
                            <TrackingContactsSelector
                                data-testid={`tracking-contact-selector-site-${index}`}
                                contacts={getFilteredContacts(contactsBySite[site.uid])}
                                filteredCompanies={company_pk == undefined ? [] : [company_pk]}
                                contactsToHide={contactsToHide}
                                onChange={(contacts) => handleContactsChange(contacts, site.uid)}
                                onContactDelete={(contact) =>
                                    handleContactDelete(contact.uid, site.uid)
                                }
                            />
                        </React.Fragment>
                    );
                })}
            </Box>
        </TrackingContactsPanel>
    );
}
