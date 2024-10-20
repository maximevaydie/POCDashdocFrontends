import {t} from "@dashdoc/web-core";
import {Box, Flex, TabTitle, Tabs} from "@dashdoc/web-ui";
import {FullHeightMinWidthScreen} from "@dashdoc/web-ui";
import React, {useCallback, useMemo} from "react";
import {useHistory, useLocation} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import {FleetScreen} from "app/screens/fleet/FleetScreen";
import {RequestedVehicleScreen} from "app/screens/fleet/RequestedVehicleScreen";
import {SidebarTabNames} from "app/types/constants";

export function MyEquipmentScreen() {
    const history = useHistory();
    const location = useLocation();

    const activeTab = useMemo<number>(
        () => (location.pathname.includes("requested-vehicles") ? 1 : 0),
        [location.pathname]
    );

    const handleTabChange = useCallback(
        (tabIndex: number) => {
            if (tabIndex === 0) {
                history.push("/app/fleet/vehicles/");
            } else {
                history.push("/app/fleet/requested-vehicles/");
            }
        },
        [history]
    );

    return (
        <FullHeightMinWidthScreen>
            <Box maxHeight="calc(100% - 68px)" pt={3}>
                <Flex mx={3} my={2}>
                    <TabTitle title={getTabTranslations(SidebarTabNames.FLEET)} />
                </Flex>
                <Tabs
                    initialActiveTab={activeTab}
                    onTabChanged={handleTabChange}
                    tabs={[
                        {
                            label: t("component.equipment.myOwnEquipment"),
                            content: activeTab === 0 && <FleetScreen />,
                        },
                        {
                            label: t("component.equipment.myRequestedVehicles"),
                            content: activeTab === 1 && <RequestedVehicleScreen />,
                        },
                    ]}
                />
            </Box>
        </FullHeightMinWidthScreen>
    );
}
