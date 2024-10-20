import {getDeliveryDocumentName, t} from "@dashdoc/web-core";
import {Flex, Icon, LoadingWheel, Text, UploadButton} from "@dashdoc/web-ui";
import {
    DeliveryDocumentType,
    DeliveryDocument,
    TransportMessage,
    MessageDocumentType,
} from "dashdoc-utils";
import React from "react";

import {getDocumentTypeLabel} from "app/services/transport/documents.service";

import type {Transport} from "app/types/transport";

function MissingTransportDocumentRow() {
    return (
        <Flex>
            <Text mr={2} width="40px">
                {getDocumentTypeLabel("ldv")}
            </Text>
            <Text fontWeight="bold" color="red.default">
                {t("updateLateTransports.missing")}
            </Text>
        </Flex>
    );
}

function TransportDocument({
    transport,
    document,
}: {
    transport: Transport;
    document: DeliveryDocument | TransportMessage | undefined;
}) {
    const documentType: MessageDocumentType | DeliveryDocumentType =
        (document as TransportMessage).document_type || (document as DeliveryDocument).category;

    // @ts-ignore
    const title: React.ReactElement = document ? (
        <Text fontWeight="bold">
            {(document as Transport["messages"][0]).reference ||
                getDeliveryDocumentName(
                    document as Transport["documents"][0],
                    transport.deliveries
                )}
        </Text>
    ) : null;

    return (
        <Flex alignItems="center">
            <Text mr={2} width="40px">
                {getDocumentTypeLabel(documentType)}
            </Text>
            {title}
        </Flex>
    );
}

type Props = {
    transport: Transport;
    isLoading: boolean;
    onAddDocument?: ((files: FileList) => void) | null;
};

export function TransportDocuments({transport, isLoading, onAddDocument}: Props) {
    const numberOfDeliveryDocuments = [
        ...transport.documents.filter((document) =>
            ["cmr", "cmr4", "ldv"].includes(document.category)
        ),
        ...transport.messages.filter((message) => message.document_type === "cmr"),
    ].length;

    const missingDocuments = Array.from(
        {length: transport.deliveries.length - numberOfDeliveryDocuments},
        (_element, i) => <MissingTransportDocumentRow key={`missing-${i}`} />
    );

    const documents = [...transport.documents, ...transport.messages].map((document, index) => (
        <TransportDocument transport={transport} document={document} key={`document-${index}`} />
    ));

    return (
        <Flex flexDirection="column" mb={5} data-testid="late-transport-documents">
            <Flex flexWrap="wrap">
                <Flex>
                    <Text mr={2} variant="title">
                        {t("updateLateTransports.transportDocuments")}
                    </Text>
                </Flex>
                {onAddDocument && (
                    <UploadButton
                        buttonDataTestId="late-transport-upload-document-button"
                        variant="secondary"
                        onFileChange={onAddDocument}
                        accept="image/*,.pdf"
                        disabled={isLoading}
                    >
                        <Icon mr={1} name="add" fontSize={1} />
                        {t("updateLateTransports.addCN")}
                    </UploadButton>
                )}
            </Flex>
            {isLoading ? (
                <LoadingWheel />
            ) : (
                <>
                    {missingDocuments}
                    {documents}
                </>
            )}
        </Flex>
    );
}
