import {apiService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Button, Callout, Flex, toast} from "@dashdoc/web-ui";
import {SimpleContact, TrackingContact, TrackingContactRole, useToggle} from "dashdoc-utils";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import cloneDeep from "rfdc/default";

import {fetchRetrieveDelivery} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import {CarrierTrackingContacts} from "./carrier-tracking-contacts";
import ShipperTrackingContacts from "./shipper-tracking-contacts";
import SitesTrackingContacts from "./site-tracking-contacts";
import {NormalizedTrackingContact} from "./types";

import type {Delivery, Site, Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    sites: Site[];
    onClose: () => void;
};

export function NotificationsTab({transport, sites, onClose}: Props) {
    const dispatch = useDispatch();
    const [isLoading, showLoading, hideLoading] = useToggle(false);
    const [shipperContacts, setShipperContacts] = useState<NormalizedTrackingContact[]>([]);
    const selectedShipperContact = useMemo(
        () => shipperContacts.filter(({toDelete}) => !toDelete).map(({contact}) => contact),
        [shipperContacts]
    );
    const [carrierContacts, setCarrierContacts] = useState<NormalizedTrackingContact[]>([]);
    const selectedCarrierContact = useMemo(
        () => carrierContacts.filter(({toDelete}) => !toDelete).map(({contact}) => contact),
        [carrierContacts]
    );

    const transportUid = transport.uid;
    const deliveries = transport.deliveries as Delivery[];
    const shipperPk = transport.shipper.pk;
    const carrierPk = transport.carrier?.pk;

    const initialTrackingContactsBySite: {
        [siteUid: string]: NormalizedTrackingContact[];
    } = sites.reduce((acc: {[delivery: string]: NormalizedTrackingContact[]}, {uid}) => {
        acc[uid] = [];
        return acc;
    }, {});
    const [trackingContactsBySite, setTrackingContactsBySite] = useState<{
        [siteUid: string]: NormalizedTrackingContact[];
    }>(initialTrackingContactsBySite);

    const selectedSiteContact = useMemo(
        () =>
            Object.values(trackingContactsBySite).reduce(
                (flatContacts: SimpleContact[], siteContacts) => [
                    ...flatContacts,
                    ...siteContacts.filter(({toDelete}) => !toDelete).map(({contact}) => contact),
                ],
                []
            ),
        [trackingContactsBySite]
    );

    const getTrackingContacts = useCallback(async () => {
        let trackingContacts: TrackingContact[];
        try {
            const {results} = await apiService.TrackingContacts.getAll({
                query: {transport: transportUid},
            });
            trackingContacts = results;
        } catch (error) {
            Logger.error(error);
            toast.error(t("filter.error.couldNotFetchContacts"));
            return;
        }
        if (trackingContacts.length > 0) {
            const normalizedTrackingContacts = trackingContacts.reduce<
                NormalizedTrackingContact[]
            >((acc, trackingContact) => {
                const delivery = deliveries.find(({uid}) => uid === trackingContact.delivery);

                if (!delivery) {
                    return acc;
                }

                const site =
                    delivery.origin.address?.company?.pk === trackingContact.contact.company.pk
                        ? delivery.origin
                        : delivery.destination;
                acc.push({
                    ...trackingContact,
                    delivery: delivery.uid,
                    site,
                    toDelete: false,
                });

                return acc;
            }, []);

            const shipperTrackingContacts: NormalizedTrackingContact[] =
                normalizedTrackingContacts.filter(
                    (trackingContact) => trackingContact.role === TrackingContactRole.Shipper
                );
            setShipperContacts(shipperTrackingContacts);

            const carrierTrackingContacts: NormalizedTrackingContact[] =
                normalizedTrackingContacts.filter(
                    (trackingContact) => trackingContact.role === TrackingContactRole.Carrier
                );
            setCarrierContacts(carrierTrackingContacts);

            const siteContactsBySites = sites.reduce(
                (acc: {[siteUid: string]: NormalizedTrackingContact[]}, {uid}) => {
                    acc[uid] = [
                        ...(acc[uid] || []),
                        ...normalizedTrackingContacts.filter(
                            (trackingContact) =>
                                // @ts-ignore
                                trackingContact.site?.uid === uid &&
                                trackingContact.role === TrackingContactRole.Site
                        ),
                    ];
                    return acc;
                },
                {}
            );
            setTrackingContactsBySite(siteContactsBySites);
        }
    }, [deliveries, sites, transportUid]);

    useEffect(() => {
        getTrackingContacts();
    }, []);

    const mergeContactsInTrackingContacts = useCallback(
        (
            trackingContacts: NormalizedTrackingContact[],
            newContacts: SimpleContact[],
            delivery: NormalizedTrackingContact["delivery"],
            role: TrackingContactRole
        ) => {
            const newTrackingContacts = cloneDeep(trackingContacts);
            // Mark removed contacts for deletion
            newTrackingContacts.forEach((trackingContact, index) => {
                if (newContacts.find(({uid}) => uid === trackingContact.contact.uid)) {
                    newTrackingContacts[index].toDelete = false;
                } else {
                    newTrackingContacts[index].toDelete = true;
                }
            });

            // Add new contacts to the tracking contact list
            newTrackingContacts.push(
                ...newContacts
                    .filter(
                        ({uid}) => !newTrackingContacts.find(({contact}) => contact.uid === uid)
                    )
                    .map(
                        (contact) =>
                            ({
                                contact,
                                delivery,
                                role,
                                toDelete: false,
                                // A new contact is owned by the user,
                                // else it wouldn't be in the select
                                owned_by_user: true,
                            }) as NormalizedTrackingContact
                    )
            );

            return newTrackingContacts;
        },
        []
    );

    const onShipperContactsChange = useCallback(
        (contacts: SimpleContact[]) => {
            setShipperContacts(
                mergeContactsInTrackingContacts(
                    shipperContacts,
                    contacts,
                    deliveries[0].uid,
                    TrackingContactRole.Shipper
                )
            );
        },
        [deliveries, mergeContactsInTrackingContacts, shipperContacts]
    );

    const onCarrierContactsChange = useCallback(
        (contacts: SimpleContact[]) => {
            setCarrierContacts(
                mergeContactsInTrackingContacts(
                    carrierContacts,
                    contacts,
                    deliveries[0].uid,
                    TrackingContactRole.Carrier
                )
            );
        },
        [carrierContacts, deliveries, mergeContactsInTrackingContacts]
    );

    const submitContact = (
        trackingContact: NormalizedTrackingContact,
        role: TrackingContactRole
    ): Promise<TrackingContact | void | unknown> => {
        if (trackingContact.toDelete && trackingContact.uid) {
            // If the contact is to be deleted and has a uid, call the DELETE endpoint
            return apiService.TrackingContacts.delete(trackingContact.uid);
        } else if (!trackingContact.toDelete && !trackingContact.uid) {
            // Only create a contact if it didn't exist before
            // We dont need any `PATCH`es as we can't edit a contact in this component
            return apiService.TrackingContacts.post({
                data: {
                    contact: trackingContact.contact.uid,
                    delivery: trackingContact.delivery,
                    role,
                },
            });
        }
        // Else ignore the contact
        return Promise.resolve();
    };

    const handleSubmit = useCallback(async () => {
        showLoading();

        const shipperContactsPromises = shipperContacts.map((trackingContact) =>
            submitContact(trackingContact, TrackingContactRole.Shipper)
        );

        const carrierContactsPromises = carrierContacts.map((trackingContact) =>
            submitContact(trackingContact, TrackingContactRole.Carrier)
        );

        const siteContactsPromises = Object.keys(trackingContactsBySite).reduce(
            (acc: Promise<unknown>[], deliveryUid: string) => {
                acc.push(
                    ...trackingContactsBySite[deliveryUid].map((trackingContact) =>
                        submitContact(trackingContact, TrackingContactRole.Site)
                    )
                );
                return acc;
            },
            []
        );

        try {
            await Promise.all([
                ...shipperContactsPromises,
                ...carrierContactsPromises,
                ...siteContactsPromises,
            ]).then(() => {
                deliveries.forEach((delivery) => dispatch(fetchRetrieveDelivery(delivery.uid)));
            });
        } catch (error) {
            Logger.error(error);
            toast.error(t("newTrackingContact.error"));
            hideLoading();
            return;
        }
        toast.success(t("newTrackingContact.success"));
        hideLoading();
        onClose();
    }, [
        showLoading,
        shipperContacts,
        carrierContacts,
        trackingContactsBySite,
        hideLoading,
        onClose,
        deliveries,
        dispatch,
    ]);

    return (
        <Flex data-testid="tracking-contact-modal-new" flexDirection="column" mt={3}>
            <Callout variant="informative" mb={3}>
                {t("transportDetails.shareTransportModal.notificationsTabDescription")}
            </Callout>

            <ShipperTrackingContacts
                shipperPk={shipperPk}
                shipperContacts={shipperContacts
                    .filter(({toDelete}) => !toDelete)
                    .map(({contact, owned_by_user}) => ({
                        ...contact,
                        canBeDeleted: owned_by_user,
                    }))}
                contactsToHide={[...selectedCarrierContact, ...selectedSiteContact]}
                onChange={onShipperContactsChange}
            ></ShipperTrackingContacts>
            <CarrierTrackingContacts
                carrierPk={carrierPk}
                carrierContacts={carrierContacts
                    .filter(({toDelete}) => !toDelete)
                    .map(({contact, owned_by_user}) => ({
                        ...contact,
                        canBeDeleted: owned_by_user,
                    }))}
                contactsToHide={[...selectedShipperContact, ...selectedSiteContact]}
                onChange={onCarrierContactsChange}
            ></CarrierTrackingContacts>
            <SitesTrackingContacts
                deliveries={deliveries}
                sites={sites}
                contactsBySite={trackingContactsBySite}
                contactsToHide={[...selectedCarrierContact, ...selectedShipperContact]}
                onChange={setTrackingContactsBySite}
            ></SitesTrackingContacts>

            <Flex flexGrow={1} justifyContent={"flex-end"}>
                <Button
                    data-testid="tracking-contact-modal-new-submit"
                    disabled={isLoading}
                    loading={isLoading}
                    onClick={handleSubmit}
                >
                    {t("common.save")}
                </Button>
            </Flex>
        </Flex>
    );
}
