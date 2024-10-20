import {useState} from "react";

import {invoiceApiService} from "app/taxation/invoicing/services/invoicesApi.service";
import {toastGenerateAccountingExportError} from "app/taxation/invoicing/services/invoicingToasts";

/**Hook providing a function to export to accounting. */
export const useGenerateAccountingExport = (): {
    isLoading: boolean;
    generateAccountingExport: () => Promise<{ok: boolean}>;
} => {
    const [isLoading, setIsLoading] = useState(false);

    const generateAccountingExport = async () => {
        if (isLoading) {
            return {ok: false};
        }
        setIsLoading(true);
        const response = await invoiceApiService.generateAccountingExport();
        setIsLoading(false);
        if (!response.ok) {
            toastGenerateAccountingExportError();
            return {ok: false};
        }
        return {ok: true};
    };
    return {isLoading, generateAccountingExport};
};
