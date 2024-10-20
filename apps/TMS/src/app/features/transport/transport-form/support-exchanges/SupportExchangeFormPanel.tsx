import {t} from "@dashdoc/web-core";
import {FloatingPanelWithValidationButtons, ButtonWithShortcutProps, Text} from "@dashdoc/web-ui";
import React, {useMemo, useRef} from "react";

import {TransportFormActivity, TransportFormSupportExchange} from "../transport-form.types";
import {TEST_ID_PREFIX} from "../TransportForm";

import {SupportExchangeForm} from "./SupportExchangeForm";

type SupportExchangeFormPanel = {
    loadingActivities: TransportFormActivity[];
    unloadingActivities: TransportFormActivity[];
    supportExchangeToEdit: TransportFormSupportExchange;
    onSubmit: (supportExchange: TransportFormSupportExchange) => void;
    onClose: () => void;
};

export function SupportExchangeFormPanel({
    loadingActivities,
    unloadingActivities,
    supportExchangeToEdit,
    onSubmit,
    onClose,
}: SupportExchangeFormPanel) {
    const formRef = useRef<{submitForm: (submitMode: "save" | "saveAndAdd") => void}>();
    const secondaryButtons = useMemo(() => {
        const buttons: ButtonWithShortcutProps[] = [
            {
                variant: "plain",
                onClick: onClose,
                children: <Text>{t("common.cancel")}</Text>,
                shortcutKeyCodes: ["Escape"],
                tooltipLabel: "<i>escap</i>",
            },
        ];
        if (!supportExchangeToEdit) {
            buttons.push({
                variant: "secondary",
                onClick: () => {
                    formRef.current?.submitForm("saveAndAdd");
                },
                shortcutKeyCodes: ["Control", "Shift", "Enter"],
                tooltipLabel: "<i>ctrl + shift + enter</i>",
                children: t("common.validateAndAdd"),
            });
        }
        return buttons;
    }, [supportExchangeToEdit, onClose]);

    return (
        <FloatingPanelWithValidationButtons
            width={0.33}
            minWidth={528}
            onClose={onClose}
            title={
                supportExchangeToEdit
                    ? t("components.editSupportExchange")
                    : t("components.addSupportExchange")
            }
            mainButton={{
                onClick: () => {
                    formRef.current?.submitForm("save");
                },
            }}
            secondaryButtons={secondaryButtons}
            data-testid={`${TEST_ID_PREFIX}add-support-exchange-panel`}
        >
            <SupportExchangeForm
                supportExchangeToEdit={supportExchangeToEdit}
                onSubmit={onSubmit}
                onClose={onClose}
                ref={formRef}
                loadings={loadingActivities}
                unloadings={unloadingActivities}
            />
        </FloatingPanelWithValidationButtons>
    );
}
