import {t} from "@dashdoc/web-core";
import {Flex, Text, Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {TransportsInvoiceabilityHeader} from "app/features/pricing/invoices/invoice-transports-flow/transports-invoiceability/transports-invoiceability-header";
import {InvoicingOnboardingWizard} from "app/taxation/invoicing/features/onboarding-wizard/InvoicingOnboardingWizard";

export const DahsdocInvoicingNotReady = ({onBack}: {onBack: () => void}) => {
    const [
        isInvoicingOnboardingModalOpen,
        openInvoicingOnboardingModal,
        closeInvoicingOnboardingModal,
    ] = useToggle();

    return (
        <>
            <TransportsInvoiceabilityHeader onBack={onBack} label={t("invoiceSettings.title")} />

            <Flex flexDirection={"column"} p={4}>
                <Text>{t("invoiceTransportsModal.dashdocInvoicingNotReady")}</Text>
                <Button
                    mt={3}
                    alignSelf={"flex-start"}
                    onClick={openInvoicingOnboardingModal}
                    data-testid="launch-invoicing-onboarding-wizard"
                >
                    {t("invoiceTransportsModal.dashdocInvoicingNotReadyButton")}
                </Button>
            </Flex>
            {isInvoicingOnboardingModalOpen && (
                <InvoicingOnboardingWizard
                    onClose={() => {
                        onBack();
                        closeInvoicingOnboardingModal();
                    }}
                />
            )}
        </>
    );
};
