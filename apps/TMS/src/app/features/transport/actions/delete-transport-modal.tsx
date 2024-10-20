import {t} from "@dashdoc/web-core";
import {Callout, Flex, Modal, Text} from "@dashdoc/web-ui";
import React from "react";

type DeleteTransportModalProps = {
    onDelete: () => void;
    onClose: () => void;
};
export const DeleteTransportModal = ({onDelete, onClose}: DeleteTransportModalProps) => {
    return (
        <Modal
            title={t("components.transportDetails.deleteTransport")}
            data-testid="delete-transport-modal"
            secondaryButton={{
                type: "button",
            }}
            mainButton={{
                type: "button",
                children: t("components.transportDetails.deleteTransport"),
                "data-testid": "delete-transport-button",
                onClick: onDelete,
                variant: "destructive",
            }}
            onClose={onClose}
        >
            <Flex flexDirection="column">
                <Text mb={3}>
                    {t("components.confirmDeletingSelectedTransports", {smart_count: 1})}
                </Text>
                <Callout p={3} variant="danger" iconDisabled>
                    <Text>{t("components.transportDetails.confirmDeleteTransport")}</Text>
                </Callout>
            </Flex>
        </Modal>
    );
};
