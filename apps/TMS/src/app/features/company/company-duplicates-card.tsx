import {CompanyName, PartnerDetailOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge, Card, Flex, LoadingWheel, CardProps, Text} from "@dashdoc/web-ui";
import {Company, formatNumber} from "dashdoc-utils";
import React from "react";

import {CompanyDetail} from "./company-detail-panel";

type Props = CardProps & {
    company: Company | PartnerDetailOutput;
    isLoading?: boolean;
    wordsToHighlight?: string[];
};

export function CompanyDuplicatesCard({
    company,
    isLoading,
    wordsToHighlight,
    ...cardProps
}: Props) {
    if (isLoading) {
        return (
            <Flex css={{height: "13em"}} alignItems="center" justifyContent="center">
                <LoadingWheel />
            </Flex>
        );
    }

    const numberOfContacts = company.contacts?.length ?? 0;
    // TODO: Clean me when FF betterCompanyRoles is removed
    const addresses = "logistic_points" in company ? company.logistic_points : company.addresses;
    const numberOfAddresses = addresses?.length ?? 0;

    return (
        <Card {...cardProps} position="relative">
            <Text variant="title">
                <CompanyName company={company} highlight={wordsToHighlight} />
            </Text>
            <CompanyDetail company={company} wordsToHighlight={wordsToHighlight} />
            <Flex
                position="absolute"
                right={0}
                top={0}
                p={4}
                flexDirection="column"
                alignItems="flex-start"
            >
                <Badge paddingY={1} mb={1}>
                    {formatNumber(numberOfContacts)}{" "}
                    {t("common.contacts", {smart_count: numberOfContacts})}
                </Badge>
                <Badge paddingY={1}>
                    {formatNumber(numberOfAddresses)}{" "}
                    {t("common.addresses", {smart_count: numberOfAddresses})}
                </Badge>
            </Flex>
        </Card>
    );
}
