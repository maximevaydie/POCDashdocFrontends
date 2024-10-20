import {TrackedLink} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text, FlexProps} from "@dashdoc/web-ui";
import React from "react";

export function GasIndexBanner(props: FlexProps) {
    return (
        <Flex
            py={4}
            px={3}
            backgroundColor="grey.ultralight"
            borderRadius={1}
            flexDirection="column"
            {...props}
        >
            <Flex alignItems="center">
                <Icon minWidth={"unset"} scale={1.25} name="gasIndex" color="blue.default" />
                <Text ml={3}>
                    {t("gasIndex.bannerInfo")}{" "}
                    <TrackedLink
                        to="https://help.dashdoc.eu/fr/articles/6046253-l-indexation-carburant-c-est-quoi-comment-la-calculer"
                        absoluteLink
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="sidebar-link-whats-new"
                    >
                        {t("common.findOutMore")}
                    </TrackedLink>
                </Text>
            </Flex>
        </Flex>
    );
}
