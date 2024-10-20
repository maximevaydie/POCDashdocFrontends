import {getConnectedCompany, getConnectedManager} from "@dashdoc/web-common";
import {utilsService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Icon, Image, Box} from "@dashdoc/web-ui";
import {TransportMessage, useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {documentAnalyticsService} from "app/features/document/documentAnalytics.service";
import DocumentModal from "app/features/document/DocumentModal";
import {useSelector} from "app/redux/hooks";

type DocumentProps = {
    message: TransportMessage;
};

export const Document: FunctionComponent<DocumentProps> = ({message}) => {
    const [modalVisible, openModal, closeModal] = useToggle();

    const connectedManager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);

    let fileDisplay;
    const isValidImage = utilsService.isImage(message.document);
    if (message.document) {
        if (isValidImage) {
            fileDisplay = <Image className="img" src={message.document} />;
        } else {
            const fileTitle = message.document_title || t("components.clickToDownload");
            fileDisplay = (
                <Box as="span">
                    <Icon name="attachment" mr={1} />
                    {fileTitle}
                </Box>
            );
        }
    }

    const onDisplayDocumentClick = () => {
        documentAnalyticsService.sendDocumentModalOpenedAnalyticsEvent(
            connectedManager?.user,
            connectedCompany?.pk,
            "transport_details_status_list"
        );
        if (utilsService.isDeviceIos()) {
            // iframes are weird on iOS
            window.open(message.document);
        } else {
            openModal();
        }
    };

    return (
        <>
            {message.document && (
                <Box onClick={onDisplayDocumentClick}>
                    <a
                        className={`status-update-download status-update-btn ${
                            isValidImage ? "" : "no-photo"
                        }`}
                    >
                        {fileDisplay}
                    </a>
                </Box>
            )}
            {modalVisible && (
                <DocumentModal
                    onClose={closeModal}
                    documents={[
                        {
                            url: message.document,
                            label: message.reference,
                            type: message.document_type,
                            mlDocumentIdentification: message.ml_document_identification,
                            reference: message.reference,
                            extractedReference: message.extracted_reference,
                            authorCompanyId: message.author_company_id,
                            messageUid: message.uid,
                        },
                    ]}
                />
            )}
        </>
    );
};
