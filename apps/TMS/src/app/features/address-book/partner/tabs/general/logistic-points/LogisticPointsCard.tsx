import {PartnerDetailOutput, useBaseUrl} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Card, Flex, Text} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React from "react";
import {Link} from "react-router-dom";

import {ButtonEditAddress} from "app/features/address/edit-address";
import {LINK_LOGISTIC_POINTS} from "app/features/sidebar/constants";

type Props = {
    company: Company | PartnerDetailOutput;
};

export function LogisticPointsCard({company}: Props) {
    const baseUrl = useBaseUrl();
    // FIXME: Clean when removing the FF betterCompanyRoles
    const addresses = "logistic_points" in company ? company.logistic_points : company.addresses;
    const pickupOrDeliveryList =
        addresses === undefined
            ? []
            : addresses.filter((address) => address.is_destination || address.is_origin);
    if (pickupOrDeliveryList.length === 0) {
        return null;
    }
    return (
        <Card p={4} mb={4} data-testid="addresses-link">
            <Flex justifyContent="space-between">
                <>
                    <Text>
                        {t("logisticPoint.xLogisticPoints", {
                            smart_count: pickupOrDeliveryList.length,
                        })}
                    </Text>
                    {pickupOrDeliveryList.length === 1 ? (
                        <ButtonEditAddress address={pickupOrDeliveryList[0]} company={company} />
                    ) : (
                        <Link to={`${baseUrl}${LINK_LOGISTIC_POINTS}?company=${company.pk}`}>
                            {t("logisticPoint.seeAddresses")}
                        </Link>
                    )}
                </>
            </Flex>
        </Card>
    );
}
