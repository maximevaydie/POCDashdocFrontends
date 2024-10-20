import {t} from "@dashdoc/web-core";
import {Modal, toast} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {TransportMessagePost} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";

import {DocumentOptionsForm, DocumentValues} from "app/features/document/document-options-form";
import {getAllCompaniesFromTransport} from "app/services/transport";

import type {Transport} from "app/types/transport";

interface AddDocumentModalProps {
    file: File;
    onSendDocument: (transportUid: string, payload: any) => Promise<any>;
    onClose: () => void;
    transport: Transport;
}

export const AddDocumentModal: FunctionComponent<AddDocumentModalProps> = ({
    file,
    onSendDocument,
    onClose,
    transport,
}) => {
    const [loading, setLoading] = useState(false);

    const documentInitialValues: DocumentValues = {
        document_type: "",
        reference: "",
        site: null,
        readable_by_company_ids: getAllCompaniesFromTransport(transport).map(
            (company) => company.pk
        ) as number[],
        visible_by_everyone: true,
        readable_by_trucker: true,
    };

    const handleSubmit = async (values: DocumentValues) => {
        setLoading(true);
        let documentPayload: TransportMessagePost = {
            document: file,
            type: "document",
            document_type: values.document_type,
            document_title: file ? file.name : "",
            reference: values.reference,
            site: values.site,
            visible_by_everyone: values.visible_by_everyone,
            readable_by_trucker: values.readable_by_trucker,
        };

        if (values.visible_by_everyone === false) {
            documentPayload.readable_by_company_ids = values.readable_by_company_ids;
        }

        try {
            await onSendDocument(transport.uid, documentPayload);
        } catch (error) {
            toast.error(t("errors.documentUploadFailed"));
        }

        setLoading(false);
        onClose();
    };

    return (
        <Modal
            title={t("components.addDocument")}
            id="add-document-modal"
            onClose={onClose}
            data-testid="add-document-modal"
            mainButton={{
                type: "submit",
                form: "add-document-form",
                "data-testid": "document-options-form-save-button",
                children: t("common.save"),
                disabled: loading,
            }}
        >
            {loading ? (
                <LoadingWheel />
            ) : (
                <DocumentOptionsForm
                    formId="add-document-form"
                    transport={transport}
                    documentInitialValues={documentInitialValues}
                    onSubmit={handleSubmit}
                />
            )}
        </Modal>
    );
};
