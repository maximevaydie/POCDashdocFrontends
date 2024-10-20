import {t} from "@dashdoc/web-core";
import {Modal} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {TransportMessage} from "dashdoc-utils";
import React from "react";

import {DocumentOptionsForm, DocumentValues} from "app/features/document/document-options-form";

import type {Transport} from "app/types/transport";

type UpdateDocumentModalProps = {
    document: TransportMessage & {delivery: string | null; transport?: string};
    onUpdateDocument: (document: Partial<TransportMessage>) => any;
    deleteDocument: (document: {
        uid: string;
        deliveryUid: string | null;
        transportUid: string;
    }) => any;
    onClose: () => void;
    transport: Transport;
};

type UpdateDocumentModalState = {
    loading: boolean;
};

export class UpdateDocumentModal extends React.Component<
    UpdateDocumentModalProps,
    UpdateDocumentModalState
> {
    constructor(props: UpdateDocumentModalProps) {
        super(props);
        this.state = {
            loading: false,
        };
    }

    handleSubmit = async (values: DocumentValues) => {
        this.setState({loading: true});
        try {
            await this.props.onUpdateDocument({
                uid: this.props.document.uid,
                type: "document",
                document_type: values.document_type,
                reference: values.reference,
                readable_by_company_ids: values.visible_by_everyone
                    ? undefined
                    : values.readable_by_company_ids,
                site: values.site,
                visible_by_everyone: values.visible_by_everyone,
                readable_by_trucker: values.readable_by_trucker,
            });
            this.props.onClose();
        } finally {
            this.setState({loading: false});
        }
    };

    handleDocumentDelete = async () => {
        this.setState({loading: true});
        try {
            await this.props.deleteDocument({
                uid: this.props.document.uid,
                deliveryUid: this.props.document.delivery,
                transportUid: this.props.document.transport,
            });
            this.props.onClose();
        } finally {
            this.setState({loading: false});
        }
    };

    render = () => {
        const {document} = this.props;
        const documentInitialValues: DocumentValues = {
            document_type: document.document_type,
            reference: document.reference,
            site: document.site,
            readable_by_company_ids: document.readable_by_company_ids,
            visible_by_everyone: document.visible_by_everyone,
            readable_by_trucker: document.readable_by_trucker,
        };

        return (
            <Modal
                title={t("components.updateDocument")}
                id="update-document-modal"
                onClose={this.props.onClose}
                data-testid="update-document-modal"
                mainButton={{
                    type: "submit",
                    form: "update-document-form",
                    "data-testid": "document-options-form-save-button",
                    children: t("common.save"),
                }}
                secondaryButton={
                    // @ts-ignore
                    this.props.deleteDocument
                        ? {
                              type: "button",
                              severity: "danger",
                              withConfirmation: true,
                              confirmationMessage: t("components.confirmDeleteDocument"),
                              modalProps: {
                                  title: t("components.deleteDocument"),
                                  mainButton: {
                                      children: t("common.delete"),
                                  },
                              },
                              onClick: this.handleDocumentDelete,
                              "data-testid": "document-options-form-delete-button",
                              children: t("common.delete"),
                          }
                        : {}
                }
            >
                {this.state.loading ? (
                    <LoadingWheel />
                ) : (
                    <DocumentOptionsForm
                        key={document.uid}
                        formId="update-document-form"
                        transport={this.props.transport}
                        documentInitialValues={documentInitialValues}
                        onSubmit={this.handleSubmit}
                        extractedReference={document.extracted_reference}
                    />
                )}
            </Modal>
        );
    };
}
