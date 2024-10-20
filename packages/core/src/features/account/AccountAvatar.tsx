import {t} from "@dashdoc/web-core";
import {Box, ClickOutside, ClickableBox, LoadingWheel, Text, theme} from "@dashdoc/web-ui";
import {NavbarAccount} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {Manager, useToggle} from "dashdoc-utils";
import isNil from "lodash.isnil";
import React from "react";

import {TOPBAR_HEIGHT} from "../../constants/constants";
import {managerService} from "../../services/manager.service";

type Props = {
    connectedManager: Pick<Manager, "display_name" | "profile_picture" | "role"> | null;
    onMyAccount: () => void;
    onLogout: () => void;
};

export function AccountAvatar({connectedManager, onMyAccount, onLogout}: Props) {
    const [showAccountActions, , closeAccountActions, toggleAccountActions] = useToggle(false);

    if (isNil(connectedManager)) {
        return <LoadingWheel noMargin />;
    }

    const managerRoleLabel = managerService.getSidebarRoleLabel(connectedManager);

    return (
        <ClickOutside position="relative" onClickOutside={closeAccountActions}>
            <NavbarAccount
                name={connectedManager.display_name}
                role={managerRoleLabel}
                picture={connectedManager.profile_picture}
                data-testid="top-bar-account-section"
                onClick={toggleAccountActions}
            />
            {showAccountActions && (
                <Box
                    width="100%"
                    minWidth="fit-content"
                    position="absolute"
                    top={TOPBAR_HEIGHT}
                    right={0}
                    backgroundColor="grey.white"
                    boxShadow="large"
                    borderRadius={1}
                    css={css`
                        &:hover {
                            box-shadow: ${theme.shadows.large};
                        }
                    `}
                    zIndex="topbar" // to be over FloatingPanel
                >
                    <ClickableBox
                        py={2}
                        px={4}
                        onClick={() => {
                            onMyAccount();
                            closeAccountActions();
                        }}
                    >
                        <Text whiteSpace="nowrap">{t("settings.myAccount")}</Text>
                    </ClickableBox>
                    <Box width="100%" borderBottom="1px solid" borderBottomColor="grey.light" />
                    <ClickableBox
                        py={2}
                        px={4}
                        onClick={() => {
                            onLogout();
                            closeAccountActions();
                        }}
                        data-testid={"logout-menu-item"}
                    >
                        <Text whiteSpace="nowrap">{t("common.logout")}</Text>
                    </ClickableBox>
                </Box>
            )}
        </ClickOutside>
    );
}
