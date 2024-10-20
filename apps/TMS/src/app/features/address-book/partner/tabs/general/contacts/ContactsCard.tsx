import {PartnerDetailOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Card, Flex, Icon, Text} from "@dashdoc/web-ui";
import {Company, type SlimCompanyForInvitation} from "dashdoc-utils";
import React from "react";

import {CompanyContacts} from "app/features/company/CompanyContacts";
import {ContactInvitationExplanation} from "app/features/company/contact/ContactInvitationExplanation";
import {useSlimCompany} from "app/hooks/useSlimCompany";

import {AddContact} from "./components/AddContact";

type Props = {
    company: Company | PartnerDetailOutput;
};

export function ContactsCard({company}: Props) {
    // company never undefined here
    const slimCompany = useSlimCompany(company) as SlimCompanyForInvitation;
    return (
        <Card p={4}>
            <Flex justifyContent="space-between" mb={2}>
                <Flex alignItems="center">
                    <Icon name="user" mr={1} />
                    <Text variant="h1">{t("components.contacts")}</Text>
                </Flex>
                <AddContact company={company} />
            </Flex>
            <Box data-testid="company-detail-contacts">
                <Text mb={4}>
                    <ContactInvitationExplanation company={slimCompany} />
                </Text>
                <CompanyContacts company={company} />
            </Box>
        </Card>
    );
}
