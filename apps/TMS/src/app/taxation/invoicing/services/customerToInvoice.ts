import {apiService} from "@dashdoc/web-common";
import {queryService} from "@dashdoc/web-core";
import {InvoiceableCompany} from "dashdoc-utils";

export function searchInvoiceableCustomers(query: {
    search: string;
    page: number;
    is_shipper?: boolean;
}): Promise<{results: InvoiceableCompany[]; next: boolean}> {
    const queryString = `?${queryService.toQueryString(query)}`;
    return new Promise((resolve, reject) => {
        apiService
            .get(`/invoiceable-companies/${queryString}`, {apiVersion: "web"})
            .then((response: {results: InvoiceableCompany[]; next: boolean}) => {
                resolve(response);
            })
            .catch((error) => reject(error));
    });
}
