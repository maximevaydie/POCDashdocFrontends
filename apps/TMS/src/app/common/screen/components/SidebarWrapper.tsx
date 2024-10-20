import {
    useSetupHelp,
    useSetupI18n,
    useSetupMonitoringUser,
    useSetupTracking,
} from "@dashdoc/web-common";
import {LoadingWheel} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import styled from "@emotion/styled";
import {Company, Manager} from "dashdoc-utils";
import React, {ReactNode} from "react";

import {useSetupRealtime} from "app/common/screen/components/useSetupRealtime";
import {Sidebar} from "app/features/sidebar/Sidebar";

const MAIN_CONTENT_CONTAINER_ID = "main-content";

const MainContent = styled("div")`
    height: 100%;
    overflow-y: auto;
    flex: 1;
`;

/**
 * Wrapper to insert the side bar.
 */
export const SidebarWrapper = ({
    connectedManager,
    connectedCompany,
    switchCompany,
    isOpen,
    onClose,
    children,
}: {
    connectedManager: Manager;
    connectedCompany: Company;
    switchCompany: boolean;
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}) => {
    useSetupI18n(connectedManager);
    useSetupTracking(connectedManager, connectedCompany);
    useSetupHelp(connectedManager, connectedCompany);
    useSetupRealtime(connectedManager, connectedCompany);
    useSetupMonitoringUser(connectedManager.user.pk);
    return (
        <>
            <Sidebar isOpen={isOpen} onClose={onClose} />
            <MainContent id={MAIN_CONTENT_CONTAINER_ID}>
                {switchCompany ? (
                    <LoadingWheel />
                ) : (
                    <div
                        id="react-app-loaded"
                        css={css`
                            height: 100%;
                        `}
                    >
                        {children}
                    </div>
                )}
            </MainContent>
        </>
    );
};
