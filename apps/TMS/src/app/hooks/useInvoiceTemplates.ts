import {apiService} from "@dashdoc/web-common";
import {useCallback, useEffect, useState} from "react";

import {InvoiceTemplate} from "app/services/invoicing/invoiceTemplate.service";

/**Simple hook to interact with invoice templates */
export const useInvoiceTemplates = () => {
    const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplate[]>([]);

    const fetchInvoiceTemplates = useCallback(async () => {
        const response = await apiService.get(`invoice-templates/`);
        setInvoiceTemplates(response);
    }, [setInvoiceTemplates]);

    useEffect(() => {
        fetchInvoiceTemplates();
    }, [fetchInvoiceTemplates]);

    const createInvoiceTemplate = async ({uid, name, template, shippers}: InvoiceTemplate) => {
        if (uid === undefined) {
            await apiService.post(`invoice-templates/`, {
                name,
                template,
                shippers: shippers.map(({pk}) => pk),
            });
            fetchInvoiceTemplates();
        }
    };
    const updateInvoiceTemplate = async ({uid, name, template, shippers}: InvoiceTemplate) => {
        if (uid !== undefined) {
            await apiService.patch(`invoice-templates/${uid}/`, {
                name,
                template,
                shippers: shippers.map(({pk}) => pk),
            });
            fetchInvoiceTemplates();
        }
    };
    const deleteInvoiceTemplate = async (uid: string) => {
        if (uid !== undefined) {
            await apiService.delete(`invoice-templates/${uid}/`);
            fetchInvoiceTemplates();
        }
    };

    return {
        invoiceTemplates,
        createInvoiceTemplate,
        updateInvoiceTemplate,
        deleteInvoiceTemplate,
    };
};
