import {t} from "@dashdoc/web-core";
import {Callout, Modal, Text} from "@dashdoc/web-ui";
import React from "react";

export function CancelSlotHandlingModal(props: {
    onSubmit: () => void;
    onClose: () => void;
    title: string;
    "data-testid"?: string;
}) {
    const {title, onClose, onSubmit} = props;

    return (
        <Modal
            title={title}
            onClose={onClose}
            data-testid={props["data-testid"]}
            size="medium"
            mainButton={{
                type: "button",
                children: t("common.confirm"),
                onClick: onSubmit,
                severity: "warning",
                "data-testid": "cancel-handling-modal-confirm",
            }}
            secondaryButton={{
                onClick: onClose,
                variant: "plain",
                children: t("common.cancel"),
            }}
        >
            <Callout marginY={2} variant="warning">
                {t("flow.cancelSlotHandling.areYouSure")}
            </Callout>
            <Text marginY={4}>{t("flow.cancelSlotHandling.involvedBehavior")}</Text>
        </Modal>
    );
}
