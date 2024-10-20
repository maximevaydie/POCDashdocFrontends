import {t} from "@dashdoc/web-core";
import {Callout} from "@dashdoc/web-ui";
import {Usage, formatNumber} from "dashdoc-utils";
import React from "react";

interface Props {
    usage?: Usage | null;
}

export function ImpactOnBillingCallout({usage}: Props) {
    if (!usage?.used || !usage?.soft_limit || usage.used < usage.soft_limit) {
        return null;
    }
    return (
        <Callout mb={6} variant="warning">
            {t("components.inviteNewDriver.warning", {
                truckers_limit: usage?.soft_limit,
                truckers_overage: formatNumber(usage?.overage_unit_price, {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 2,
                }),
            })}
        </Callout>
    );
}
