import {apiService} from "@dashdoc/web-common";
import {queryService} from "@dashdoc/web-core";
import {useEffect, useState} from "react";

import {
    ExportsList,
    InvoiceCountersForExport,
} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/types";

import type {InvoicesListQuery} from "app/features/filters/deprecated/utils";

export function useInvoiceExportInfo(currentQuery: InvoicesListQuery) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [exports, setExports] = useState<ExportsList | null>(null);
    const [counters, setCounters] = useState<InvoiceCountersForExport | null>(null);
    const [errorData, setErrorData] = useState<unknown>(null);

    useEffect(() => {
        setIsLoading(true);
        (async () => {
            try {
                const response = await apiService.get(
                    `/invoices/export-info/?${queryService.toQueryString(currentQuery)}`,
                    {
                        apiVersion: "web",
                    }
                );
                setExports(response.exports);
                setCounters(response.counters);
                setIsLoading(false);
            } catch (e) {
                try {
                    const errorData = await e.json();
                    setErrorData(errorData);
                } catch {
                    setErrorData(null);
                } finally {
                    setHasError(true);
                    setIsLoading(false);
                }
            }
        })();
    }, []);

    return {isLoading, hasError, exports, setExports, counters, errorData};
}
