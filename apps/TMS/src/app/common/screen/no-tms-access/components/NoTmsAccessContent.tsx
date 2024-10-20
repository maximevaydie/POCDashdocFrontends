import {StaticImage, assets} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

export function NoTmsAccessContent() {
    return (
        <Flex flexDirection="column" px={9} pt={8} pb={4} flex={1}>
            <Flex flexDirection="column">
                <Flex mx="auto">
                    <StaticImage src={assets.DASHDOC_TMS_LOGO} height={34} />
                </Flex>
                <Text variant="title" textAlign="center" mt={6}>
                    {t("tms.noAccess.welcome")}
                </Text>
                <Flex flexDirection="column" style={{gap: "32px"}} my={8}>
                    <InfoItem
                        logo={<Icon name="truck" fontSize={6} />}
                        title={t("tms.noAccess.digitizeAndManage")}
                        description={t("tms.noAccess.digitizeAndManageDescription")}
                    />
                    <InfoItem
                        logo={<Icon name="accountingInvoice" fontSize={6} />}
                        title={t("tms.noAccess.invoiceEasily")}
                        description={t("tms.noAccess.invoiceEasilyDescription")}
                    />
                    <InfoItem
                        logo={<Icon name="teamMeeting" fontSize={6} />}
                        title={t("tms.noAccess.exchangeFlowBetter")}
                        description={t("tms.noAccess.exchangeFlowBetterDescription")}
                    />
                    <InfoItem
                        logo={<Icon name="mobilePhone" fontSize={6} />}
                        title={t("tms.noAccess.flexibilityGain")}
                        description={t("tms.noAccess.flexibilityGainDescription")}
                    />
                </Flex>
            </Flex>
        </Flex>
    );
}

const TextWithFancyUnderline = styled(Text)`
    & u {
        text-decoration-color: ${theme.colors.blue.dark + "33"};
        text-decoration-thickness: 6px;
        text-underline-offset: 0px;
        text-decoration-line: underline;
        text-decoration-skip-ink: none;
    }
`;

function InfoItem({
    title,
    description,
    logo,
}: {
    title: string;
    description: React.ReactNode;
    logo: React.ReactNode;
}) {
    return (
        <Flex>
            <Box my="auto" mr={5} color="blue.dark">
                {logo}
            </Box>
            <Box flexGrow={1}>
                <TextWithFancyUnderline
                    variant="h1"
                    // The translated text contains <u> tags
                    dangerouslySetInnerHTML={{__html: title}} // nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml
                />
                <Text>{description}</Text>
            </Box>
        </Flex>
    );
}
