import {t} from "@dashdoc/web-core";
import {Callout, Modal, Text, TextArea} from "@dashdoc/web-ui";
import React, {useState} from "react";

type CancelBookingSlotProps = {
    onSubmit: (reason: string) => void;
    onClose: () => void;
};

export function CancelSlotModal({onSubmit, onClose}: CancelBookingSlotProps) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState<string>("");

    return (
        <Modal
            title={t("common.cancelBooking")}
            mainButton={{
                variant: "primary",
                onClick: onCancel,
                children: t("common.cancelBooking"),
                severity: "danger",
            }}
            secondaryButton={{variant: "secondary", onClick: onClose}}
            onClose={onClose}
            data-testid="cancel-slot-modal"
        >
            <Callout variant="danger" marginY={2}>
                {t("flow.slot.aboutToCancel")}
            </Callout>
            <TextArea
                data-testid="cancel-text-area"
                height="110px"
                required
                value={reason}
                error={error}
                onChange={(value: string) => setReason(value)}
                label={t("chartering.cancelOrderReason")}
            />
            <Text marginY={2}>{t("flow.cancelBooking.areYouSure")}</Text>
        </Modal>
    );
    function onCancel() {
        if (!reason) {
            setError(t("common.mandatoryField"));
            return;
        }
        onSubmit(reason);
    }
}
