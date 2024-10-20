import {apiService} from "@dashdoc/web-common";
import {
    APIListResponse,
    APIVersion,
    ApiOptions,
    ApiScope,
    GenericDataQuery,
    RequestOptions,
} from "dashdoc-utils";

export type TransportOperationCategory = {
    uid: string;
    name: string;
    last_emission_rate: {
        uid: string;
        emission_rate: number;
        expire_at: string;
        generic_emission_rate_uid: string | null;
    };
    is_default: boolean;
};

type TransportOperationCategoryCreatePayload = {
    name: string;
    generic_emission_rate_uid: string;
};

type TransportOperationCategoryPatchPayload = {
    name: string;
};

type TransportOperationCategoryUpdateInitialEmissionRatePayload = {
    generic_emission_rate_uid: string;
};

export class TransportOperationCategoryApiService extends ApiScope<
    never,
    never,
    never,
    APIListResponse<TransportOperationCategory>,
    GenericDataQuery<TransportOperationCategoryCreatePayload>,
    TransportOperationCategory,
    GenericDataQuery<TransportOperationCategoryPatchPayload>,
    TransportOperationCategory,
    never,
    never
>() {
    constructor(options: ApiOptions) {
        const webOptions = {...options, apiVersion: "web" as APIVersion};
        super(webOptions);
    }

    path = "carbon-footprint/transport-operation-categories";

    updateInitialEmissionRate(
        uid: string,
        {
            data,
            query,
        }: GenericDataQuery<TransportOperationCategoryUpdateInitialEmissionRatePayload>,
        options?: RequestOptions
    ): Promise<TransportOperationCategory> {
        return this.request(
            "POST",
            this.getFullPath({id: uid, action: "update-initial-emission-rate", query}),
            data,
            options
        );
    }
    getOrCreateDefault(): Promise<TransportOperationCategory> {
        return this.request("POST", this.getFullPath({action: "get-or-create-default"}), {});
    }
}

export const transportOperationCategoryApiService = new TransportOperationCategoryApiService(
    apiService.options
);
