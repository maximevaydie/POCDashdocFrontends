import {t} from "@dashdoc/web-core";
import {Callout} from "@dashdoc/web-ui";
import {Usage, formatNumber} from "dashdoc-utils";
import React from "react";

interface Props {
    usage: Usage | null;
}

export function ImpactOnBillingCallout({usage}: Props) {
    if (!usage?.used || !usage?.soft_limit || usage.used < usage.soft_limit) {
        return null;
    }
    return (
        <Callout mb={6} variant="warning">
            {t("settings.inviteNewUser.warning", {
                users_limit: usage?.soft_limit,
                users_overage: formatNumber(usage?.overage_unit_price, {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 2,
                }),
            })}
        </Callout>
    );
}
