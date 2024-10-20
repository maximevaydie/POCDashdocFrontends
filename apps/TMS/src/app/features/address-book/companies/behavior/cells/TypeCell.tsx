import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge, Box, NoWrap} from "@dashdoc/web-ui";
import {Address} from "dashdoc-utils";
import React from "react";

type Props = {
    address: Address;
};

export function TypeCell({address}: Props) {
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");
    return (
        <NoWrap>
            <Box data-testid="address-type-cell">
                {!hasBetterCompanyRolesEnabled && address.is_carrier && (
                    <Badge display="inline-block" mr={1} mb={1}>
                        {t("common.carrier")}
                    </Badge>
                )}
                {!hasBetterCompanyRolesEnabled && address.is_shipper && (
                    <Badge display="inline-block" mr={1} mb={1}>
                        {t("common.shipper")}
                    </Badge>
                )}
                {address.is_origin && (
                    <Badge display="inline-block" mr={1} mb={1}>
                        {t("common.pickup")}
                    </Badge>
                )}
                {address.is_destination && (
                    <Badge display="inline-block">{t("common.delivery")}</Badge>
                )}
            </Box>
        </NoWrap>
    );
}
