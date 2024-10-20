import {
    CompanySwitcher,
    ReferralLink,
    getConnectedCompaniesWithAccess,
    getConnectedCompany,
    getConnectedGroupViews,
    getConnectedManager,
    managerService,
} from "@dashdoc/web-common";
import {Box, theme, useDevice} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import styled from "@emotion/styled";
import React, {useCallback, useEffect} from "react";

import {CollapsedContext, CollapsedProvider} from "app/features/sidebar/CollapsedContext";
import {MainActions} from "app/features/sidebar/components/MainActions";
import {MainMenu} from "app/features/sidebar/components/MainMenu";
import {SettingMenu} from "app/features/sidebar/components/SettingMenu";
import {SidebarCollapser} from "app/features/sidebar/components/SidebarCollapser";
import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {fetchConfirmationDocumentsCounts} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";

const NavbarStyled = styled(Box)<{animation?: string}>`
    @keyframes expand {
        from {
            width: 42px;
        }
        to {
            width: 220px;
        }
    }
    @keyframes collapse {
        from {
            width: 220px;
        }
        to {
            width: 42px;
        }
    }
    @media (min-width: 639px) {
        animation-name: ${(props) =>
            props.animation ? (props.animation === "collapse" ? "collapse" : "expand") : "none"};
        animation-timing-function: ease-in-out;
        animation-duration: 0.2s;
    }
    color: ${(props) =>
        props.animation === "collapsed" ? theme.colors.red.default : theme.colors.green.default};
`;

export function Sidebar({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
    const connectedManager = useSelector(getConnectedManager);
    const groupViews = useSelector(getConnectedGroupViews);
    const companies = useSelector(getConnectedCompaniesWithAccess);
    const connectedCompany = useSelector(getConnectedCompany);

    const dispatch = useDispatch();

    const device = useDevice();

    const transportListRefresher = useRefreshTransportLists();

    const refreshCounts = useCallback(transportListRefresher, [transportListRefresher]);

    useEffect(() => {
        refreshCounts();
        if (managerService.hasAtLeastUserRole(connectedManager)) {
            dispatch(fetchConfirmationDocumentsCounts());
        }
    }, [connectedManager?.role]);

    return (
        <CollapsedProvider>
            <CollapsedContext.Consumer>
                {({collapsed, animation}) => (
                    <NavbarStyled
                        width={["100%", collapsed ? "42px" : "240px"]}
                        display={"flex"}
                        flexDirection="column"
                        maxHeight="100%"
                        backgroundColor="grey.ultralight"
                        position={["absolute", "relative"]}
                        zIndex={[
                            "topbar", // on mobile the sidebar is on top of everything else
                            "navbar",
                        ]}
                        animation={animation}
                        borderRight={"1px solid"}
                        borderRightColor="grey.light"
                        css={css`
                            left: ${device === "mobile" && !isOpen ? "-100%" : "0"};
                            transition: left 0.1s ease-in-out;

                            // This responsive breakpoint was set based on the default styled system breakpoints values
                            // as no custom breakpoints were set in theme.ts
                            // Source: https://styled-system.com/api/#defaults
                            @media screen and (min-width: 40em) {
                                #collapse-toggle-button {
                                    display: flex;
                                }
                            }
                        `}
                    >
                        <SidebarCollapser>
                            <CompanySwitcher
                                connectedManager={connectedManager}
                                connectedCompany={connectedCompany}
                                connectedGroupViews={groupViews}
                                connectedCompanies={companies}
                                displaySmall={collapsed}
                                redirectPath="/app/"
                            />
                        </SidebarCollapser>

                        <MainActions onClose={onClose} />

                        <Box display={"flex"} overflowY="auto" flex={1} flexDirection="column">
                            <Box flex={1} flexBasis="auto">
                                <MainMenu isOpen={isOpen} onClose={onClose} />
                            </Box>

                            <Box flexShrink={1}>
                                <SettingMenu isOpen={isOpen} onClose={onClose} />
                            </Box>
                            {!collapsed && (
                                <Box
                                    backgroundColor="grey.light"
                                    borderTop={"1px solid"}
                                    borderTopColor="grey.light"
                                >
                                    <ReferralLink product="tms" />
                                </Box>
                            )}
                        </Box>
                    </NavbarStyled>
                )}
            </CollapsedContext.Consumer>
        </CollapsedProvider>
    );
}
