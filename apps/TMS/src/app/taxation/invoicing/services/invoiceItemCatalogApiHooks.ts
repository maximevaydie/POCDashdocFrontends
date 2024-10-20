import {apiService} from "@dashdoc/web-common";
import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {Logger} from "@dashdoc/web-core";
import {translate} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {useEffect, useState} from "react";

import {useDispatch, useSelector} from "app/redux/hooks";
import {
    InvoiceItemForCatalog,
    InvoiceItemForCatalogCreationRequest,
    taxCodelistForCatalogZodSchema,
    TaxCodeForCatalog,
} from "app/taxation/invoicing/types/invoiceItemCatalogTypes";

import {
    createPopulateDashdocTaxCodesAction,
    dashdocTaxCodesSelector,
} from "../store/dashdocTaxCodeSlice";

export const usePaginatedInvoiceItemForCatalog = (): {
    items: InvoiceItemForCatalog[];
    hasNext: boolean;
    isLoading: boolean;
    loadNext: () => void;
    reload: () => void;
} => {
    const {
        items = [],
        hasNext,
        isLoading,
        loadNext,
        reload,
    } = usePaginatedFetch<InvoiceItemForCatalog>(
        "invoice-item-catalog/dashdoc-invoice-items/",
        {},
        {apiVersion: "web"}
    );
    return {items, hasNext, isLoading, loadNext, reload};
};

export const useCreateInvoiceItemForCatalog = (): ((
    req: InvoiceItemForCatalogCreationRequest
) => Promise<void>) => {
    return async ({
        description,
        account_code,
        tax_code_id,
        enabled,
    }: InvoiceItemForCatalogCreationRequest) => {
        try {
            await apiService.post(
                "invoice-item-catalog/dashdoc-invoice-items/",
                {
                    account_code,
                    description,
                    tax_code_id,
                    enabled,
                },
                {
                    apiVersion: "web",
                }
            );
        } catch (error) {
            Logger.error("Error while creating invoice item in the catalog", error);
            toast.error(translate("invoiceItemCatalog.failToCreate"));
        }
    };
};

export const useUpdateInvoiceItemForCatalog = (): ((
    newItem: InvoiceItemForCatalog
) => Promise<void>) => {
    return async (newItem: InvoiceItemForCatalog) => {
        try {
            await apiService.patch(
                `invoice-item-catalog/dashdoc-invoice-items/${newItem.uid}/`,
                {
                    account_code: newItem.account_code,
                    description: newItem.description,
                    tax_code_id: newItem.tax_code.id,
                    enabled: newItem.enabled,
                },
                {
                    apiVersion: "web",
                }
            );
        } catch (error) {
            Logger.error("Error while updating an invoice item in the catalog", error);
            toast.error(translate("invoiceItemCatalog.failToUpdate"));
        }
    };
};

const fetchDashdocTaxCodes = async (): Promise<TaxCodeForCatalog[]> => {
    try {
        const response: unknown = await apiService.get("invoice-item-catalog/dashdoc-tax-codes/", {
            apiVersion: "web",
        });
        const taxCodes: TaxCodeForCatalog[] = taxCodelistForCatalogZodSchema.parse(response);
        return taxCodes;
    } catch (error) {
        Logger.error("Error while fetching dashdoc tax codes", error);
        toast.error(translate("dashdocTaxCodes.failToFetch"));
    }
    return [];
};
/** Provides the dashdoc taxcodes.
 * Note that they are not ment to change for long period, so we fetch them the least possible.
 */
export const useDashdocTaxCodes = (): {taxCodes: TaxCodeForCatalog[]; loading: boolean} => {
    const [loading, setLoading] = useState<boolean>(false);
    const [hasFetched, setHasFetched] = useState<boolean>(false);
    const {dashdocTaxCodes: storedDashdocTaxCodes} = useSelector(dashdocTaxCodesSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        if (storedDashdocTaxCodes.length > 0 || hasFetched) {
            return;
        }
        setLoading(true);
        const abortController = new AbortController(); // we use an abort controller to cancel the subscription
        fetchDashdocTaxCodes().then((taxCodes) => {
            if (!abortController.signal.aborted) {
                setLoading(false);
                setHasFetched(true);
                dispatch(createPopulateDashdocTaxCodesAction(taxCodes));
            }
        });
        return () => {
            abortController.abort();
        };
    }, [storedDashdocTaxCodes, hasFetched, dispatch]);

    return {taxCodes: storedDashdocTaxCodes, loading};
};
