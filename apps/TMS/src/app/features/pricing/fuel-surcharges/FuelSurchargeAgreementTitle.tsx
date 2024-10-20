import {t} from "@dashdoc/web-core";
import {Badge, BadgeColorVariant, Flex, theme} from "@dashdoc/web-ui";
import {FuelSurchargeAgreement, FuelSurchargeAgreementOwnerType} from "dashdoc-utils";
import React from "react";

type FuelSurchargeAgreementTitleProps = {
    title: React.ReactNode;
    fuelSurchargeAgreement: FuelSurchargeAgreement;
};

export function FuelSurchargeAgreementTitle({
    title,
    fuelSurchargeAgreement,
}: FuelSurchargeAgreementTitleProps) {
    const BADGE_PROPS_BY_OWNER_TYPE = {
        [FuelSurchargeAgreementOwnerType.SHIPPER]: {
            variant: "pink" as BadgeColorVariant,
            children: t("fuelSurcharges.ownerTypeShipper"),
        },
        [FuelSurchargeAgreementOwnerType.CARRIER]: {
            variant: "turquoise" as BadgeColorVariant,
            children: t("fuelSurcharges.ownerTypeCarrier"),
        },
    };

    return (
        <Flex alignItems="center" flexWrap="wrap" css={{gap: `${theme.space[2]}px`}}>
            {title}
            <Badge
                {...BADGE_PROPS_BY_OWNER_TYPE[fuelSurchargeAgreement.owner_type]}
                shape="squared"
            />
        </Flex>
    );
}
