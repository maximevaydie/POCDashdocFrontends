import {apiService} from "@dashdoc/web-common";
import {APIVersion, ApiScope, ApiOptions} from "dashdoc-utils";

export class TariffGridVersionsApi extends ApiScope() {
    constructor(options: ApiOptions) {
        const webOptions = {...options, apiVersion: "web" as APIVersion};
        super(webOptions);
    }

    path = "tariff-grid-versions";

    /**
     * @throws {Error}
     * Method not allowed
     */
    get(): never {
        throw new Error("Method not allowed");
    }

    /**
     * @throws {Error}
     * Method not allowed
     */
    getAll(): never {
        throw new Error("Method not allowed");
    }
}

export const tariffGridVersionsApiService = new TariffGridVersionsApi(apiService.options);
