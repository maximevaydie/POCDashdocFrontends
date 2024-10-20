import {companyService, HasNotFeatureFlag, PartnerDetailOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {TabTitle, Badge, Text, Box, Flex, CompanyAvatar} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React from "react";

import {getTabTranslations} from "app/common/tabs";
import {PartnerSharingStatusBadge} from "app/features/address-book/partner/PartnerSharingStatusBadge";
import {CompanySharingStatusBadge} from "app/features/company/company-sharing-status-badge";
import {SidebarTabNames} from "app/types/constants";

type Props = {
    company: Company | PartnerDetailOutput;
};

export function PartnerHeader({company}: Props) {
    const isShipper = companyService.isShipper(company);
    const isCarrier = companyService.isCarrier(company);
    const isOther = !isShipper && !isCarrier;

    return (
        <Flex alignItems="center">
            <CompanyAvatar name={company.name} size="large" />
            <Box ml={5}>
                <Flex alignItems="center">
                    <TabTitle
                        data-testid="screen-title"
                        title={getTabTranslations(SidebarTabNames.ADDRESS_BOOK)}
                        customTitle={company.name}
                    />
                    <HasNotFeatureFlag flagName="betterCompanyRoles">
                        {isShipper && (
                            <Badge variant="purpleDark" ml={2} fontWeight="bold">
                                {t("common.shipper")}
                            </Badge>
                        )}
                        {isCarrier && (
                            <Badge variant="blueDark" ml={2} fontWeight="bold">
                                {t("common.carrier")}
                            </Badge>
                        )}
                        {isOther && (
                            <Badge variant="pinkLight" ml={2} fontWeight="bold">
                                {t("common.other")}
                            </Badge>
                        )}
                    </HasNotFeatureFlag>
                </Flex>
                <Text mt={1}>
                    {"invitation_status" in company ? (
                        <PartnerSharingStatusBadge partner={company} />
                    ) : (
                        <CompanySharingStatusBadge company={company} />
                    )}
                </Text>
            </Box>
        </Flex>
    );
}
