import {getConnectedCompany, getConnectedManager, utilsService} from "@dashdoc/web-common";
import {Box, Icon, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {DeliveryDocumentType, MessageDocumentType, useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {documentAnalyticsService} from "app/features/document/documentAnalytics.service";
import DocumentModal, {DisplayableDocument} from "app/features/document/DocumentModal";
import {useSelector} from "app/redux/hooks";
import {getDocumentTypeIcon, getDocumentTypeLabel} from "app/services/transport";

const DocumentsByTypePreviewStyle = styled("div")`
    position: relative;
    text-align: center;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    padding: 5px;
    cursor: pointer;
    justify-content: space-between;

    &:hover {
        background: white;
        border-radius: 4px;
    }

    .document-name {
        font-size: 10px;
        margin-top: 7px;
    }

    .document-count {
        position: absolute;
        font-size: 11px;
        left: 14px;
        top: 13px;
        background: ${theme.colors.blue.dark};
        border-radius: 50%;
        padding: 3px 4px;
        line-height: 10px;
        color: white;
        font-weight: bold;
    }
`;

type DocumentsByTypePreviewProps = {
    documentType: MessageDocumentType | DeliveryDocumentType;
    documents: DisplayableDocument[];
    documentOpenedFrom: "transports_list" | "truckers_dashboard";
};

export const DocumentsByTypePreview: FunctionComponent<DocumentsByTypePreviewProps> = ({
    documentType,
    documents,
    documentOpenedFrom,
}) => {
    const [modalVisible, openModal, closeModal] = useToggle();

    const connectedManager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);

    const count = documents.length;

    const onDisplayDocumentsClick = () => {
        documentAnalyticsService.sendDocumentModalOpenedAnalyticsEvent(
            connectedManager?.user,
            connectedCompany?.pk,
            documentOpenedFrom
        );
        if (documents[0].deliveryUid && utilsService.isDeviceIos()) {
            // iOS won't make pdf printable and rendering is very poor
            window.open(documents[0].url);
        } else {
            openModal();
        }
    };

    return (
        <>
            <DocumentsByTypePreviewStyle onClick={onDisplayDocumentsClick}>
                <Icon
                    name={getDocumentTypeIcon(documentType)}
                    color={count > 0 ? "blue.default" : "grey.default"}
                />
                {count > 1 && <div className="document-count">{count}</div>}
                <Box as="span" className="document-name">
                    {getDocumentTypeLabel(documentType)}
                </Box>
            </DocumentsByTypePreviewStyle>
            {modalVisible && <DocumentModal onClose={closeModal} documents={documents} />}
        </>
    );
};
