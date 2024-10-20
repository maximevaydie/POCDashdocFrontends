import {StaticImage, assets} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Text, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

import {CalendarSvg} from "./CalendarSvg";
import {StarSvg} from "./StarSvg";
import {TimeSvg} from "./TimeSvg";

export function WelcomeContent() {
    return (
        <Flex flexDirection="column" px={[2, 2, 9]} pt={[4, 4, 8]} pb={4} flex={1}>
            <Flex flexDirection="column">
                <Flex mx="auto">
                    <StaticImage src={assets.DASHDOC_FLOW_LOGO} height={34} />
                </Flex>
                <Text variant="title" textAlign="center" mt={6}>
                    {t("flow.welcomeContent.welcome")}
                </Text>
                <Flex flexDirection="column" style={{gap: "32px"}} my={8}>
                    <InfoItem
                        logo={<CalendarSvg />}
                        title={t("flow.welcomeContent.bookInAFewClicks")}
                        description={t("flow.welcomeContent.bookInAFewClicksDescription")}
                    />
                    <InfoItem
                        logo={<TimeSvg />}
                        title={t("flow.welcomeContent.minimizeWaitingTime")}
                        description={t("flow.welcomeContent.minimizeWaitingTimeDescription")}
                    />
                    <InfoItem
                        logo={<StarSvg />}
                        title={t("flow.welcomeContent.unexpectedChange")}
                        description={t("flow.welcomeContent.unexpectedChangeDescription")}
                    />
                </Flex>
            </Flex>
        </Flex>
    );
}

const TextWithFancyUnderline = styled(Text)`
    & u {
        text-decoration-color: ${theme.colors.blue.default + "66"};
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
            <Box my="auto" mr={5}>
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
