import {queryService} from "@dashdoc/web-core";

export function useHasWamPortalAccess() {
    const publicToken = queryService.getQueryParameterByName("token");
    return publicToken !== null && publicToken !== undefined;
}
