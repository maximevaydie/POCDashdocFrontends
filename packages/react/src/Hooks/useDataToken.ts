import {authService} from "@dashdoc/web-common";
import {queryService} from "@dashdoc/web-core";
import {useEffect} from "react";

export function useDataToken() {
    const publicToken = queryService.getQueryParameterByName("token");

    useEffect(() => {
        if (publicToken) {
            authService.setPublicTokenForRestrictedDashdocAPIAccess(publicToken);
        }
    }, [publicToken]);
}
