import {apiService} from "@dashdoc/web-common";
import {SupportedLocale} from "@dashdoc/web-core";
import {useEffect, useState} from "react";

import {
    InvoiceNumberingPostData,
    InvoiceBankInformation,
    InvoiceSettings,
} from "app/taxation/invoicing/types/invoiceSettingsTypes";

export const useInvoiceSettings = (): {
    isLoading: boolean;
    hasError: boolean;
    invoiceSettings: InvoiceSettings;
    updateNumbering: (numberingData: InvoiceNumberingPostData) => void;
    editBankInformation: (bankInformation: InvoiceBankInformation) => void;
    addBankInformation: (bankInformation: InvoiceBankInformation) => void;
    deleteBankInformation: (bankInformationUid: string) => void;
    updateLegalMentions: (
        legalMentionsByLanguage: Partial<Record<SupportedLocale, string>>
    ) => void;
} => {
    const url = `/invoicing-settings/`;

    const invoiceSettingsInitialState = {
        numbering_settings: {
            prefix_template: "",
            reset_period: "never",
            last_invoice_number_outside_dashdoc: 0,
            last_invoice_date_outside_dashdoc: null,
            editable: false,
        },
        bank_information_list: [],
        legal_mentions_by_language: {},
    };

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(
        invoiceSettingsInitialState as InvoiceSettings
    );

    useEffect(() => {
        setIsLoading(true);
        (async () => {
            try {
                const response = await apiService.get(url, {apiVersion: "web"});
                setInvoiceSettings(response);
                setIsLoading(false);
            } catch (e) {
                setHasError(true);
                setIsLoading(false);
            }
        })();
    }, [url]);

    const updateNumbering = (numberingData: InvoiceNumberingPostData) => {
        setInvoiceSettings({
            ...invoiceSettings,
            numbering_settings: {
                ...numberingData,
                editable: invoiceSettings.numbering_settings.editable,
            },
        });
    };

    const editBankInformation = (bankInformation: InvoiceBankInformation) => {
        setInvoiceSettings({
            ...invoiceSettings,
            bank_information_list: [
                ...invoiceSettings.bank_information_list.map((item) => {
                    if (item.uid === bankInformation.uid) {
                        return bankInformation;
                    }
                    return item;
                }),
            ],
        });
    };

    const addBankInformation = (bankInformation: InvoiceBankInformation) => {
        setInvoiceSettings({
            ...invoiceSettings,
            bank_information_list: [...invoiceSettings.bank_information_list, bankInformation],
        });
    };

    const deleteBankInformation = (bankInformationUid: string) => {
        setInvoiceSettings({
            ...invoiceSettings,
            bank_information_list: [
                ...invoiceSettings.bank_information_list.filter(
                    (item) => item.uid !== bankInformationUid
                ),
            ],
        });
    };

    const updateLegalMentions = (
        legalMentionsByLanguage: Partial<Record<SupportedLocale, string>>
    ) => {
        setInvoiceSettings({
            ...invoiceSettings,
            legal_mentions_by_language: legalMentionsByLanguage,
        });
    };

    return {
        isLoading,
        hasError,
        invoiceSettings,
        updateNumbering,
        editBankInformation,
        addBankInformation,
        deleteBankInformation,
        updateLegalMentions,
    };
};
