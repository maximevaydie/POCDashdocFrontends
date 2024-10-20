import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, IconButton, Link, NoWrap, Text} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import React, {useState} from "react";

import DocumentModal from "app/features/document/DocumentModal";
import {InvoiceAttachment} from "app/taxation/invoicing/types/invoice.types";

type InvoiceAttachmentsListProps = {
    attachments: InvoiceAttachment[];
    handleDeleteDocument: (invoice_attachment_uid: string) => void;
    fromSharing: boolean;
};

export const InvoiceAttachmentsList = ({
    attachments,
    handleDeleteDocument,
    fromSharing,
}: InvoiceAttachmentsListProps) => {
    const timezone = useTimezone();
    const [previewedDocument, setPreviewedDocument] = useState<InvoiceAttachment | null>(null);
    return (
        <>
            <Flex mx={3} my={3} flexDirection={"column"}>
                {attachments.map((attachment: InvoiceAttachment) => {
                    return (
                        <Flex key={attachment.uid} mb={0} alignItems={"center"}>
                            <Flex my={1} maxWidth={"50%"}>
                                <Link
                                    onClick={setPreviewedDocument.bind(undefined, attachment)}
                                    data-testid="attached-document-link"
                                >
                                    <NoWrap>{attachment.name}</NoWrap>
                                </Link>
                            </Flex>
                            <Box
                                borderBottom={"1px dashed"}
                                borderBottomColor="grey.light"
                                flex={1}
                                minWidth={4}
                                mx={3}
                            />
                            <Text>
                                {t("common.addedOnDateAtTime", {
                                    date: formatDate(
                                        parseAndZoneDate(attachment.created, timezone),
                                        "P"
                                    ),
                                    time: formatDate(
                                        parseAndZoneDate(attachment.created, timezone),
                                        "p"
                                    ),
                                })}
                            </Text>
                            {!fromSharing && (
                                <IconButton
                                    name="bin"
                                    color="red.default"
                                    onClick={() => handleDeleteDocument(attachment.uid)}
                                    data-testid="attached-document-delete-button"
                                    withConfirmation
                                    confirmationMessage={t("components.confirmDeleteDocument")}
                                    modalProps={{
                                        title: t("components.deleteDocument"),
                                        mainButton: {
                                            children: t("common.delete"),
                                            "data-testid": "document-delete-confirmation-button",
                                        },
                                    }}
                                />
                            )}
                        </Flex>
                    );
                })}
            </Flex>
            {previewedDocument && (
                <DocumentModal
                    documents={[{label: previewedDocument.name, url: previewedDocument.file_url}]}
                    onClose={setPreviewedDocument.bind(undefined, null)}
                />
            )}
        </>
    );
};

//
