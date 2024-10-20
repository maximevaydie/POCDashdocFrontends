import {t} from "@dashdoc/web-core";
import React from "react";

import {useBaseUrl} from "../../hooks/useBaseUrl";

export function NotFoundScreen() {
    const link = useBaseUrl();
    return (
        <div className="container app">
            <div className="row">
                <div className="col-md-8 col-md-offset-2" data-testid="page-not-found">
                    <h1>{t("common.pageNotFound")}</h1>
                    <p>
                        {t("common.pageNotFoundAdvice")}
                        <a href={link}>{t("common.clickHere")}</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
