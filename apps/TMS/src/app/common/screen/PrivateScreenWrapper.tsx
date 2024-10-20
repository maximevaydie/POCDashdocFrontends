import {
    InvalidStateScreen,
    MainContainerWrapper,
    loadAccount,
    updateAccountCompany,
} from "@dashdoc/web-common";
import {
    getConnectedCompaniesWithAccess,
    getConnectedCompany,
    getConnectedManager,
} from "@dashdoc/web-common";
import {LoadingScreen} from "@dashdoc/web-common";
import {useToggle} from "dashdoc-utils";
import React, {ReactNode} from "react";

import {useHasTmsAccess} from "app/hooks/useIsNoTmsAccess";
import {useDispatch, useSelector} from "app/redux/hooks";
import {realtimeService} from "app/services/realtime/realtime.service";

import {Modals} from "./components/Modals";
import {SidebarWrapper} from "./components/SidebarWrapper";
import {TmsTopbar} from "./components/TmsTopbar";

/**
 * PrivateScreenWrapper is responsible for fetching the manager, the subscription and the feature flags.
 * It will handle the loading state and will wrap useful UX like the topbar or the sidebar.
 *
 * All sub screen components will be rendered with a defined:
 * - connected manager
 * - connected company
 * - featureFlags list
 * - subscription
 */
export const PrivateScreenWrapper = ({children}: {children: ReactNode}) => {
    const connectedManager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);

    const [isRedirecting, setIsRedirecting] = useToggle();

    const hasTmsAccess = useHasTmsAccess();

    const switchCompany = useSelector(({loading}) => loading.switchCompany);

    const loading = useSelector(({account}) => {
        return account.loading;
    });
    const loaded = useSelector(({account}) => account.fetched);

    /**
     * We want to load the account only once (and only if the account is empty), when the screen is mounted.
     * We use a state to store the needToDispatch status.
     * If we need to dispatch a load, we update the state thanks to setDispatched and we dispatch the loadAccount action.
     */
    const [needToDispatch, , setDispatched] = useToggle(!loading && !loaded);
    const dispatch = useDispatch();
    const companies = useSelector(getConnectedCompaniesWithAccess);
    if (needToDispatch) {
        dispatch(loadAccount());
        setDispatched(); // Stop an infinite loop!
    }

    const [sidebarOpen, , closeSidebar, toggleSidebar] = useToggle(false);

    if (loading || needToDispatch) {
        return <LoadingScreen />;
    }
    if (!connectedManager || !connectedCompany) {
        return <InvalidStateScreen onLogout={realtimeService.cleanup} />;
    }
    if (!hasTmsAccess && !isRedirecting) {
        setIsRedirecting();
        redirectToTheFirstAvailableTmsAccess();
    }
    const topBar = (
        <TmsTopbar
            connectedManager={connectedManager}
            connectedCompany={connectedCompany}
            onMenuClick={toggleSidebar}
        />
    );
    return (
        <>
            {hasTmsAccess && (
                <MainContainerWrapper topBar={topBar}>
                    <SidebarWrapper
                        /* The SidebarWrapper lifecycle is related to the manager/connectedCompany couple */
                        key={`${connectedManager.pk}_${connectedCompany.pk}`}
                        connectedManager={connectedManager}
                        connectedCompany={connectedCompany}
                        switchCompany={switchCompany}
                        isOpen={sidebarOpen}
                        onClose={closeSidebar}
                    >
                        {children}
                    </SidebarWrapper>
                </MainContainerWrapper>
            )}
            {connectedManager && <Modals connectedManager={connectedManager} />}
        </>
    );

    /**
     * Try to move the user to the first company with TMS access.
     * (Otherwise, the user will be stuck on the no TMS access screen)
     */
    function redirectToTheFirstAvailableTmsAccess() {
        if (companies.length > 0) {
            const company = companies[0];
            if (connectedCompany && connectedCompany.pk === company.pk) {
                return; // Prevent infinite loop
            }
            // switch to the first company with TMS access
            const companyId = company.pk;
            const path = "/app/";
            dispatch(updateAccountCompany({companyId, path}));
        }
    }
};
