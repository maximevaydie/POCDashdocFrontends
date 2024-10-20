import {getConnectedCompany, getConnectedManager, utilsService} from "@dashdoc/web-common";
import {Flex, Icon, Link, Text} from "@dashdoc/web-ui";
import {DeliveryDocumentType, MessageDocumentType, useToggle} from "dashdoc-utils";
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

    const label = document.label ? ` - ${document.label}` : "";
    const title = getDocumentLabelLong(category) + label;

    return (
        <>
            <Link display="inline-flex" onClick={onDisplayDocumentClick}>
                <Icon name="document" mr={2} />
                <Flex flexWrap="wrap">
                    <Text color="blue.default" variant="caption">
                        {title}
                    </Text>
                </Flex>
            </Link>
            {modalVisible && <DocumentModal onClose={closeModal} documents={[document]} />}
        </>
    );
};
