import {t} from "@dashdoc/web-core";
import {Callout, Text} from "@dashdoc/web-ui";
import React from "react";

import {TariffGrid} from "app/features/pricing/tariff-grids/types";

type TariffGridDisabledCallout = {
    tariffGridStatus: TariffGrid["status"];
};

export const TariffGridDisabledCallout = ({tariffGridStatus}: TariffGridDisabledCallout) => {
    if (tariffGridStatus === "active") {
        return null;
    }

    return (
        <Callout
            data-testid="tariff-grid-version-modal-tariff-grid-disabled-callout"
            variant="warning"
            mb={4}
        >
            <Text color="yellow.dark">{t("tariffGridVersion.tariffGridIsInactive")}</Text>
        </Callout>
    );
};
