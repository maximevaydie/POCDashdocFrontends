import {Box, Flex, Text} from "@dashdoc/web-ui";
import isNil from "lodash.isnil";
import React from "react";

import {CountBadge} from "./CountBadge";
import {SidebarTab} from "./SidebarTab";
import {SidebarChildLink} from "./types";

interface NavbarSubLink {
    parentLink: string;
    linkDetails: SidebarChildLink;
    isLinkActive: boolean;
    handleLinkClick: (event: React.MouseEvent, link: string, query: any) => void;
    openedSidebar: boolean;
    closeSidebar: () => void;
}

export function NavbarSublink({
    parentLink,
    linkDetails,
    isLinkActive,
    handleLinkClick,
    openedSidebar,
    closeSidebar,
}: NavbarSubLink) {
    const {link, label, count, countImportant, countAlert, query, separatorBelow, testId, isNew} =
        linkDetails;
    const baseLink = link || parentLink;

    const fontColor = isLinkActive ? "blue.dark" : "grey.dark";

    return (
        <SidebarTab
            activeCategory={false}
            active={isLinkActive}
            onClick={(event) => handleLinkClick(event, baseLink, query)}
            openedSidebar={openedSidebar}
            closeSidebar={closeSidebar}
            data-testid={`sidebar-sublink-${testId ?? query?.tab}`}
            py={1}
            pl={0}
            flexDirection="column"
            width="100%"
            position="relative"
            isNew={isNew}
        >
            <Flex justifyContent="space-between" pl={6}>
                <Text color={fontColor} variant="caption">
                    {label}
                </Text>
                {!isNil(count) && (
                    <CountBadge
                        // @ts-ignore
                        important={countImportant && count !== 0}
                        alert={countAlert && count !== 0}
                    >
                        {count}
                    </CountBadge>
                )}
            </Flex>
            {separatorBelow && (
                <Box
                    width="85%"
                    borderBottom="1px solid"
                    borderColor="grey.light"
                    alignSelf="center"
                    position="absolute"
                    bottom="-0.5px"
                />
            )}
        </SidebarTab>
    );
}
