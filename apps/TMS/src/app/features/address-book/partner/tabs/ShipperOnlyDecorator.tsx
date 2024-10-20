import {companyService, PartnerDetailOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React from "react";

type Props = {
    company: Company | PartnerDetailOutput;
};

/**
 * This component explains that an area concerns only the shipper role.
 * (If the company has only one role, this decorator does not make sense.)
 */
export function ShipperOnlyDecorator({company}: Props) {
    const isShipper = companyService.isShipper(company);
    if (!isShipper) {
        return null; // does not make sense to show this decorator if the company is not a shipper
    }
    const isCarrier = companyService.isCarrier(company);
    if (isCarrier) {
        return null; // does not make sense to show this decorator if the company is a carrier
    }
    return (
        <Flex ml={2} alignItems="center">
            <Text>{`-`}</Text>
            <Icon name="building" color="blue.default" mx={2} />
            <Text>{t("partner.shipperOnly")}</Text>
        </Flex>
    );
}
