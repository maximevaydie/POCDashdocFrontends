import {t} from "@dashdoc/web-core";
import {IconNames} from "@dashdoc/web-ui";
import {DeliveryDocumentType, DeliveryDocument, MessageDocumentType} from "dashdoc-utils";

import {
    getAllCompaniesFromTransport,
    getTransportDestinationName,
    getTransportOriginName,
} from "./transport.service";

import type {Transport} from "app/types/transport";
import type {TransportListWeb} from "app/types/transport_list_web";

export function getDocumentTypeLabel(document_type: MessageDocumentType | DeliveryDocumentType) {
    switch (document_type) {
        case "cmr":
        case "cmr4":
            return t("deliveryDocumentType.CMR");
        case "ldv":
            return t("documentType.CN");
        case "rental":
            return t("documentType.RN");
        case "loading_plan":
            return t("documentType.loadingPlan");
        case "confirmation":
        case "orc":
            return t("documentType.TO");
        case "delivery_note":
            return t("documentType.DN");
        case "chc":
            return t("documentType.CHC");
        case "weight_note":
            return t("documentType.WN");
        case "invoice":
            return t("documentType.IN");
        case "washing_note":
            return t("documentType.WSN");
        case "load_photo":
            return "";
        case "waste_manifest":
            return t("documentType.WM");
        case "flanders_waste_manifest":
            return t("documentType.WM");
        case "holders_swap_note":
            return t("documentType.HSN");
        default:
            return "";
    }
}

export function getDocumentLabelLong(documentType: MessageDocumentType | DeliveryDocumentType) {
    switch (documentType) {
        case "cmr":
            return t("documentType.cmr");
        case "load_photo":
            return t("documentType.loadPhoto");
        case "delivery_note":
            return t("documentType.deliveryNote");
        case "weight_note":
            return t("documentType.weightNote");
        case "washing_note":
            return t("documentType.washingNote");
        case "waste_manifest":
            return t("documentType.wasteManifest");
        case "flanders_waste_manifest":
            return t("documentType.wasteManifest");
        case "holders_swap_note":
            return t("documentType.holdersSwapNote");
        default:
            return t("documentType.other");
    }
}

export function getDocumentTypeIcon(
    document_type: MessageDocumentType | DeliveryDocumentType
): IconNames {
    switch (document_type) {
        case "cmr":
        case "cmr4":
        case "ldv":
        case "loading_plan":
            return "commonFileText";
        case "rental":
            return "contract";
        case "washing_note":
            return "bathroomShower";
        case "waste_manifest":
            return "recyclingTrashBin";
        case "flanders_waste_manifest":
            return "recyclingTrashBin";
        case "holders_swap_note":
            return "warehouseCartPackage";
        case "confirmation":
            return "commonFileText";
        case "orc":
            return "invoice";
        case "delivery_note":
            return "shipmentDeliver";
        case "chc":
            return "invoice";
        case "weight_note":
            return "officeFileStampAlternate";
        case "invoice":
            return "accountingInvoice";
        case "load_photo":
            return "shipmentUpload";
        default:
            return "commonFileText";
    }
}

export const DOCUMENT_CATEGORIES_CMR = new Set(["cmr", "cmr4", "ldv"]);

export const cmrHasSignature = (
    document: DeliveryDocument,
    transport: Transport | TransportListWeb
) => {
    const delivery = transport.deliveries.find((delivery) => delivery.uid === document.delivery);

    let transportSitesUids = new Set(transport.segments.map((segment) => segment.origin.uid));
    transportSitesUids.add(transport.segments[transport.segments.length - 1].destination.uid);

    const deliverySitesUids = delivery
        ? new Set([delivery.origin.uid, delivery.destination.uid])
        : new Set();
    // Here we check if the document delivery has been found in the transport.
    // In case of chartering, it used to be not found in the parent transport.
    // But this should not happened anymore, since now, in the backend serializer,
    // we redirect the documents to the deliveries belonging to the transport.

    return transport.status_updates.some((transportStatus) => {
        // We exclude status:
        // - with no signature
        // or
        // - that have been added on sites that do not belong the the document delivery.
        //
        // To check the second point we need to:
        // - have the document delivery sites belonging to the transport
        // - be sure the status site also belongs to the transport.
        //   In case of BUG-2727, we saw that in case of chartering, the status, that is stored
        //   globally in the state, can be linked to the site of a sibling transport.
        //   In this case we can not know if this site is one of the delivery or not.
        // If we do not have these two informations, we will not exclude the status,
        // since we are not sure if it is related to the document or not.
        // We prefer to assess it has a signature if it has not than the reverse.
        if (
            !transportStatus.signature ||
            (deliverySitesUids.size &&
                // @ts-ignore
                transportSitesUids.has(transportStatus.site) &&
                // @ts-ignore
                !deliverySitesUids.has(transportStatus.site))
        ) {
            return false;
        }

        if (
            (transportStatus.signature.signature_method !== "sign_on_paper" &&
                !!transportStatus.signature.signatory_signed_at) ||
            transportStatus.signature.signature_method === "contactless_email"
        ) {
            return true;
        }

        return false;
    });
};

