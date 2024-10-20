import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Card, DocumentDropzone, Text, toast} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import {useDispatch} from "react-redux";

import {InvoiceAttachmentsList} from "app/taxation/invoicing/features/invoice/invoice-attachments/InvoiceAttachmentsList";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

type InvoiceAttachmentsCardProps = {
    invoice: Invoice;
    fromSharing: boolean;
};

export const InvoiceAttachmentsCard: FunctionComponent<InvoiceAttachmentsCardProps> = ({
    invoice,
    fromSharing,
}: InvoiceAttachmentsCardProps) => {
    const dispatch = useDispatch();
    const [fileBeingUploaded, setFileBeingUploaded] = React.useState<File | null>(null);

    const handleUploadDocument = async (file: File, invoice_uid: string) => {
        setFileBeingUploaded(file);
        try {
            const formData = new FormData();
            formData.append("document", file);
            formData.append("invoice_uid", invoice_uid);
            const response = await apiService.post("/invoice-attachments/", formData, {
                apiVersion: "web",
            });
            dispatch({type: "ADD_INVOICE_ATTACHMENT_SUCCESS", payload: {invoice_uid, response}});
        } catch (error) {
            toast.error(t("common.error"));
        }
        setFileBeingUploaded(null);
    };

    const handleDeleteDocument = async (invoice_uid: string, invoice_attachment_uid: string) => {
        try {
            await apiService.delete(`/invoice-attachments/${invoice_attachment_uid}/`, {
                apiVersion: "web",
            });
            dispatch({
                type: "DELETE_INVOICE_ATTACHMENT_SUCCESS",
                payload: {invoice_uid, invoice_attachment_uid},
            });
        } catch (error) {
            toast.error(t("common.error"));
        }
    };

    return (
        <Card p={3} mt={3}>
            <Text variant="h1" mb={3}>
                {t("common.attachedDocuments")}
            </Text>
            <InvoiceAttachmentsList
                attachments={invoice.attachments}
                handleDeleteDocument={(invoice_attachment_uid) =>
                    handleDeleteDocument(invoice.uid, invoice_attachment_uid)
                }
                fromSharing={fromSharing}
            />
            {!fromSharing && (
                <DocumentDropzone
                    file={fileBeingUploaded}
                    loading={!!fileBeingUploaded}
                    onAcceptedFile={(file: File) => handleUploadDocument(file, invoice.uid)}
                    onRemoveFile={() => {
                        setFileBeingUploaded(null);
                    }}
                />
            )}
        </Card>
    );
};
