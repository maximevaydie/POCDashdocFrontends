import {t} from "@dashdoc/web-core";
import {Modal} from "@dashdoc/web-ui";
import React, {useMemo, useRef} from "react";

import {AmendTransportWarningBanner} from "app/features/transport/amend-transport-warning-banner";
import {isTransportRental} from "app/services/transport/transport.service";

import {TransportFormActivity, TransportFormSupportExchange} from "../transport-form.types";

import {SupportExchangeForm} from "./SupportExchangeForm";

import type {Transport} from "app/types/transport";

export type SupportExchangeFormModalProps = {
    transport: Transport;
    activity: Pick<TransportFormActivity, "uid" | "type">;
    amending?: boolean;
    supportExchangeToEdit: TransportFormSupportExchange | null;
    onSubmit: (supportExchange: TransportFormSupportExchange) => void;
    onClose: () => void;
};

export function SupportExchangeFormModal({
    transport,
    activity,
    supportExchangeToEdit,
    amending,
    onSubmit,
    onClose,
}: SupportExchangeFormModalProps) {
    const formRef = useRef<{
        isSubmitting: () => boolean;
    }>();

    const title = useMemo(() => {
        if (amending) {
            if (supportExchangeToEdit) {
                return t("components.amendEditSupportExchange");
            }
            return t("components.amendAddSupportExchange");
        }
        if (supportExchangeToEdit) {
            return t("components.editSupportExchange");
        }
        return t("components.addSupportExchange");
    }, [amending, supportExchangeToEdit]);

    return (
        <Modal
            title={title}
            id="support-exchange-modal"
            onClose={onClose}
            data-testid="support-exchange-modal"
            mainButton={{
                type: "submit",
                form: "support-exchange-form",
                disabled: formRef.current?.isSubmitting(),
                loading: formRef.current?.isSubmitting(),
                "data-testid": "add-support-type-modal-save",
                children: t("common.save"),
            }}
        >
            {amending && <AmendTransportWarningBanner isRental={isTransportRental(transport)} />}
            <SupportExchangeForm
                loadings={activity.type === "loading" ? [activity] : []}
                unloadings={activity.type === "unloading" ? [activity] : []}
                supportExchangeToEdit={supportExchangeToEdit}
                onSubmit={onSubmit}
                onClose={onClose}
                ref={formRef}
            />
        </Modal>
    );
}
