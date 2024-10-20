import {t} from "@dashdoc/web-core";
import {Modal, Text} from "@dashdoc/web-ui";
import {DeliveryDocument, TransportMessage} from "dashdoc-utils";
import React from "react";

import {DocumentsPanel} from "app/features/transport/transport-details/transport-details-activities/activity/activity-document/documents-panel";

import type {Transport} from "app/types/transport";

interface ActivityDocumentsModalProps {
    activityIndex: number;
    deliveryDocuments: DeliveryDocument[];
    messageDocuments: TransportMessage[];
    onClose: () => void;
    readOnly: boolean;
    transport: Transport;
}

export const ActivityDocumentsModal = ({
    activityIndex,
    deliveryDocuments,
    messageDocuments,
    onClose,
    readOnly,
    transport,
}: ActivityDocumentsModalProps) => (
    <Modal
        title={t("activity.documentsModal.title")}
        onClose={onClose}
        id="activity-documents-modal"
        data-testid="activity-documents-modal"
        mainButton={null}
        secondaryButton={null}
    >
        <Text mb={4} variant="h1">
            {t("activity.documentsModal.content", {activity_index: activityIndex})}
        </Text>
        <DocumentsPanel
            deliveryDocuments={deliveryDocuments}
            messageDocuments={messageDocuments}
            transport={transport}
            readOnly={readOnly}
        />
    </Modal>
);
