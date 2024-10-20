import {DeliveryDocumentType, TransportMessage, MessageDocumentType} from "dashdoc-utils";

import {DisplayableDocument} from "app/features/document/DocumentModal";

import type {Invoice, InvoiceLineGroup} from "app/taxation/invoicing/types/invoice.types";
import type {
    InvoiceLine,
    InvoiceTransport,
    LineGroup,
} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

type DocumentType = MessageDocumentType | DeliveryDocumentType;
export type DisplayableDocumentDict = {
    [documentType in DocumentType]?: DisplayableDocument[];
};

function getTransportDocumentsDict(
    transport: InvoiceTransport,
    realTimeMessages: TransportMessage[]
): DisplayableDocumentDict {
    let allDocuments: DisplayableDocumentDict = {};

    for (const invoiceTransportMessage of transport.messages) {
        // When we update a document through the document modal, it adds or updates the message
        // in the state transportMessage entities but does not update the one in the state invoiceLineGroups search.
        // So here we build the documents by looking first at the message in state transportMessage entities.
        const realTimeMessage = realTimeMessages.find(
            ({uid}) => uid === invoiceTransportMessage.uid
        );

        const message = realTimeMessage || invoiceTransportMessage;
        const document_type: MessageDocumentType = message.document_type;

        if (allDocuments[document_type] === undefined) {
            allDocuments[document_type] = [
                {
                    url: message.document,
                    label: message.reference,
                    reference: message.reference,
                    extractedReference: message.extracted_reference,
                    authorCompanyId: message.author_company_id,
                    messageUid: message.uid,
                },
            ];
        } else {
            // @ts-ignore
            allDocuments[document_type].push({
                url: message.document,
                label: message.reference,
                reference: message.reference,
                extractedReference: message.extracted_reference,
                authorCompanyId: message.author_company_id,
                messageUid: message.uid,
            });
        }
    }

    for (const doc of transport.documents) {
        const category: DeliveryDocumentType = ["ldv", "cmr4"].includes(doc.category)
            ? "cmr"
            : doc.category;

        if (allDocuments[category] === undefined) {
            // @ts-ignore
            allDocuments[category] = [
                {
                    url: doc.file,
                    deliveryUid: doc.delivery,
                    showInIFrame: true,
                    label: doc.reference,
                },
            ];
        } else {
            // @ts-ignore
            allDocuments[category].push({
                url: doc.file,
                deliveryUid: doc.delivery,
                showInIFrame: true,
                label: doc.reference,
            });
        }
    }
    return allDocuments;
}

function isMergedByAllGroups(invoice: Invoice) {
    return invoice.merge_by === "ALL_GROUPS";
}

function isFullyMerged(invoice: Invoice) {
    return (
        invoice.merge_by !== null &&
        invoice.merge_by !== "NONE" &&
        invoice.line_groups.length === 0
    );
}

function getAllLines(invoice: Invoice): InvoiceLine[] {
    const allLines = getAllLineGroups(invoice)
        .flatMap((line_group) => line_group.lines)
        .concat(invoice.lines);
    return allLines;
}

function getAllLineGroups(invoice: Invoice): InvoiceLineGroup[] {
    const invoiceLineGroups = invoice.line_groups.concat(
        invoice.transports_groups_in_invoice.flatMap(
            (transports_group) => transports_group.line_groups
        )
    );
    return invoiceLineGroups;
}

function computeLineGroupsSummedGrossPrice(lineGroups: LineGroup[]): number {
    const result: number = lineGroups.reduce((acc: number, lineGroup: LineGroup): number => {
        return acc + parseFloat(lineGroup.total_price_without_tax);
    }, 0);
    return result;
}

export const invoiceLineService = {
    getTransportDocumentsDict,
    isMergedByAllGroups,
    isFullyMerged,
    computeLineGroupsSummedGrossPrice,
    getAllLines,
    getAllLineGroups,
};
