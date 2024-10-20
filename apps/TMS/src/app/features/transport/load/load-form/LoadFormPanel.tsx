import {t} from "@dashdoc/web-core";
import {FloatingPanelWithValidationButtons, ButtonWithShortcutProps, Text} from "@dashdoc/web-ui";
import React, {useMemo, useRef} from "react";

import {
    FormLoad,
    LoadSmartSuggestion,
    TransportFormDeliveryOption,
} from "../../transport-form/transport-form.types";
import {TEST_ID_PREFIX} from "../../transport-form/TransportForm";

import TransportLoadForm from "./LoadForm";

type LoadFormPanelProps = {
    deliveries: TransportFormDeliveryOption[];
    loadToEdit?: FormLoad;
    loadsSmartSuggestionsMap: Map<number, LoadSmartSuggestion>;
    onSubmit: (load: FormLoad) => void;
    onClose: () => void;
};

export default function LoadFormPanel({
    deliveries,
    loadToEdit,
    loadsSmartSuggestionsMap,
    onSubmit,
    onClose,
}: LoadFormPanelProps) {
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
        if (!loadToEdit) {
            buttons.push({
                variant: "secondary",
                onClick: () => {
                    // @ts-ignore
                    formRef.current.submitForm("saveAndAdd");
                },
                children: t("common.validateAndAdd"),
                shortcutKeyCodes: ["Control", "Shift", "Enter"],
                tooltipLabel: "<i>ctrl + shift + enter</i>",
            });
        }
        return buttons;
    }, [loadToEdit, onClose]);

    return (
        <FloatingPanelWithValidationButtons
            width={0.33}
            minWidth={528}
            onClose={onClose}
            title={loadToEdit ? t("components.editLoad") : t("components.addLoad")}
            mainButton={{
                onClick: () => {
                    // @ts-ignore
                    formRef.current.submitForm("save");
                },
            }}
            secondaryButtons={secondaryButtons}
            data-testid={`${TEST_ID_PREFIX}add-load-panel`}
        >
            <TransportLoadForm
                onSubmit={onSubmit}
                initialLoadData={loadToEdit}
                isEditing={!!loadToEdit}
                onClose={onClose}
                deliveries={deliveries}
                loadsSmartSuggestionsMap={loadsSmartSuggestionsMap}
                // @ts-ignore
                ref={formRef}
                rootId="react-app"
            />
        </FloatingPanelWithValidationButtons>
    );
}
