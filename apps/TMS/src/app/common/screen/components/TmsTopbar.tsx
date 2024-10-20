import {
    DashdocTmsLogo,
    TopBar,
    authService,
    useIsGroupView,
    useBaseUrl,
    TMS_ROOT_PATH,
    updateAccountCompany,
} from "@dashdoc/web-common";
import {Company, Manager, stringifyQueryObject} from "dashdoc-utils";
import React from "react";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router";

import {transportsListAnalyticsService} from "app/features/transport/transports-list/services/transportsListAnalytics.service";
import {realtimeService} from "app/services/realtime/realtime.service";

import {SearchBar} from "./SearchBar";

type Props = {
    connectedManager: Manager;
    connectedCompany: Company;
    onMenuClick: () => void;
};

export function TmsTopbar({connectedManager, connectedCompany, onMenuClick}: Props) {
    const history = useHistory();
    const baseUrl = useBaseUrl();
    const isGroupView = useIsGroupView();
    const dispatch = useDispatch();

    return (
        <TopBar
            key={"main-top-bar"}
            logo={<DashdocTmsLogo />}
            searchBar={<SearchBar onSearch={handleSearch} />}
            connectedManager={connectedManager}
            onLogoClick={handleLogoClick}
            onMoreClick={onMenuClick}
            onLogout={handleLogout}
            onMyAccount={handleMyAccount}
        />
    );

    function handleLogout() {
        realtimeService.cleanup();
        authService.logout();
    }

    function handleLogoClick() {
        history.push(`${baseUrl}/`);
    }

    function handleMyAccount() {
        if (isGroupView) {
            dispatch(
                updateAccountCompany({
                    companyId: connectedCompany.pk,
                    path: `${TMS_ROOT_PATH}/account/infos/`,
                })
            );
        } else {
            history.push(`${baseUrl}/account/infos/`);
        }
    }

    function handleSearch(value: string) {
        transportsListAnalyticsService.sendTransportsSearchAnalyticsEvent(
            connectedCompany.pk,
            "top_bar"
        );

        history.push({
            pathname: `${baseUrl}/transports/`,
            search: stringifyQueryObject(
                {
                    isExtendedSearch: true,
                    archived: undefined,
                    text: [value],
                    tab: "results",
                },
                {skipEmptyString: false, skipNull: true, arrayFormat: "comma"}
            ),
        });
    }
}
