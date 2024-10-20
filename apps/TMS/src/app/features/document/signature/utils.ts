/// <reference types="intercom-web" />
import {DeliveryDocumentBusinessPrivacyScope, DeliveryDocument, Signature} from "dashdoc-utils";

import {getTransportTrailers, getTransportVehicles} from "app/services/transport";

import type {Site, Transport} from "app/types/transport";
import type {TransportListWeb} from "app/types/transport_list_web";

export const getPlatesListAsStringFromTransport = (transport: Transport) => {
    // retrieve a list of vehicle and trailers license plates
    const vehiclesPlates = getTransportVehicles(transport).map(({license_plate}) => license_plate);
    const trailersPlates = getTransportTrailers(transport).map(({license_plate}) => license_plate);
    return `${vehiclesPlates.join(", ")} / ${trailersPlates.join(", ")}`;
};

export const getConsignmentNotesFromTransport = (
    transport: Transport,
    businessPrivacyScope?: DeliveryDocument["business_privacy_scope"]
): DeliveryDocument[] => {
    // all consignment notes for that transport (ldv or cmr)
    const transportConsignmentNotes = transport.documents.filter(
        ({category}) =>
            category === "ldv" ||
            category === "cmr" ||
            category === "cmr4" ||
            category === "rental"
    );

    return transportConsignmentNotes.filter(({business_privacy_scope}) => {
        // if transport is under business privacy
        // only return consignment notes for the wanted scope
        if (transport.business_privacy && businessPrivacyScope) {
            // document may not have a business privacy scope,
            // in that case we consider it visible
            return !business_privacy_scope || business_privacy_scope === businessPrivacyScope;
        }
        return true;
    });
};

export const getAllConsignmentNotesNumbersFromTransport = (
    transport: TransportListWeb
): string => {
    const deliveryConsignmentNotesDocument = transport.documents
        .filter(
            ({category}) =>
                category === "ldv" ||
                category === "cmr" ||
                category === "cmr4" ||
                category === "rental"
        )
        .map(({reference}) => reference);
    const transportMessageConsignmentNotes = transport.messages
        .filter(({document_type}) => document_type === "cmr")
        .map(({reference}) => reference);
    return [...deliveryConsignmentNotesDocument, ...transportMessageConsignmentNotes].join(", ");
};

export const getConsignmentNotesNumbersAsStringFromConsignmentNotes = (
    documents: DeliveryDocument[]
) => documents.map(({reference}) => reference).join(", ");

export function getSiteAndScopeFromSignature(
    signature: Signature,
    transport: Transport
): {
    site: Site | undefined;
    businessPrivacyScope: DeliveryDocumentBusinessPrivacyScope;
} {
    const {status_update: status_update_uid} = signature;
    const status = (transport.status_updates ?? []).find(
        (status) => status.uid === status_update_uid
    );
    // @ts-ignore
    const {site: site_uid} = status;

    for (const delivery of transport.deliveries) {
        if (delivery.origin.uid === site_uid) {
            return {
                site: delivery.origin,
                // @ts-ignore
                businessPrivacyScope: transport.business_privacy ? "origin" : undefined,
            };
        } else if (delivery.destination.uid === site_uid) {
            return {
                site: delivery.destination,
                // @ts-ignore
                businessPrivacyScope: transport.business_privacy ? "destination" : undefined,
            };
        }
    }
    // @ts-ignore
    return {site: undefined, businessPrivacyScope: undefined};
}

export const contactlessSignatureCompleted = () => {
    return Intercom("trackEvent", "contactless-signature-completed");
};

export const intercomSendDraftConsignmentEvent = () => {
    return Intercom("trackEvent", "opens-draft-consignment-note");
};

export const intercomSendSignedConsignmentEvent = () => {
    return Intercom("trackEvent", "opens-signed-consignment-note");
};
