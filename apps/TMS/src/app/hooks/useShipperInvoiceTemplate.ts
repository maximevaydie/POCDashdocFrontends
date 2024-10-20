import {apiService} from "@dashdoc/web-common";
import {useCallback, useEffect, useState} from "react";

import {InvoiceTemplate} from "../services/invoicing/invoiceTemplate.service";

/**Hook that fetches and returns the invoice templates associated with some shipper.
 *
 * Once fetched, the templates are cached in a state and won't be fetched again.
 */
export const useShipperInvoiceTemplates = (shipperPk: number) => {
    const [shipperInvoiceTemplates, setshipperInvoiceTemplates] = useState<InvoiceTemplate[]>([]);

    const fetchInvoiceTemplates = useCallback(async () => {
        const response = await apiService.post(`invoice-templates/list-by-shipper/`, {
            shipper_id: shipperPk,
        });
        setshipperInvoiceTemplates(response);
    }, [setshipperInvoiceTemplates]);

    useEffect(() => {
        fetchInvoiceTemplates();
    }, [fetchInvoiceTemplates]);

    return shipperInvoiceTemplates;
};
