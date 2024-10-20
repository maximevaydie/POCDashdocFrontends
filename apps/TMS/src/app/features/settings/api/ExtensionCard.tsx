import {t} from "@dashdoc/web-core";
import {Card, ClickableBox, Link, BoxProps} from "@dashdoc/web-ui";
import {Box, Flex} from "@dashdoc/web-ui";
import {DecoratedSection} from "@dashdoc/web-ui";
import React from "react";

import {
    ConnectivityStatus,
    ConnectivityStatusValue,
} from "app/features/settings/api/ConnectivityStatus";

interface ExtensionCardProps extends BoxProps {
    onClick: () => void;
    status: ConnectivityStatusValue;
    name: string;
    description: string;
    iconUrl?: string;
    beta?: boolean;
    "data-testid"?: string;
}

export const ExtensionCard = ({
    status,
    name,
    description,
    iconUrl,
    onClick,
    "data-testid": dataTestId,
    beta = false,
    ...boxProps
}: ExtensionCardProps) => {
    return (
        <Card {...boxProps} key={name} overflow={"unset"}>
            <ClickableBox p={4} onClick={onClick} data-testid={`extension-card-${dataTestId}`}>
                <Flex justifyContent="space-between" alignItems="start">
                    <DecoratedSection
                        title={name}
                        subTitle={description}
                        logo={iconUrl}
                        badgeLabel={beta ? t("common.beta") : undefined}
                    />
                    <ConnectivityStatus status={status} pt={1} />
                </Flex>
                <Flex alignItems="center" style={{gap: "8px"}}>
                    <Box width="40px" height="40px" minWidth="auto" flexShrink={2} />
                    <Box>
                        <Link>{t("common.readMoreAboutIt")}</Link>
                    </Box>
                </Flex>
            </ClickableBox>
        </Card>
    );
};
