import {apiService} from "@dashdoc/web-common";
import {ApiOptions, ApiScope, APIVersion, Query} from "dashdoc-utils";

import {PaymentMethod} from "app/taxation/invoicing/types/paymentMethods.types";

export class PaymentMethodsApi extends ApiScope<Query, PaymentMethod>() {
    constructor(options: ApiOptions) {
        const webOptions = {...options, apiVersion: "web" as APIVersion};
        super(webOptions);
    }

    path = "payment-methods";

    /**
     * @throws {Error}
     * Method not allowed
     */
    get(): never {
        throw new Error("Method not allowed");
    }

    autoSuggest(debtorId: number): Promise<{suggested_payment_method_uid: string}> {
        return this.request("POST", this.getFullPath({subpath: "auto-suggest/"}), {
            customer_id: debtorId,
        });
    }
}

export const PaymentMethodApiService = new PaymentMethodsApi(apiService.options);
