import {getConnectedCompany, getConnectedManager} from "@dashdoc/web-common";
import {utilsService} from "@dashdoc/web-common";
import {Icon, Link, Text} from "@dashdoc/web-ui";
import {MessageDocumentType, DeliveryDocumentType, useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {documentAnalyticsService} from "app/features/document/documentAnalytics.service";
import DocumentModal, {DisplayableDocument} from "app/features/document/DocumentModal";
import {useSelector} from "app/redux/hooks";
import {getDocumentLabelLong} from "app/services/transport";

type DocumentProps = {
    category: MessageDocumentType | DeliveryDocumentType;
    document: DisplayableDocument;
};

export const DocumentLink: FunctionComponent<DocumentProps> = ({category, document}) => {
    const [modalVisible, openModal, closeModal] = useToggle();

    const connectedManager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);

    const onDisplayDocumentClick = () => {
        documentAnalyticsService.sendDocumentModalOpenedAnalyticsEvent(
            connectedManager?.user,
            connectedCompany?.pk,
            "invoice"
        );
        if (document.deliveryUid && utilsService.isDeviceIos()) {
            // iframes are weird on iOS
            window.open(document.url);
        } else {
            openModal();
        }
    };

    return (
        <>
            <Link display="inline-flex" onClick={onDisplayDocumentClick}>
                <Icon name="document" mr={2} />
                <Text color="blue.default" variant="caption">
                    {getDocumentLabelLong(category)}
                </Text>
                {!!document.label && (
                    <Text color="blue.default" variant="caption" ml={1}>
                        - {document.label}
                    </Text>
                )}
            </Link>
            {modalVisible && <DocumentModal onClose={closeModal} documents={[document]} />}
        </>
    );
};
