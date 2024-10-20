import {apiService} from "@dashdoc/web-common";
import {ApiScope, Query, RequestOptions} from "dashdoc-utils";
import {z} from "zod";

import {Invoice} from "app/taxation/invoicing/types/invoice.types";

import type {Transport} from "app/types/transport";

const ExportToAccountingResponseSchema = z.object({
    success: z.boolean(),
    task: z.object({
        id: z.string().nullable(),
        status: z.string(),
    }),
});

export class InvoicesApi extends ApiScope<Query, Invoice>() {
    path = "invoices";

    /**
     * @throws {Error}
     * Method not allowed
     */
    post(): never {
        throw new Error("Method not allowed");
    }

    patchFile(invoiceUid: Invoice["uid"], file: File) {
        const formData = new FormData();
        formData.append("file", file);
        return this.request("PATCH", this.getFullPath({id: invoiceUid}), formData);
    }

    getSharedInvoice(
        invoiceUid: string,
        {query}: Query = {},
        options?: RequestOptions
    ): Promise<Invoice> {
        return this.request(
            "GET",
            this.getFullPath({subpath: `/${invoiceUid}/shared/`, query}),
            null,
            options
        );
    }

    removeTransportFromInvoice(
        invoiceUid: string,
        transportUid: Transport["uid"],
        options?: RequestOptions
    ): Promise<unknown> {
        return this.request(
            "POST",
            this.getFullPath({
                subpath: `/${invoiceUid}/remove-transport/`,
                query: {transport_uid: transportUid},
            }),
            null,
            options
        );
    }

    async generateAccountingExport(): Promise<{
        ok: boolean;
        task: {id: string | null; status: string};
    }> {
        try {
            const resp: unknown = await this.request(
                "POST",
                this.getFullPath({
                    subpath: `/generate-accounting-export/`,
                }),
                null,
                {apiVersion: "web"}
            );
            const validatedResponse = ExportToAccountingResponseSchema.parse(resp);
            return {ok: validatedResponse.success, task: validatedResponse.task};
        } catch (e) {
            return {ok: false, task: {id: null, status: "failed"}};
        }
    }

    duplicate(invoiceUid: string) {
        return this.request(
            "POST",
            this.getFullPath({
                subpath: `/${invoiceUid}/duplicate/`,
            }),
            null,
            {apiVersion: "web"}
        );
    }
}

export const invoiceApiService = new InvoicesApi(apiService.options);
