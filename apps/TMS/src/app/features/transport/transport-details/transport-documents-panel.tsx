import {DeliveryDocument, TransportMessage, TransportMessagePost} from "dashdoc-utils";
import sortBy from "lodash.sortby";
import {connect} from "react-redux";

import {fetchAddDocument} from "app/redux/actions";

import {
    DocumentsPanel,
    ExtraRowType,
} from "./transport-details-activities/activity/activity-document/documents-panel";

import type {Transport} from "app/types/transport";

interface OwnProps {
    transport: Transport;
    readOnly: boolean;
    extraRows?: ExtraRowType[];
    maxFileSize?: number;
}

interface StateProps {
    deliveryDocuments: DeliveryDocument[];
    messageDocuments: TransportMessage[];
}

interface DispatchProps {
    fetchAddDocument: (transportUid: string, payload: TransportMessagePost) => any;
}

const mapStateToProps = (_: any, {transport: {documents, messages}}: OwnProps) => ({
    // TODO compute into a reselect selector instead
    // to prevent useless computation and therefore useless renders
    deliveryDocuments: sortBy(
        documents.filter((document) => document.file),
        "file_updated_date"
    ),
    messageDocuments: sortBy(
        messages.filter((message) => message.document),
        "created"
    ),
});

export const TransportDocumentsPanel = connect<StateProps, DispatchProps, OwnProps>(
    mapStateToProps,
    {
        fetchAddDocument,
    }
)(DocumentsPanel);
