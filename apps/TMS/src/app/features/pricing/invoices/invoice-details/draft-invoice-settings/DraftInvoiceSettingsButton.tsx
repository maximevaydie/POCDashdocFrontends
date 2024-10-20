import {t} from "@dashdoc/web-core";
import {Button, Icon, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {DraftInvoiceSettingsModal} from "app/features/pricing/invoices/invoice-details/draft-invoice-settings/DraftInvoiceSettingsModal";

export function DraftInvoiceSettingsButton() {
    const [isModalOpen, openModal, closeModal] = useToggle();
    return (
        <>
            <Button
                variant="plain"
                onClick={openModal}
                mr={-4}
                data-testid="personalize-invoice-settings-button"
            >
                <Icon name="edit" mr={2} />
                <Text color="blue.default">{t("common.personalize")}</Text>
            </Button>
            {isModalOpen && <DraftInvoiceSettingsModal onClose={closeModal} />}
        </>
    );
}
//
