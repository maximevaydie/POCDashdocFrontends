import {Logger, queryService} from "@dashdoc/web-core";
import React, {useEffect, useState} from "react";

import {LoadingScreen} from "../LoadingScreen";
import {authService} from "../../../services/auth.service";

type Props = {
    children: React.ReactNode;
};
// wrapper screen that check on mount if a temporary auth token exists in the url
// in order to login with it for the whole app
export function LoginByTemporaryAuthTokenScreen({children}: Props) {
    const temporaryAuthToken = queryService.getQueryParameterByName("temporary_auth_token");
    const [isLoading, setIsLoading] = useState(!!temporaryAuthToken);

    // if a temporary auth token exists on app mount, try to login with it
    useEffect(() => {
        authService
            .loginByCode(temporaryAuthToken)
            .catch((e) => {
                Logger.error("Login by temporary auth token fail", e);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}
