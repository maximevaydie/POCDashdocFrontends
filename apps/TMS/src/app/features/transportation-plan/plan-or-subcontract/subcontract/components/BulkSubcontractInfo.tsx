import {HasFeatureFlag, HasNotFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import {Callout} from "@dashdoc/web-ui";
import React from "react";

export function BulkSubcontractInfo() {
    return (
        <>
            <HasFeatureFlag flagName="tripCreation">
                <Callout variant="warning" mb={3}>
                    <Text as="li">{t("chartering.bulk.charteredLimitation")}</Text>
                    <Text as="li">{t("chartering.bulk.numberLimitation")}</Text>
                    <Text as="li">{t("assign.bulk.preparedTripLimitation")}</Text>
                </Callout>
            </HasFeatureFlag>
            <HasNotFeatureFlag flagName="tripCreation">
                <Callout mb={3}>{t("chartering.bulk.limitations")}</Callout>
            </HasNotFeatureFlag>
        </>
    );
}
