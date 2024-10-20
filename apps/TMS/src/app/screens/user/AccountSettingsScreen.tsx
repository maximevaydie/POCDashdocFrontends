import {
    AccountSideBar,
    SettingsPassword,
    SettingsPersonalInfo,
    useBaseUrl,
} from "@dashdoc/web-common";
import {Box, Flex, TabTitle} from "@dashdoc/web-ui";
import {Screen} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import {RouteComponentProps, useHistory} from "react-router";
import {Route, Switch} from "react-router-dom";

import {getTabTranslations} from "app/common/tabs";
import {SidebarTabNames} from "app/types/constants";

type AccountSettingsProps = RouteComponentProps;

export const AccountSettingsScreen: FunctionComponent<AccountSettingsProps> = () => {
    const history = useHistory();
    const baseUrl = useBaseUrl();
    return (
        <Screen p={2}>
            <TabTitle title={getTabTranslations(SidebarTabNames.ACCOUNT)} />

            <Flex
                mt={2}
                py={4}
                backgroundColor="grey.white"
                boxShadow="small"
                flexWrap="wrap"
                width="100%"
            >
                <Box px={4} width={["100%", "100%", "25%"]}>
                    <AccountSideBar
                        onAccountInfosClick={handleAccountInfosClick}
                        onPasswordClick={handlePasswordClick}
                    />
                </Box>
                <Box px={4} width={["100%", "100%", "75%"]}>
                    <Switch>
                        <Route path="/app/account/infos" component={SettingsPersonalInfo} />
                        <Route path="/app/account/password" component={SettingsPassword} />
                    </Switch>
                </Box>
            </Flex>
        </Screen>
    );

    function handleAccountInfosClick() {
        history.push(`${baseUrl}/account/infos`);
    }

    function handlePasswordClick() {
        history.push(`${baseUrl}/account/password`);
    }
};
