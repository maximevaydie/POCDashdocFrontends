import {
    getConnectedCompanyId,
    getConnectedManager,
    useTimezone,
    utilsService,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {DocumentDropzone, Flex, Icon, IconButton, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import styled from "@emotion/styled";
import {
    DeliveryDocument,
    Manager,
    TransportMessage,
    TransportMessagePost,
    formatDate,
    parseAndZoneDate,
} from "dashdoc-utils";
import React from "react";
import {connect} from "react-redux";

import {documentAnalyticsService} from "app/features/document/documentAnalytics.service";
import DocumentModal from "app/features/document/DocumentModal";
import {fetchDeleteMessage, fetchUpdateMessage} from "app/redux/actions";
import {RootState} from "app/redux/reducers/index";
import {
    DOCUMENT_CATEGORIES_CMR,
    cmrHasSignature,
    getCompanyNamesWhoCanAccessDocument,
    getCompanyNamesWhoCanAccessMessage,
    getDocumentTypeIcon,
    getDocumentTypeLabel,
} from "app/services/transport";

import {AddDocumentModal} from "./add-document-modal";
import {UpdateDocumentModal} from "./update-document-modal";

import type {Transport, Delivery} from "app/types/transport";

const typeColumnStyle = css`
    width: 65px;
`;

const referenceColumnStyle = css`
    min-width: 80px;
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

const dateColumnStyle = css`
    width: 100px;
`;

const visibilityColumnStyle = css`
    width: 100px;
`;

const actionColumnStyle = css`
    width: 40px;
    cursor: pointer;

    & * {
        cursor: pointer;
    }
`;

const positionColumnStyle = css`
    width: 35px;
`;

const DraftSpan = styled("span")`
    margin-right: 3px;
`;

interface Document {
    type: DeliveryDocument["category"] | TransportMessage["document_type"];
    label: string;
    position: {latitude: number | null; longitude: number | null};
    date: string | null;
    draft?: boolean;
    mlDocumentIdentification?: string;
}

export type DocumentRowProps = {
    doc: Document;
    authorizedCompanies: string[];
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    onUpdateClick?: (event: React.MouseEvent<HTMLElement>) => void;
    onDeleteClick?: (event: React.MouseEvent<HTMLElement>) => void;
    ["data-testid"]?: string;
};

export type ExtraRowType = DocumentRowProps & {key: string};

function DocumentRow({
    doc,
    authorizedCompanies,
    onClick,
    onUpdateClick,
    onDeleteClick,
}: DocumentRowProps) {
    const timezone = useTimezone();
    return (
        <StyledTableRow data-testid={`document-row-${doc.type}`}>
            <td css={typeColumnStyle}>
                <Flex fontSize="12px" alignItems="center">
                    <Icon
                        name={getDocumentTypeIcon(doc.type)}
                        mr={1}
                        width="1.5em"
                        height="1.5em"
                        svgWidth="100%"
                        svgHeight="100%"
                    />
                    <span>{getDocumentTypeLabel(doc.type)}</span>
                    {doc.type === "cmr" && doc.mlDocumentIdentification === "non_cmr" && (
                        <TooltipWrapper content={t("identifyPaperCmr.nonCmrWarning")}>
                            <Icon name="warning" ml={1} color="yellow.default" />
                        </TooltipWrapper>
                    )}
                </Flex>
            </td>
            {doc.position.latitude && doc.position.longitude ? (
                <td css={positionColumnStyle}>
                    <Icon name="address" />
                </td>
            ) : (
                <td css={positionColumnStyle} />
            )}
            <td css={referenceColumnStyle}>
                {doc.draft && (
                    <DraftSpan className="label label-default label-lg">
                        {t("deliveryDocument.draft")}
                    </DraftSpan>
                )}
                <a
                    onClick={onClick}
                    style={{cursor: "pointer"}}
                    data-testid={"document-" + doc.type}
                >
                    {doc.label}
                </a>
            </td>
            <td css={dateColumnStyle}>
                <span style={{fontSize: "12px"}}>
                    {formatDate(parseAndZoneDate(doc.date, timezone), "Pp")}
                </span>
            </td>
            <td css={visibilityColumnStyle}>
                <TooltipWrapper content={authorizedCompanies.join(", ")} placement="top">
                    <Flex>
                        <Icon name="eye" mr={1} mt={"auto"} mb={"auto"} />
                        <Text variant="caption">
                            {t("common.companiesCount", {smart_count: authorizedCompanies.length})}
                        </Text>
                    </Flex>
                </TooltipWrapper>
            </td>
            {(onUpdateClick && (
                <td css={actionColumnStyle}>
                    <TooltipWrapper content={t("components.updateDocument")}>
                        <IconButton
                            name="edit"
                            onClick={onUpdateClick}
                            data-testid="document-row-update-button"
                        />
                    </TooltipWrapper>
                </td>
            )) || <td css={actionColumnStyle} />}
            {(onDeleteClick && (
                <td css={actionColumnStyle}>
                    <TooltipWrapper content={t("components.deleteDocument")}>
                        <IconButton
                            name="delete"
                            onClick={onDeleteClick}
                            data-testid="document-row-delete-button"
                            withConfirmation
                            confirmationMessage={t("components.confirmDeleteDocument")}
                            modalProps={{
                                title: t("components.deleteDocument"),
                                mainButton: {
                                    children: t("common.delete"),
                                    "data-testid": "document-delete-confirmation-button",
                                },
                            }}
                        ></IconButton>
                    </TooltipWrapper>
                </td>
            )) || <td css={actionColumnStyle} />}
        </StyledTableRow>
    );
}

interface OwnProps {
    deliveryDocuments: DeliveryDocument[];
    messageDocuments: TransportMessage[];
    transport: Transport;
    readOnly: boolean;
    fetchAddDocument?: (transportUid: string, payload: TransportMessagePost) => any;
    extraRows?: ExtraRowType[];
    maxFileSize?: number;
}

interface StateProps {
    companyPk: number | null;
    connectedManager: Manager | null;
}

interface DispatchProps {
    fetchDeleteMessage: (document: {
        uid: string;
        deliveryUid: string | null;
        transportUid: string;
    }) => any;
    fetchUpdateMessage: (document: Partial<TransportMessage>) => any;
}

type DocumentsPanelProps = OwnProps & StateProps & DispatchProps;
type DocumentTransportDeliveryMessage = TransportMessage & {
    delivery: string | null;
    transport?: string;
};

interface DocumentsPanelState {
    showDocumentModal?: boolean;
    documentModalIndex?: number;
    updateDocumentModal: DocumentTransportDeliveryMessage | null;
    addDocumentModalOpen: boolean;
    file: File | null;
}

const StyledTable = styled("table")<{showInput: boolean}>`
    display: flex;
    height: calc(100% - ${(props: any) => (props.showInput ? "150px" : "40px")});
    flex-flow: column;
    overflow: hidden;
`;

const StyledTableHeader = styled("thead")`
    display: table;
    table-layout: fixed;
    flex: 0 0 auto;
    width: calc(100% - 10px); // scrollbar width
`;

const StyledTableBody = styled("tbody")`
    table-layout: fixed;
    display: block;
    flex: 1 1 auto;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
`;

const StyledTableRow = styled("tr")`
    display: table;
    table-layout: fixed;
    width: calc(100% - 10px); // scrollbar width
    min-width: 400px;
`;

class DocumentsPanelComponent extends React.Component<DocumentsPanelProps, DocumentsPanelState> {
    constructor(props: DocumentsPanelProps) {
        super(props);
        this.state = {
            showDocumentModal: false,
            updateDocumentModal: null,
            addDocumentModalOpen: false,
            file: null, // dropzone fails with null
        };
    }

    handleUpdateDocumentClick = (doc: DocumentTransportDeliveryMessage) => {
        this.setState({updateDocumentModal: doc});
    };

    handleDeleteDocumentClick = (doc: DocumentTransportDeliveryMessage) => {
        this.props.fetchDeleteMessage({
            uid: doc.uid,
            deliveryUid: doc.delivery,
            transportUid: doc.transport,
        });
    };

    handleDocumentDrop = (file: File) => {
        this.setState({file: file, addDocumentModalOpen: true});
    };

    handleDeliveryDocumentOpen = (doc: DeliveryDocument, index: number) => {
        documentAnalyticsService.sendDocumentModalOpenedAnalyticsEvent(
            this.props.connectedManager?.user,
            this.props.companyPk ?? undefined,
            "transport_details_documents_panel"
        );
        if (utilsService.isDeviceIos()) {
            // iframes are weird on iOS
            window.open(doc.file);
        } else {
            this.setState({
                showDocumentModal: true,
                documentModalIndex: index,
            });
        }
    };

    handleDocumentOpen = (doc: TransportMessage, index: number) => {
        documentAnalyticsService.sendDocumentModalOpenedAnalyticsEvent(
            this.props.connectedManager?.user,
            this.props.companyPk ?? undefined,
            "transport_details_documents_panel"
        );
        if (utilsService.isDeviceIos()) {
            // iframes are weird on iOS
            window.open(doc.document);
        } else {
            this.setState({
                showDocumentModal: true,
                documentModalIndex: this.props.deliveryDocuments.length + index,
            });
        }
    };

    getDeliveryDocumentName = (doc: DeliveryDocument) => {
        const cancelledPrefix = doc.cancelled ? `(${t("components.cancelled")})` : "";

        if (DOCUMENT_CATEGORIES_CMR.has(doc.category)) {
            // @ts-ignore
            const delivery: Delivery = this.props.transport.deliveries.find(
                ({uid}) => uid === doc.delivery
            );

            const cancelledPrefix = doc.cancelled ? `(${t("components.cancelled")})` : "";

            const emptyPrefix = !cmrHasSignature(doc, this.props.transport)
                ? `${t("common.emptyInstructions")} `
                : "";

            let documentName = `${cancelledPrefix} ${emptyPrefix} ${getDocumentTypeLabel(
                doc.category
            )} ${doc.reference}`;
            if (delivery) {
                documentName += ` ${this.props.transport.shipper.name} - ${
                    delivery.origin?.address?.city ?? ""
                } ▸ ${delivery.destination?.address?.city ?? ""}`;
            }
            return documentName;
        } else if (doc.category === "rental") {
            return `${cancelledPrefix} ${t("deliveryDocumentType.rentalOrder", {
                reference: doc.reference,
                clientName: this.props.transport.shipper.name || "",
            })}`;
        } else if (doc.category === "chc") {
            const mostRecentCharteringConfirmationDocumentPk =
                this.getMostRecentCharteringConfirmationDocumentPk();
            return `${
                mostRecentCharteringConfirmationDocumentPk !== doc.pk
                    ? `(${t("components.cancelled")})`
                    : ""
            }${t("deliveryDocumentType.charterConfirmationNumber", {
                number: this.props.transport.sequential_id,
            })}`;
        } else if (doc.category === "orc") {
            return t("deliveryDocumentType.orderConfirmation");
        } else if (doc.category === "loading_plan") {
            return t("deliveryDocumentType.loadingPlan");
        } else if (doc.category === "flanders_waste_manifest") {
            return doc.name;
        }

        return "Document";
    };

    getMostRecentCharteringConfirmationDocumentPk = (): number | null => {
        const {deliveryDocuments} = this.props;

        let mostRecentCharteringConfirmationDocumentPk = null;
        // Delivery documents are already sorted by creation date so we just have to get the last "chc" in the list
        for (const deliveryDocument of deliveryDocuments) {
            if (deliveryDocument.category === "chc") {
                mostRecentCharteringConfirmationDocumentPk = deliveryDocument.pk;
            }
        }

        return mostRecentCharteringConfirmationDocumentPk;
    };

    _renderDeliveryDocument = (doc: DeliveryDocument, index: number) => {
        const name = this.getDeliveryDocumentName(doc);
        const authorizedCompanies = getCompanyNamesWhoCanAccessDocument(doc, this.props.transport);
        return (
            <DocumentRow
                key={doc.pk}
                doc={{
                    type: doc.category,
                    label: name,
                    position: {latitude: null, longitude: null},
                    date: doc.file_updated_date ?? null,
                    draft: doc.draft,
                }}
                authorizedCompanies={authorizedCompanies}
                onClick={() => this.handleDeliveryDocumentOpen(doc, index)}
            />
        );
    };

    _renderTransportMessage = (doc: TransportMessage, index: number) => {
        const showButtons =
            doc.author_company_id && doc.author_company_id === this.props.companyPk;
        const authorizedCompanies = getCompanyNamesWhoCanAccessMessage(
            this.props.transport,
            doc.readable_by_company_ids
        );

        let siteName = null;
        for (const delivery of this.props.transport.deliveries) {
            if (delivery.origin.uid === doc.site) {
                siteName = delivery.origin.address?.city;
                break;
            }

            if (delivery.destination.uid === doc.site) {
                siteName = delivery.destination.address?.city;
                break;
            }
        }
        let label = "Document";
        if (doc.reference) {
            label = doc.reference;
        } else if (doc.document_title) {
            label = doc.document_title;
        } else if (siteName) {
            label = `Document - ${siteName}`;
        }

        return (
            <DocumentRow
                key={doc.uid}
                doc={{
                    type: doc.document_type,
                    label,
                    position: {latitude: doc.latitude, longitude: doc.longitude},
                    date: doc.created,
                    mlDocumentIdentification: doc.ml_document_identification,
                }}
                authorizedCompanies={authorizedCompanies}
                onClick={() => this.handleDocumentOpen(doc, index)}
                onUpdateClick={showButtons ? () => this.handleUpdateDocumentClick(doc) : undefined}
                onDeleteClick={showButtons ? () => this.handleDeleteDocumentClick(doc) : undefined}
            />
        );
    };

    _renderExtraRow = (documentRow: ExtraRowType) => {
        return <DocumentRow {...documentRow} key={documentRow.key} />;
    };

    render = () => {
        return (
            <div className="row" style={{height: "100%"}}>
                {!this.props.readOnly && this.props.fetchAddDocument && (
                    <div className="col-md-12">
                        <DocumentDropzone
                            file={this.state.file}
                            onAcceptedFile={this.handleDocumentDrop}
                            onRemoveFile={() => this.setState({file: null})}
                            maxFileSize={this.props.maxFileSize}
                        />
                    </div>
                )}
                <StyledTable
                    showInput={!this.props.readOnly}
                    className="col-md-12 table table-hover"
                >
                    <StyledTableHeader>
                        <StyledTableRow>
                            <th scope="col" css={typeColumnStyle}>
                                {t("common.type")}
                            </th>
                            <th scope="col" css={positionColumnStyle} />
                            <th scope="col" css={referenceColumnStyle}>
                                {t("documentPanel.nameOrReference")}
                            </th>
                            <th scope="col" css={dateColumnStyle}>
                                {t("common.date")}
                            </th>
                            <th scope="col" css={visibilityColumnStyle}>
                                {t("common.visibility")}
                            </th>
                            <th scope="col" css={actionColumnStyle} />
                            <th scope="col" css={actionColumnStyle} />
                        </StyledTableRow>
                    </StyledTableHeader>
                    <StyledTableBody data-testid="documents-panel-table-body">
                        {this.props.deliveryDocuments.map(this._renderDeliveryDocument)}
                        {this.props.messageDocuments &&
                            this.props.messageDocuments.map(this._renderTransportMessage)}
                        {/* Render purely virtual documents, created out of thin air
                            by the UI until we find a better way to do this. */}
                        {this.props.extraRows && this.props.extraRows.map(this._renderExtraRow)}
                    </StyledTableBody>
                </StyledTable>

                {this.state.showDocumentModal && (
                    <DocumentModal
                        onClose={() => this.setState({showDocumentModal: false})}
                        readOnly={this.props.readOnly}
                        // @ts-ignore
                        documents={[
                            ...this.props.deliveryDocuments.map((doc) => {
                                return {
                                    url: doc.file,
                                    deliveryUid: doc.delivery,
                                    showInIFrame: true,
                                    label: doc.reference,
                                    cancelled: doc.cancelled,
                                };
                            }),
                            ...this.props.messageDocuments.map((doc) => {
                                return {
                                    url: doc.document,
                                    latitude: doc.latitude,
                                    longitude: doc.longitude,
                                    label: doc.reference,
                                    type: doc.document_type,
                                    mlDocumentIdentification: doc.ml_document_identification,
                                    reference: doc.reference,
                                    extractedReference: doc.extracted_reference,
                                    authorCompanyId: doc.author_company_id,
                                    messageUid: doc.uid,
                                };
                            }),
                        ]}
                        documentIndex={this.state.documentModalIndex}
                    />
                )}
                {this.state.addDocumentModalOpen && this.state.file !== null && (
                    <AddDocumentModal
                        file={this.state.file}
                        transport={this.props.transport}
                        onClose={() => this.setState({addDocumentModalOpen: false, file: null})}
                        // @ts-ignore
                        onSendDocument={this.props.fetchAddDocument}
                    />
                )}

                {this.state.updateDocumentModal && (
                    <UpdateDocumentModal
                        transport={this.props.transport}
                        document={this.state.updateDocumentModal}
                        deleteDocument={this.props.fetchDeleteMessage}
                        // @ts-ignore
                        onClose={() => this.setState({updateDocumentModal: null})}
                        onUpdateDocument={this.props.fetchUpdateMessage}
                    />
                )}
            </div>
        );
    };
}

const mapStateToProps = (state: RootState) => ({
    companyPk: getConnectedCompanyId(state),
    connectedManager: getConnectedManager(state),
});

export const DocumentsPanel = connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, {
    fetchUpdateMessage,
    fetchDeleteMessage,
})(DocumentsPanelComponent);
