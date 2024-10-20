import {t} from "@dashdoc/web-core";
import {Modal, Text, Callout} from "@dashdoc/web-ui";
import React from "react";

export function DeleteSlotModal(props: {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
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
                children: t("common.confirmDeletion"),
                onClick: onSubmit,
                severity: "danger",
            }}
            secondaryButton={{
                onClick: onClose,
                variant: "secondary",
                children: t("common.cancel"),
            }}
        >
            <Callout marginY={2} variant="danger">
                {t("flow.slot.aboutToDelete")}
            </Callout>
            <Text>{t("common.deleteBooking.areYouSure")}</Text>
        </Modal>
    );
}
