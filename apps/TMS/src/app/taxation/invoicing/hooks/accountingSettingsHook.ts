import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {useEffect, useState} from "react";
import {z} from "zod";

const accountingInvoiceLinePolicySchema = z.union([
    z.literal("detailed"),
    z.literal("by_account_code"),
]);
/**Must be in sync with backend `AccountingInvoiceLinePolicy` */
export type AccountingInvoiceLinePolicy = z.infer<typeof accountingInvoiceLinePolicySchema>;

/** Must be in sync with backend `AccountingSettingsOutputSerializer` */
const accountingSettingsSchema = z.object({
    sales_journal_code: z.string(),
    account_code_details: z.record(z.string()),
    invoice_line_policy: accountingInvoiceLinePolicySchema,
    prevent_accounting_export_if_missing_account_code: z.boolean(),
    export_pdf_files: z.boolean(),
});

type AccountingSetting = z.infer<typeof accountingSettingsSchema>;

/** Must be in sync with backend `AccountingSettingUpsertInputValidator` */
const accountingSettingsUpsertRequestSchema = z.object({
    sales_journal_code: z.string().optional(),
    account_code_details: z.record(z.string()).optional(),
    invoice_line_policy: accountingInvoiceLinePolicySchema.optional(),
    prevent_accounting_export_if_missing_account_code: z.boolean().optional(),
    export_pdf_files: z.boolean().optional(),
});

type AccountingSettingUpsertRequest = z.infer<typeof accountingSettingsUpsertRequestSchema>;

/**Must be in sync with backend `DEFAULT_VAT_ACCOUNT_CODE` */
export const DEFAULT_VAT_ACCOUNT_CODE = "4457";

const getOrCreateAccountingSettings = async (): Promise<AccountingSetting> => {
    const response: unknown = await apiService.post(
        "/accounting-settings/get-or-create/",
        undefined,
        {apiVersion: "web"}
    );
    return accountingSettingsSchema.parse(response);
};

const upsertAccountingSettings = async (
    settings: AccountingSetting
): Promise<AccountingSetting> => {
    const payload: AccountingSettingUpsertRequest = {
        sales_journal_code: settings.sales_journal_code,
        account_code_details: settings.account_code_details,
        invoice_line_policy: settings.invoice_line_policy,
        prevent_accounting_export_if_missing_account_code:
            settings.prevent_accounting_export_if_missing_account_code,
        export_pdf_files: settings.export_pdf_files,
    };
    const response: unknown = await apiService.post("/accounting-settings/upsert/", payload, {
        apiVersion: "web",
    });
    return accountingSettingsSchema.parse(response);
};

export const useAccountingSettings = (): {
    accountingSettings: AccountingSetting | undefined;
    updateSettings: (settings: AccountingSetting) => void;
    loading: boolean;
} => {
    const [accountingSettings, setAccountingSettings] = useState<AccountingSetting | undefined>(
        undefined
    );
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const abortController = new AbortController();
        setLoading(true);
        const asyncPart = async () => {
            const fetchedAccountingSettings: AccountingSetting =
                await getOrCreateAccountingSettings();
            if (abortController.signal.aborted) {
                return;
            }
            setLoading(false);

            setAccountingSettings(fetchedAccountingSettings);
        };
        asyncPart();
        return () => {
            abortController.abort();
        };
    }, []);
    const updateSettings = async (settings: AccountingSetting) => {
        setLoading(true);
        const updatedSettings = await upsertAccountingSettings(settings);
        setLoading(false);
        setAccountingSettings(updatedSettings);
        toast.success(t("common.success"), {
            toastId: "accountingSettingsSuccessSave",
        });
    };
    return {
        loading: loading,
        updateSettings: updateSettings,
        accountingSettings: accountingSettings,
    };
};
