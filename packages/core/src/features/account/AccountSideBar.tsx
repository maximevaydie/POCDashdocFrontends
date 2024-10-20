import {t} from "@dashdoc/web-core";
import {PaneButtonGroup} from "@dashdoc/web-ui";
import React from "react";

import {SidebarLink} from "../SidebarLink";

type Props = {
    onAccountInfosClick: () => void;
    onPasswordClick: () => void;
};

export function AccountSideBar({onAccountInfosClick, onPasswordClick}: Props) {
    return (
        <PaneButtonGroup>
            <SidebarLink
                id="account-infos"
                onLinkClick={onAccountInfosClick}
                icon="user"
                path="infos"
                label={t("settings.personalInformation")}
            />
            <SidebarLink
                id="account-password"
                onLinkClick={onPasswordClick}
                icon="unlock"
                path="password"
                label={t("common.password")}
            />
        </PaneButtonGroup>
    );
}
