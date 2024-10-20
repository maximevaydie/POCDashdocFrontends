import {SupportedLocale, t} from "@dashdoc/web-core";
import {Modal} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {LegalMentionsForm} from "app/taxation/invoicing/features/invoice-settings/LegalMentionsForm";

type EditInvoiceLegalMentionsModalProps = {
    legalMentionsByLanguage: Partial<Record<SupportedLocale, string>>;
    onInvoiceLegalMentionsEdit: (
        legalMentionsByLanguage: Partial<Record<SupportedLocale, string>>
    ) => void;
    onSubmit: () => void;
    onClose: () => void;
    defaultOpenLanguageTab?: SupportedLocale;
};

export function EditInvoiceLegalMentionsModal({
    legalMentionsByLanguage,
    onInvoiceLegalMentionsEdit,
    onClose,
    onSubmit,
    defaultOpenLanguageTab,
}: EditInvoiceLegalMentionsModalProps) {
    const [loading, setLoading] = useState(false);

    return (
        <Modal
            onClose={onClose}
            title={t("InvoiceLegalSettings.title")}
            size="large"
            mainButton={{
                form: "legal-mentions-form",
                type: "submit",
                loading: loading,
                "data-testid": "legal-mentions-settings-save-button",
                children: t("common.save"),
            }}
            secondaryButton={{
                onClick: onClose,
                "data-testid": "legal-mentions-settings-cancel-button",
            }}
        >
            <LegalMentionsForm
                onSubmit={onSubmit}
                legalMentionsByLanguage={legalMentionsByLanguage}
                onInvoiceLegalMentionsEdit={onInvoiceLegalMentionsEdit}
                setLoading={setLoading}
                origin="settings"
                defaultOpenLanguageTab={defaultOpenLanguageTab}
            />
        </Modal>
    );
}
