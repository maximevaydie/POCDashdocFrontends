import {
    NavbarLink,
    getConnectedManager,
    managerService,
    useIsGroupView,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import React, {useContext} from "react";
import {useHistory} from "react-router-dom";

import {CollapsedContext} from "app/features/sidebar/CollapsedContext";
import {useSelector} from "app/redux/hooks";

type Props = {isOpen: boolean; onClose: () => void};
export function SettingMenu({isOpen, onClose}: Props) {
    const history = useHistory();
    const connectedManager = useSelector(getConnectedManager);
    const isGroupView = useIsGroupView();

    const {collapsed} = useContext(CollapsedContext);
    if (isGroupView) {
        return (
            <NavbarLink
                key="settings"
                link={"/app/groupview/settings/"}
                label={t("sidebar.settings")}
                icon="cog"
                testId="settings"
                handleLinkClick={handleLinkClick}
                openedSidebar={isOpen}
                closeSidebar={onClose}
                collapsedSidebar={collapsed}
            />
        );
    }
    if (!managerService.hasAtLeastUserRole(connectedManager)) {
        return null;
    }

    return (
        <NavbarLink
            key="settings"
            link={
                managerService.hasAtLeastAdminRole(connectedManager)
                    ? "/app/settings/company/"
                    : "/app/settings/support-types/"
            }
            label={t("sidebar.settings")}
            icon="cog"
            testId="settings"
            handleLinkClick={handleLinkClick}
            openedSidebar={isOpen}
            closeSidebar={onClose}
            collapsedSidebar={collapsed}
        />
    );

    function handleLinkClick(_: React.MouseEvent, link: string) {
        history.push({pathname: link});
    }
}
