import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Link, Text} from "@dashdoc/web-ui";
import {DecoratedSection} from "@dashdoc/web-ui";
import React from "react";

import {ExtensionCard} from "./types";

export const ExtensionHeader = ({
    name,
    description,
    iconUrl,
    webSite,
}: Pick<ExtensionCard, "name" | "iconUrl" | "webSite"> & {description?: string}) => {
    let betaBadge: string | undefined;
    if (name === "Gedmouv") {
        betaBadge = t("common.beta");
    }

    return (
        <Box pt={3} pb={4} mr={2} mb={3} borderBottom="1px solid" borderColor="grey.light">
            <Flex justifyContent="space-between" alignItems="start">
                <DecoratedSection
                    data-testid={name}
                    title={name}
                    subTitle={description}
                    logo={iconUrl}
                    badgeLabel={betaBadge}
                />
                <Flex flexDirection="column" alignItems="flex-end">
                    {webSite && (
                        <Text variant="caption">
                            <Link href={webSite} target="_blank" rel="noopener noreferrer">
                                {webSite}
                                <Icon name="openInNewTab" ml={3} />
                            </Link>
                        </Text>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
};
