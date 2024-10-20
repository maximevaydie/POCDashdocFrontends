import {apiService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {toast} from "react-toastify";

import {
    InvoiceLegalMentionsData,
    InvoiceNumberingPostData,
    InvoiceBankInformationPayload,
} from "app/taxation/invoicing/types/invoiceSettingsTypes";

export const updateInvoiceNumberingSettings = async (payload: InvoiceNumberingPostData) => {
    try {
        const updatedNumbering = await apiService.post("invoicing-settings/numbering/", payload, {
            apiVersion: "web",
        });
        toast.success(t("common.updateSaved"));
        return updatedNumbering;
    } catch (error) {
        Logger.error("Error modifying invoice numbering information", error);
        toast.error(t("common.error"));
        throw error;
    }
};

export const postBankInformation = async (payload: InvoiceBankInformationPayload) => {
    try {
        const updatedPaymentSettings = await apiService.post(
            "invoicing-bank-information/",
            payload,
            {
                apiVersion: "web",
            }
        );
        toast.success(t("common.updateSaved"));
        return updatedPaymentSettings;
    } catch (error) {
        Logger.error("Error modifying invoice payment information", error);
        toast.error(t("common.error"));
        throw error;
    }
};

export const patchBankInformation = async (
    bankInformationUid: string,
    payload: InvoiceBankInformationPayload
) => {
    try {
        const updatedPaymentSettings = await apiService.patch(
            `invoicing-bank-information/${bankInformationUid}/`,
            payload,
            {
                apiVersion: "web",
            }
        );
        toast.success(t("common.updateSaved"));
        return updatedPaymentSettings;
    } catch (error) {
        Logger.error("Error modifying invoice payment information", error);
        toast.error(t("common.error"));
        throw error;
    }
};

export const deleteBankInformation = async (bankInformationUid: string) => {
    try {
        const bankInformationUidOutput = await apiService.delete(
            `invoicing-bank-information/${bankInformationUid}/`,
            {
                apiVersion: "web",
            }
        );
        toast.success(t("common.success"));
        return bankInformationUidOutput;
    } catch (error) {
        Logger.error("Error modifying invoice payment information", error);
        toast.error(t("common.error"));
        throw error;
    }
};

export const updateInvoiceLegalMentionsSettings = async (payload: InvoiceLegalMentionsData) => {
    try {
        const updatedPaymentSettings = await apiService.post(
            "invoicing-settings/legal-mentions/",
            payload,
            {apiVersion: "web"}
        );
        toast.success(t("common.updateSaved"));
        return updatedPaymentSettings;
    } catch (error) {
        Logger.error("Error modifying invoice legal mentions information", error);
        toast.error(t("common.error"));
        throw error;
    }
};
