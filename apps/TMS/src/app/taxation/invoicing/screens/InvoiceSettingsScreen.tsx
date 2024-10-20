import {t} from "@dashdoc/web-core";
import {Box, Button, Callout, Flex, LoadingWheel, Tabs, Text} from "@dashdoc/web-ui";
import {ScrollableTableFixedHeader} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";
import {Helmet} from "react-helmet";

import {AddBankInformationModal} from "app/taxation/invoicing/features/invoice-settings/AddBankInformationModal";
import {BankInformationSection} from "app/taxation/invoicing/features/invoice-settings/BankInformationSection";
import {InvoiceLegalMentionsSection} from "app/taxation/invoicing/features/invoice-settings/InvoiceLegalMentionsSection";
import {InvoiceNumberingSection} from "app/taxation/invoicing/features/invoice-settings/InvoiceNumberingSection";
import {PaymentMethodsTab} from "app/taxation/invoicing/features/invoice-settings/payment-methods/PaymentMethodTab";
import {InvoicingOnboardingWizard} from "app/taxation/invoicing/features/onboarding-wizard/InvoicingOnboardingWizard";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";
import {useInvoiceSettings} from "app/taxation/invoicing/hooks/useInvoiceSettings";
import {useInvoicingStatusForDashdocInvoicing} from "app/taxation/invoicing/hooks/useInvoicingMethodStatus";

export const InvoiceSettingsScreen: FunctionComponent = () => {
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();

    const tabs = [
        {
            label: t("common.general"),
            testId: "invoice-settings-general-tab",
            content: <InvoiceGeneralSettingsTab />,
        },
    ];
    if (hasDashdocInvoicingEnabled) {
        tabs.push({
            label: t("common.payment"),
            testId: "invoice-settings-payment-tab",
            content: <PaymentMethodsTab />,
        });
    }

    return (
        <>
            <ScrollableTableFixedHeader>
                <Flex justifyContent="space-between" mb={3}>
                    <Helmet>
                        <title>{t("invoiceSettings.title")}</title>
                    </Helmet>
                    <Text
                        as="h3"
                        variant="title"
                        display="inline-block"
                        data-testid="screen-title"
                    >
                        {t("invoiceSettings.title")}
                    </Text>
                </Flex>
            </ScrollableTableFixedHeader>
            <Tabs hideHeaderWhenSingleTab initialActiveTab={0} tabs={tabs} actionButton={null} />
        </>
    );
};

const InvoiceGeneralSettingsTab: FunctionComponent = () => {
    const [isModalOpen, openModal, closeModal] = useToggle();

    const [
        isInvoicingOnboardingModalOpen,
        openInvoicingOnboardingModal,
        closeInvoicingOnboardingModal,
    ] = useToggle();

    const {
        isLoading,
        hasError,
        invoiceSettings,
        updateNumbering,
        editBankInformation,
        addBankInformation,
        deleteBankInformation,
        updateLegalMentions,
    } = useInvoiceSettings();

    const {invoicingStatus, loading: invoicingStatusLoading} =
        useInvoicingStatusForDashdocInvoicing();

    const isReadyForInvoicing =
        invoicingStatus?.invoicing_method === "dashdoc-invoicing" &&
        invoicingStatus.is_ready_for_invoicing;

    if (isLoading || invoicingStatusLoading) {
        return <LoadingWheel />;
    }
    if (hasError) {
        return (
            <Callout variant="danger" m={3}>
                {t("common.error")}
            </Callout>
        );
    }

    return (
        <>
            <Flex flexDirection={"column"} m={3}>
                {invoiceSettings && (
                    <>
                        <Callout>
                            <Text>{t("invoiceSettings.descriptionCallout")}</Text>
                        </Callout>
                        {!isReadyForInvoicing && (
                            <Button
                                mt={3}
                                alignSelf={"flex-start"}
                                onClick={() => {
                                    openInvoicingOnboardingModal();
                                }}
                                data-testid="launch-invoicing-onboarding-wizard"
                            >
                                {t("invoiceTransportsModal.dashdocInvoicingNotReadyButton")}
                            </Button>
                        )}
                        <Text variant="h1" mt={5} mb={3}>
                            {t("invoiceSettings.numberingSectionTitle")}
                        </Text>
                        <InvoiceNumberingSection
                            numberingData={invoiceSettings.numbering_settings}
                            onNumberingEdit={updateNumbering}
                        />
                        <Text variant="h1" mt={5} mb={3}>
                            {t("invoiceSettings.paymentSectionTitle")}
                        </Text>
                        <Flex flexDirection={"column"}>
                            {invoiceSettings.bank_information_list.map(
                                (invoiceBankInformation) => (
                                    <Box key={invoiceBankInformation.uid} my={1}>
                                        <BankInformationSection
                                            invoiceBankInformation={invoiceBankInformation}
                                            onInvoicePaymentEdit={editBankInformation}
                                            onInvoicePaymentDelete={deleteBankInformation}
                                            onInvoicePaymentAdd={addBankInformation}
                                        />
                                    </Box>
                                )
                            )}
                            <Box>
                                <Button
                                    variant="plain"
                                    onClick={openModal}
                                    data-testid="invoice-payment-add-bank-information"
                                >
                                    {t("invoiceSettings.createBankInformationButton")}
                                </Button>
                            </Box>
                            {isModalOpen && (
                                <AddBankInformationModal
                                    onClose={closeModal}
                                    onSubmit={closeModal}
                                    onInvoicePaymentAdd={addBankInformation}
                                />
                            )}
                        </Flex>
                        <Text variant="h1" mt={4} mb={3}>
                            {t("invoiceSettings.legalMentionsTitle")}
                        </Text>
                        <InvoiceLegalMentionsSection
                            legalMentionsByLanguage={invoiceSettings.legal_mentions_by_language}
                            onInvoiceLegalMentionsEdit={updateLegalMentions}
                        />
                    </>
                )}
            </Flex>

            {isInvoicingOnboardingModalOpen && (
                <InvoicingOnboardingWizard
                    onClose={() => {
                        closeInvoicingOnboardingModal();
                    }}
                    onNumberingUpdate={(numberingData) => {
                        updateNumbering(numberingData);
                    }}
                    onLegalMentionsUpdate={(legalMentionsByLanguage) => {
                        updateLegalMentions(legalMentionsByLanguage);
                    }}
                    onBankInformationUpdate={(bankInformation) => {
                        editBankInformation(bankInformation);
                    }}
                    onBankInformationAdd={(bankInformation) => {
                        addBankInformation(bankInformation);
                    }}
                />
            )}
        </>
    );
};
