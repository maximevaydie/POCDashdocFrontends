import {t} from "@dashdoc/web-core";
import {Link, Callout} from "@dashdoc/web-ui";
import React from "react";

export function EmissionRateSourceCallout() {
    return (
        <Callout>
            {t("components.requestedVehicle.emissionrateSourceInfo")}{" "}
            <Link
                href="https://base-empreinte.ademe.fr/"
                target="_blank"
                rel="noopener noreferrer"
            >
                {t("components.requestedVehicle.emissionRateSourceLink")}
            </Link>
        </Callout>
    );
}
