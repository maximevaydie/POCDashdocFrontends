import {Logger, queryService} from "@dashdoc/web-core";
import React, {FunctionComponent, useEffect, useState} from "react";
import {Redirect} from "react-router";

import {TMS_ROOT_PATH} from "../../../constants/constants";
import {LoadingScreen} from "../LoadingScreen";
import {authService} from "../../../services/auth.service";

export const LoginByModerationToken: FunctionComponent = () => {
    const moderationToken = queryService.getQueryParameterByName("moderation_token");
    const next = queryService.getQueryParameterByName("next");
    const [isLoading, setIsLoading] = useState(!!moderationToken);

    useEffect(() => {
        authService
            .loginByModerationToken(moderationToken)
            .catch((e) => {
                Logger.error("Login by moderation token fail", e);
            })
            .finally(() => {
                setIsLoading(false);
            });
    });

    if (isLoading) {
        return <LoadingScreen />;
    } else {
        return <Redirect to={next || TMS_ROOT_PATH} />;
    }
};
