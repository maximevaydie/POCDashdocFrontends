import {apiService} from "@dashdoc/web-common";
import {
    APIListResponse,
    ApiScope,
    GenericDataQuery,
    RequestedVehicle,
    RequestedVehicleInput,
    ApiOptions,
} from "dashdoc-utils";

export class RequestedVehiclesApiService extends ApiScope<
    {},
    RequestedVehicle,
    {query?: {text?: string}},
    APIListResponse<RequestedVehicle>,
    GenericDataQuery<RequestedVehicleInput>,
    RequestedVehicle,
    GenericDataQuery<Partial<RequestedVehicleInput>>,
    RequestedVehicle,
    {}
>() {
    path = "requested-vehicles";

    constructor(options: ApiOptions) {
        super({...options, apiVersion: "web"});
    }
}

export const requestedVehiclesApiService = new RequestedVehiclesApiService(apiService.options);
