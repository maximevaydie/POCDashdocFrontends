import {BuildConstants, LocaleOption, t} from "@dashdoc/web-core";
import {Box, theme} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {User} from "dashdoc-utils";
import React from "react";

import {LanguageSelect} from "./components/LanguageSelect";

const NavbarNoCollapse = css`
    .navbar-header {
        float: left !important;
    }

    .collapse.navbar-collapse {
        display: block !important;
    }
    .navbar-nav > li,
    .navbar-nav {
        float: left !important;
    }

    .navbar-nav.navbar-right:last-child {
        margin-right: -15px !important;
    }

    .navbar-right {
        float: right !important;
    }
`;

const NavbarBrandedLogo = css`
    background-color: white !important;

    .navbar-brand {
        padding: 3px;
        img {
            height: 100%;
            margin: 0;
        }
    }
`;

const NavbarInverseSignature = css`
    background-color: white !important;
`;

interface Props {
    logo?: string | null;
    isSignatureMode?: boolean;
    showLanguageSelector?: boolean;
    onLanguageChange?: (language: string) => void;
    /**
     * This component is used to display the navbar with the new colors
     * but we need to spend time to refactor the navbar and check that it doesn't break anything for others view.
     */
    newColors?: boolean;
    /**
     * When used in Public screens, user is not logged in so we must not display
     * the user dropdown
     */
    forPublicScreen?: boolean;
}

interface UserProps {
    user: Pick<User, "display_name">;
    onLogout: () => void;
}

export function SimpleNavbar(props: Props | (Props & UserProps)) {
    const {logo, newColors = false, forPublicScreen = false} = props;

    return (
        <nav
            className={`navbar navbar-fixed-top ${logo ? "" : "navbar-inverse"}`}
            css={[
                NavbarNoCollapse,
                !!logo && NavbarBrandedLogo,
                props.isSignatureMode && NavbarInverseSignature,
            ]}
            style={
                newColors
                    ? {
                          backgroundColor: theme.colors.blue.dark,
                          borderColor: theme.colors.blue.dark,
                      }
                    : undefined
            }
        >
            <div className="container">
                <div className="navbar-header">
                    {logo ? (
                        <a className="navbar-brand" href="#">
                            <img src={logo} />
                        </a>
                    ) : (
                        <a className="navbar-brand" href="https://www.dashdoc.eu/">
                            <img
                                src={`${BuildConstants.staticUrl}img/logo-dashdoc${
                                    props.isSignatureMode ? "" : "-white"
                                }.png`}
                            />
                        </a>
                    )}
                </div>
                {props.showLanguageSelector && (
                    <div style={{float: "right", width: "70px", paddingTop: "7px"}}>
                        <LanguageSelect
                            onChange={(option: LocaleOption) => {
                                if (props.onLanguageChange && option.value) {
                                    props.onLanguageChange(option.value);
                                }
                            }}
                        />
                    </div>
                )}

                {"user" in props && (
                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav navbar-right">
                            {forPublicScreen ? (
                                <Box style={{color: "white"}} mt={3}>
                                    {props.user.display_name}
                                </Box>
                            ) : (
                                <li className="dropdown">
                                    <a
                                        href="#"
                                        className="dropdown-toggle"
                                        data-toggle="dropdown"
                                        role="button"
                                        aria-haspopup="true"
                                        aria-expanded="false"
                                    >
                                        {props.user.display_name}
                                        <span className="caret" />
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <a css={{cursor: "pointer"}} onClick={props.onLogout}>
                                                {t("common.logout")}
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
}
