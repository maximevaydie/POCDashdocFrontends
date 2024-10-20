import {getConnectedCompanyId, utilsService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    Icon,
    IconButton,
    IFrame,
    ImageViewer,
    Link,
    LoadingWheel,
    Modal,
    Text,
} from "@dashdoc/web-ui";
import {TransportMessage} from "dashdoc-utils";
import React from "react";
import {connect} from "react-redux";

import {fetchUpdateMessage, fetchUpdatePdf} from "app/redux/actions";
import {RootState} from "app/redux/reducers/index";

import {DocumentGeolocation} from "./DocumentGeolocation";
import {ExtractedReference} from "./ExtractedReference";

export interface DisplayableDocumentCommon {
    url: string;
    deliveryUid?: string;
    showInIFrame?: boolean;
    latitude?: number;
    longitude?: number;
    label: string | null;
    type?: string;
    mlDocumentIdentification?: string;
    cancelled?: string | null;
}

export interface DisplayableDocumentMessageWithReference extends DisplayableDocumentCommon {
    reference: string;
    extractedReference: string | null;
    authorCompanyId: number | null | undefined;
    messageUid: string;
}

export type DisplayableDocument =
    | DisplayableDocumentCommon
    | DisplayableDocumentMessageWithReference;

interface OwnProps {
    documents: DisplayableDocument[];
    documentIndex?: number;
    readOnly?: boolean;
    onClose: () => void;
}

interface StateProps {
    companyPk: number | null;
}

interface DispatchProps {
    fetchUpdatePdf: Function;
    fetchUpdateMessage: (document: Partial<TransportMessage>) => any;
}

type DocumentModalProps = OwnProps & StateProps & DispatchProps;

interface DocumentModalState {
    iframeLoading: boolean;
    documentIndex: number;
    download: boolean;
    isButtonLoading: boolean;
    rotation: number;
    zoom: number;
    squareWidth: number;
}

class DocumentModal extends React.Component<DocumentModalProps, DocumentModalState> {
    constructor(props: DocumentModalProps) {
        super(props);

        const documentIndex = this.props.documentIndex || 0;
        const document = this.props.documents[documentIndex];

        this.state = {
            documentIndex: documentIndex,
            iframeLoading:
                props.documents && document
                    ? !!document.deliveryUid ||
                      document.showInIFrame ||
                      !utilsService.isImage(document.url)
                    : false,
            download:
                props.documents && document
                    ? !document.deliveryUid &&
                      !document.showInIFrame &&
                      utilsService.isDownload(document.url)
                    : false,
            isButtonLoading: false,
            rotation: 0,
            zoom: 1,
            // @ts-ignore
            squareWidth: null,
        };
    }

    handleIframeLoaded = () => {
        this.setState({iframeLoading: false});
        if (this.state.download) {
            setTimeout(this.props.onClose, 1000);
        }
    };

    handleUpdate = () => {
        this.setState({isButtonLoading: true});
        this.props
            .fetchUpdatePdf(this.props.documents[this.state.documentIndex].deliveryUid)
            .then(() => {
                this.setState({isButtonLoading: false});
                // Forces iframe to reload
                $("#pdf-frame").attr("src", function (_i: number, val: any) {
                    return val;
                });
            });
    };

    cycleDocument = (indexDelta: number) => {
        let newIndex = this.state.documentIndex + indexDelta;
        if (newIndex < 0) {
            this.setState({documentIndex: this.props.documents.length - 1});
        } else if (newIndex >= this.props.documents.length) {
            this.setState({documentIndex: 0});
        } else {
            this.setState({documentIndex: newIndex});
        }
    };

    getDocumentIndexLabel = () => {
        if (!this.props.documents || this.props.documents.length <= 1) {
            return "";
        }
        return ` - ${this.state.documentIndex + 1} / ${this.props.documents.length}`;
    };

    getDocumentReferenceLabel = () => {
        if (!this.props.documents || !this.props.documents[this.state.documentIndex].label) {
            return "";
        }
        return ` - ${this.props.documents[this.state.documentIndex].label}`;
    };

