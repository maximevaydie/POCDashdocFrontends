import {t} from "@dashdoc/web-core";
import {Callout, Text} from "@dashdoc/web-ui";
import React from "react";

export default function CharteredTransportInfoBanner() {
    return (
        <Callout variant="warning" my={3}>
            <Text>{t("chartering.charteredTransportBanner")}</Text>
        </Callout>
    );
}
