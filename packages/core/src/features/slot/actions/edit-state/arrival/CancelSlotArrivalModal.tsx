import {t} from "@dashdoc/web-core";
import {Callout, Modal, Text} from "@dashdoc/web-ui";
import React from "react";

export function CancelSlotArrivalModal(props: {
    onSubmit: () => void;
    onClose: () => void;
    title: string;
}) {
    const {title, onClose, onSubmit} = props;

    return (
        <Modal
            title={title}
            onClose={onClose}
            data-testid="cancel-site-arrival-modal"
            size="medium"
            mainButton={{
                type: "button",
                children: t("common.confirm"),
                onClick: onSubmit,
                severity: "warning",
            }}
            secondaryButton={{
                onClick: onClose,
                variant: "plain",
                children: t("common.cancel"),
            }}
        >
            <Callout marginY={2} variant="warning">
                {t("flow.cancelSiteArrival.areYouSure")}
            </Callout>
            <Text marginY={4}>{t("flow.cancelSiteArrival.involvedBehavior")}</Text>
        </Modal>
    );
}
