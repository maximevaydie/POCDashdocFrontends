import {SupportedLocale, t} from "@dashdoc/web-core";
import {Callout, LoadingWheel, StepperModal} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {CompanyInfosForm} from "app/features/settings/settings-company";
import {BankInformationForm} from "app/taxation/invoicing/features/invoice-settings/BankInformationForm";
import {LegalMentionsForm} from "app/taxation/invoicing/features/invoice-settings/LegalMentionsForm";
import {NumberingForm} from "app/taxation/invoicing/features/invoice-settings/numbering-form/NumberingForm";
import {LastStepForm} from "app/taxation/invoicing/features/onboarding-wizard/LastStepForm";
import {WelcomeForm} from "app/taxation/invoicing/features/onboarding-wizard/WelcomeForm";
import {useInvoiceSettings} from "app/taxation/invoicing/hooks/useInvoiceSettings";
import {
    InvoiceBankInformation,
    InvoiceNumberingPostData,
} from "app/taxation/invoicing/types/invoiceSettingsTypes";

type InvoicingOnboardingWizardProps = {
    onClose: () => void;
    // Optional props
    onNumberingUpdate?: (numberingData: InvoiceNumberingPostData) => void;
    onBankInformationUpdate?: (bankInformation: InvoiceBankInformation) => void;
    onBankInformationAdd?: (bankInformation: InvoiceBankInformation) => void;
    onLegalMentionsUpdate?: (
        legalMentionsByLanguage: Partial<Record<SupportedLocale, string>>
    ) => void;
};

export function InvoicingOnboardingWizard({
    onClose,
    onNumberingUpdate,
    onBankInformationUpdate,
    onBankInformationAdd,
    onLegalMentionsUpdate,
}: InvoicingOnboardingWizardProps) {
    // state with current step
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const {
        isLoading: isLoadingInvoiceSettings,
        hasError: hasErrorInvoiceSettings,
        invoiceSettings,
        updateLegalMentions,
        editBankInformation,
        addBankInformation,
        updateNumbering,
    } = useInvoiceSettings();

    const steps = [
        {
            title: t("common.welcome"),
            formId: "welcome-form",
            component: (
                <WelcomeForm
                    onSubmit={() => {
                        setCurrentStep(currentStep + 1);
                    }}
                />
            ),
        },
        {
            title: t("common.company"),
            formId: "company-info-form",
            component: (
                <CompanyInfosForm
                    origin="onboarding"
                    setLoading={setLoading}
                    onSubmit={() => {
                        setCurrentStep(currentStep + 1);
                    }}
                    canEditCompany={true}
                />
            ),
        },
        {
            title: t("invoicingOnboardingWizard.numberingStepTitle"),
            formId: "numbering-form",
            component: invoiceSettings && (
                <NumberingForm
                    numberingData={invoiceSettings.numbering_settings}
                    onNumberingEdit={(numberingData: InvoiceNumberingPostData) => {
                        updateNumbering(numberingData);
                        onNumberingUpdate?.(numberingData);
                    }}
                    onSubmit={() => {
                        setCurrentStep(currentStep + 1);
                    }}
                    setLoading={setLoading}
                />
            ),
        },
        {
            title: t("invoicingOnboardingWizard.legalMentionsStepTitle"),
            formId: "legal-mentions-form",
            component: invoiceSettings && (
                <LegalMentionsForm
                    legalMentionsByLanguage={invoiceSettings.legal_mentions_by_language}
                    onInvoiceLegalMentionsEdit={(
                        legalMentionsByLanguage: Partial<Record<SupportedLocale, string>>
                    ) => {
                        updateLegalMentions(legalMentionsByLanguage);
                        onLegalMentionsUpdate?.(legalMentionsByLanguage);
                    }}
                    onSubmit={() => {
                        setCurrentStep(currentStep + 1);
                    }}
                    setLoading={setLoading}
                    origin="onboarding"
                />
            ),
        },
        {
            title: t("invoicingOnboardingWizard.paymentDataStepTitle"),
            formId: "payment-data-form",
            component: invoiceSettings && (
                <BankInformationForm
                    invoiceBankInformation={
                        invoiceSettings.bank_information_list.length > 0
                            ? invoiceSettings.bank_information_list[0]
                            : null
                    }
                    onSubmit={(bankInformation?: InvoiceBankInformation) => {
                        if (bankInformation) {
                            if (invoiceSettings.bank_information_list.length > 0) {
                                editBankInformation(bankInformation);
                                onBankInformationUpdate?.(bankInformation);
                            } else {
                                addBankInformation(bankInformation);
                                onBankInformationAdd?.(bankInformation);
                            }
                        }
                        setCurrentStep(currentStep + 1);
                    }}
                    setLoading={setLoading}
                    origin="onboarding"
                />
            ),
        },
        {
            title: t("invoicingOnboardingWizard.lastStepTitle"),
            formId: "last-step-form",
            component: <LastStepForm onSubmit={onClose} onLinkClick={onClose} />,
        },
    ];

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    let content = null;
    if (isLoadingInvoiceSettings) {
        content = <LoadingWheel />;
    } else if (hasErrorInvoiceSettings) {
        content = (
            <Callout variant="danger" m={3}>
                {t("common.error")}
            </Callout>
        );
    } else {
        content = steps[currentStep].component;
    }

    return (
        <StepperModal
            onClose={onClose}
            title={t("invoicingOnboardingWizard.title")}
            size="xlarge"
            mainButton={{
                children: isLastStep ? t("common.finish") : t("common.next"),
                loading: loading,
                form: steps[currentStep].formId,
                type: "submit",
                "data-testid": "invoicing-onboarding-wizard-main-button",
            }}
            secondaryButton={{
                children: isFirstStep ? t("common.cancel") : t("common.previous"),
                onClick: isFirstStep ? onClose : () => setCurrentStep(currentStep - 1),
                "data-testid": "invoicing-onboarding-wizard-secondary-button",
            }}
            currentStep={currentStep}
            stepTitles={steps.map((step) => step.title)}
        >
            {content}
        </StepperModal>
    );
}
