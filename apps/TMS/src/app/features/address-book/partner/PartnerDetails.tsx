import {companyService, PartnerDetailOutput, useBaseUrl} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Link, Tabs} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React from "react";
import {useHistory} from "react-router";

import {LINK_PARTNERS} from "app/features/sidebar/constants";

import {PartnerActions} from "./PartnerActions";
import {PartnerHeader} from "./PartnerHeader";
import {GeneralTab} from "./tabs/general/GeneralTab";
import {TemplateTab} from "./tabs/template/TemplateTab";

type Props = {
    partner: Company | PartnerDetailOutput;
    tabTemplateSelected: boolean;
    fromAddressBook?: boolean;
    onDelete: () => void;
    onUpdate: () => void;
};

export function PartnerDetails({
    partner,
    tabTemplateSelected,
    fromAddressBook,
    onDelete,
    onUpdate,
}: Props) {
    const history = useHistory();
    const baseUrl = useBaseUrl();

    const tabs = [
        {
            label: t("common.general"),
            testId: "partner-detail-main-tab",
            content: (
                <Box m={4}>
                    <GeneralTab company={partner} onUpdate={onUpdate} />
                </Box>
            ),
        },
    ];
    const isShipper = companyService.isShipper(partner);
    if (isShipper) {
        tabs.push({
            label: t("transportTemplates.templateListTitle"),
            testId: "shipper-detail-template-tab",
            content: (
                <Box m={4}>
                    <TemplateTab company={partner} />
                </Box>
            ),
        });
    }
    return (
        <Flex flexDirection="column" data-testid="partner-details">
            <Box p={4}>
                {fromAddressBook ? (
                    <Flex justifyContent="space-between">
                        <PartnerHeader company={partner} />
                        <Box alignItems="start">
                            <PartnerActions
                                company={partner}
                                fromAddressBook={fromAddressBook}
                                onDelete={onDelete}
                            />
                        </Box>
                    </Flex>
                ) : (
                    <>
                        <Flex justifyContent="space-between" mb={4}>
                            <Link
                                fontWeight={600}
                                onClick={() => history.push(`${baseUrl}${LINK_PARTNERS}`)}
                                display="flex"
                                alignItems="center"
                            >
                                <Icon name={"arrowLeftFull"} pr={2} />
                                <Box mb="2px">{t("partner.backToPartners")}</Box>
                            </Link>
                            <PartnerActions
                                company={partner}
                                fromAddressBook={fromAddressBook}
                                onDelete={onDelete}
                            />
                        </Flex>
                        <PartnerHeader company={partner} />
                    </>
                )}
            </Box>
            <Tabs
                pl={4}
                initialActiveTab={tabTemplateSelected ? 1 : 0}
                tabs={tabs}
                actionButton={null}
            />
        </Flex>
    );
}