    render = () => {
        const multipleDocuments = this.props.documents && this.props.documents.length > 1;

        const doc =
            this.props.documents?.length > this.state.documentIndex
                ? this.props.documents[this.state.documentIndex]
                : null;

        return (
            <Modal
                title={`${t(
                    "components.attachedDocument"
                )}${this.getDocumentIndexLabel()}${this.getDocumentReferenceLabel()}`}
                id="document-modal"
                size="xlarge"
                onClose={this.props.onClose}
                mainButton={
                    // @ts-ignore
                    !this.props.readOnly && !doc.cancelled && doc.deliveryUid
                        ? {
                              onClick: this.handleUpdate,
                              loading: this.state.isButtonLoading,
                              children: t("common.update"),
                          }
                        : null
                }
                secondaryButton={null}
            >
                {/*
// @ts-ignore */}
                {"reference" in doc &&
                    // @ts-ignore
                    doc.authorCompanyId &&
                    // @ts-ignore
                    doc.authorCompanyId === this.props.companyPk && (
                        <ExtractedReference
                            // @ts-ignore
                            reference={doc.reference}
                            // @ts-ignore
                            extractedReference={doc.extractedReference}
                            onUseButtonClick={() =>
                                this.props.fetchUpdateMessage({
                                    // @ts-ignore
                                    uid: doc.messageUid,
                                    // @ts-ignore
                                    reference: doc.extractedReference,
                                })
                            }
                            displayedFrom="document_modal"
                            mt={-5}
                            mx={-5}
                            mb={2}
                            pl={5}
                            pr={6}
                        />
                    )}
                <Box
                    pr={multipleDocuments ? "2em" : 0}
                    pl={multipleDocuments ? "2em" : 0}
                    position="relative"
                >
                    {multipleDocuments && (
                        <>
                            <IconButton
                                name="arrowLeft"
                                onClick={this.cycleDocument.bind(this, -1)}
                                position="absolute"
                                top="calc(50% - 2.1em)"
                                left={0}
                                fontSize="1.3em"
                            ></IconButton>
                            <IconButton
                                name="arrowRight"
                                onClick={this.cycleDocument.bind(this, 1)}
                                position="absolute"
                                top="calc(50% - 2.1em)"
                                right={0}
                                fontSize="1.4em"
                            ></IconButton>
                        </>
                    )}
                    <Box>
                        {this.state.download && (
                            <Text width="100%" textAlign="center">
                                {t("components.uploadingFile")}
                            </Text>
                        )}
                        {doc && doc.latitude !== undefined && doc.longitude !== undefined && (
                            <DocumentGeolocation
                                latLng={{latitude: doc.latitude, longitude: doc.longitude}}
                            />
                        )}
                        {/*
// @ts-ignore */}
                        {doc.type === "cmr" && doc.mlDocumentIdentification === "non_cmr" && (
                            <Flex
                                alignItems="center"
                                backgroundColor="red.ultralight"
                                p={2}
                                my={2}
                            >
                                <Icon
                                    name="warning"
                                    color="red.default"
                                    round
                                    backgroundColor="red.ultralight"
                                    mr={2}
                                />
                                <Text>
                                    {t("identifyPaperCmr.nonCmrWarning")}{" "}
                                    <Link
                                        href="https://help.dashdoc.eu/fr/articles/1680945-comment-joindre-ou-modifier-un-document-sur-un-dossier-de-transport-sur-dashdoc"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {t("identifyPaperCmr.howToUpdateDocumentCategory")}
                                    </Link>
                                </Text>
                            </Flex>
                        )}

                        {doc &&
                            (utilsService.isImage(doc.url) ? (
                                <ImageViewer src={doc.url} />
                            ) : (
                                <IFrame
                                    src={doc.url + "#view=FitH"}
                                    download={this.state.download}
                                    onLoad={this.handleIframeLoaded}
                                />
                            ))}
                        {this.state.iframeLoading && <LoadingWheel />}
                    </Box>
                </Box>
            </Modal>
        );
    };
}

const mapStateToProps = (state: RootState) => ({
    companyPk: getConnectedCompanyId(state),
});

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, {
    fetchUpdatePdf,
    fetchUpdateMessage,
})(DocumentModal);