export const getCompanyNamesWhoCanAccessDocument = (
    document: DeliveryDocument,
    transport: Transport
): string[] => {
    let authorizedCompanies: Set<string> = new Set();

    authorizedCompanies.add(transport.created_by.name); // creator

    if (transport.carrier) {
        authorizedCompanies.add(transport.carrier.name); // carrier
    }

    if (transport.customer_to_invoice) {
        authorizedCompanies.add(transport.customer_to_invoice.name);
    }

    if (["orc", "chc"].includes(document.category)) {
        return Array.from(authorizedCompanies);
    }

    // TODO: Identify a shipper by its name seems a bit fragile.
    authorizedCompanies.add(transport.shipper.name); // shipper

    const deliveries = transport.deliveries;
    const deliveryAttachedToDocument = deliveries.find((d) => d.uid === document.delivery);

    if (document.business_privacy_scope === "origin" && getTransportOriginName(transport)) {
        // @ts-ignore
        authorizedCompanies.add(getTransportOriginName(transport)); // origin
    } else if (
        document.business_privacy_scope === "destination" &&
        getTransportDestinationName(transport)
    ) {
        // @ts-ignore
        authorizedCompanies.add(getTransportDestinationName(transport)); // destination
    } else if (deliveryAttachedToDocument) {
        if (
            deliveryAttachedToDocument.origin.address?.company &&
            deliveryAttachedToDocument.origin.address.company.name
        ) {
            authorizedCompanies.add(deliveryAttachedToDocument.origin.address.company.name);
        }

        if (
            deliveryAttachedToDocument.destination.address?.company &&
            deliveryAttachedToDocument.destination.address.company.name
        ) {
            authorizedCompanies.add(deliveryAttachedToDocument.destination.address.company.name);
        }
    } else {
        for (const delivery of deliveries) {
            if (delivery.origin.address?.company && delivery.origin.address.company.name) {
                authorizedCompanies.add(delivery.origin.address.company.name);
            }
            if (
                delivery.destination.address?.company &&
                delivery.destination.address.company.name
            ) {
                authorizedCompanies.add(delivery.destination.address.company.name);
            }
        }
    }

    return Array.from(authorizedCompanies);
};

type MessageDocumentVisibility = {
    visible_by_everyone: boolean;
    readable_by_trucker: boolean;
    readable_by_company_ids: number[];
};

// Get default visibility of a message document according to the rules described here:
// https://www.notion.so/dashdoc/FAQ-Documents-visibility-cfcd0a6eadc64cfca3265253a55d4c26?pvs=4
export const getMessageDocumentDefaultVisibility = (
    documentType: MessageDocumentType,
    transport: Transport
): MessageDocumentVisibility => {
    if (["confirmation", "invoice"].includes(documentType)) {
        // Documents that have price like confirmation and invoice should have restricted visibility.
        // By default, it should only be visible by the stakeholders of the transport
        // that is to say the creator, the carrier, the shipper and the customer to invoice.
        // Activities companies should not be able to see them.
        const includeActivities = false;
        const stakeholders = getAllCompaniesFromTransport(transport, includeActivities);
        const stakeholdersIds = stakeholders.map((company) => company.pk) as number[];
        return {
            visible_by_everyone: false,
            readable_by_trucker: false,
            readable_by_company_ids: stakeholdersIds,
        };
    }

    const allCompanies = getAllCompaniesFromTransport(transport);
    const allCompaniesIds = allCompanies.map((company) => company.pk) as number[];
    return {
        visible_by_everyone: true,
        readable_by_trucker: true,
        readable_by_company_ids: allCompaniesIds,
    };
};
