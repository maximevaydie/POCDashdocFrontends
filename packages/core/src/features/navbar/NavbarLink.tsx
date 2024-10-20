import {Box, IconNames, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React, {useCallback, useMemo} from "react";
import {useLocation} from "react-router";

import {useIsGroupView} from "../../hooks/useIsGroupView";

import {NavbarSublink} from "./NavbarSubLink";
import {SidebarTab} from "./SidebarTab";
import {SidebarQuery, SidebarChildLink} from "./types";

interface NavbarLink {
    link: string;
    label: string;
    icon?: IconNames;
    isNew?: boolean;
    children?: any;
    query?: SidebarQuery;
    testId?: string;
    handleLinkClick: (event: React.MouseEvent, link: string, query: any) => void;
    openedSidebar: boolean;
    closeSidebar: () => void;
    collapsedSidebar: boolean;
    count?: number;
}

const SidebarTabWrapper = styled(Box)`
    &:hover > div {
        display: block;
    }
`;

const SidebarSubTabWrapper = styled(Box)<{collapsedSidebar?: boolean}>`
    ${(props) =>
        props.collapsedSidebar
            ? `position:absolute; margin-left: 42px; margin-top: -35px; z-index:100; display: none; background-color: ${theme.colors.grey.ultralight}; border: 1px solid ${theme.colors.grey.light};`
            : ""};
    @media (max-width: 639px) {
        position: relative;
        display: block;
        margin: 0;
        width: 100%;
    }
`;

export function NavbarLink({
    link,
    label,
    icon,
    children,
    query,
    testId,
    handleLinkClick,
    openedSidebar,
    closeSidebar,
    collapsedSidebar,
    count,
    isNew = false,
}: NavbarLink) {
    const location = useLocation();
    const path = location.pathname;
    const isGroupView = useIsGroupView();

    const activeCategory = useMemo(() => {
        const pathIndex = isGroupView ? 3 : 2;

        if (!path.split("/")?.[pathIndex]) {
            return false;
        }
        if (link.split("/")[pathIndex] === path.split("/")[pathIndex]) {
            // Look for a match at the root level
            return true;
        } else if (children?.length > 0) {
            // Look for a match at the children level
            if (
                children.find(
                    (el: any) =>
                        el.link?.split("/")[pathIndex] === path.split("/")[pathIndex] ||
                        (el.alternativeLinks &&
                            el.alternativeLinks.some(
                                (link: string) =>
                                    link.split("/")[pathIndex] === path.split("/")[pathIndex]
                            ))
                )
            ) {
                return true;
            }
        }
        return false;
    }, [link, path, children, isGroupView]);

    const showChildren = useMemo(() => activeCategory && children, [activeCategory, children]);

    const getUrlParameter = useCallback(
        (key: string) => {
            const url = location.search.substring(1);
            const parameters = url.split("&");
            let keys;
            let index;

            for (index = 0; index < parameters.length; index++) {
                keys = parameters[index].split("=");

                if (keys[0] === key) {
                    return keys[1] === undefined ? true : decodeURIComponent(keys[1]);
                }
            }
            return null;
        },
        [location.search]
    );

    const checkLinkIsActive = useCallback(
        (link?: string, alternativeLinks?: string[], path?: string, query?: SidebarQuery) => {
            if (!location.search && link && path) {
                return link === path || !!alternativeLinks?.includes(path);
            }
            if (!getUrlParameter("tab")) {
                return (
                    location.pathname === link || !!alternativeLinks?.includes(location.pathname)
                );
            }
            return getUrlParameter("tab") === query?.tab;
        },
        [location.search, location.pathname, getUrlParameter]
    );

    const parentTabActive = useMemo(() => {
        const isChildLinkActive =
            children &&
            children.find((child: SidebarChildLink) =>
                checkLinkIsActive(child.link, child.alternativeLinks, path, child.query)
            );

        return activeCategory && !isChildLinkActive;
    }, [activeCategory, checkLinkIsActive, children, path]);

    let displayedCount = null;
    if (count !== 0 && !activeCategory) {
        displayedCount = count;
    }

    const countImportant: boolean = useMemo(() => {
        if (showChildren) {
            return false;
        }
        return children?.some(
            (child: SidebarChildLink) => child.count !== 0 && child.countImportant
        );
    }, [showChildren, children]);

    const countAlert: boolean = useMemo(() => {
        if (showChildren) {
            return false;
        }
        return children?.some((child: SidebarChildLink) => child.count !== 0 && child.countAlert);
    }, [showChildren, children]);

    return (
        <SidebarTabWrapper>
            <SidebarTab
                data-testid={`sidebar-link-${query?.tab ? query.tab : testId}`}
                activeCategory={activeCategory}
                active={parentTabActive}
                icon={icon}
                label={label}
                onClick={(event) => handleLinkClick(event, link, query)}
                openedSidebar={openedSidebar}
                closeSidebar={closeSidebar}
                displaySmall={collapsedSidebar}
                // @ts-ignore
                count={displayedCount}
                countImportant={countImportant}
                countAlert={countAlert}
                isNew={showChildren ? false : isNew}
                showChildren={showChildren}
            />

            {showChildren && (
                <SidebarSubTabWrapper collapsedSidebar={collapsedSidebar}>
                    {children.map((child: SidebarChildLink) => (
                        <NavbarSublink
                            key={child.label}
                            parentLink={link}
                            linkDetails={child}
                            isLinkActive={checkLinkIsActive(
                                child.link,
                                child.alternativeLinks,
                                path,
                                child.query
                            )}
                            handleLinkClick={handleLinkClick}
                            openedSidebar={openedSidebar}
                            closeSidebar={closeSidebar}
                        />
                    ))}
                </SidebarSubTabWrapper>
            )}
        </SidebarTabWrapper>
    );
}
