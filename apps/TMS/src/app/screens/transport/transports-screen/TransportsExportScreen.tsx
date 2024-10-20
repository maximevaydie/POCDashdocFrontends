import {
    Flex,
    FullHeightMinWidthScreen,
    ScrollableTableFixedHeader,
    TabTitle,
} from "@dashdoc/web-ui";
import React from "react";

import {getTabTranslations} from "app/common/tabs";
import {Exports} from "app/features/export/Exports";
import {ExportTabButton} from "app/screens/transport/transports-screen/components/ExportTabButton";
import {SidebarTabNames} from "app/types/constants";

export function TransportsExportScreen() {
    return (
        <FullHeightMinWidthScreen pt={3}>
            {/* Header */}
            <ScrollableTableFixedHeader>
                <Flex justifyContent="space-between" mb={1} alignItems="center">
                    <TabTitle title={getTabTranslations(SidebarTabNames.TRANSPORTS_EXPORT)} />
                    <ExportTabButton active />
                </Flex>
            </ScrollableTableFixedHeader>

            <Exports
                dataTypes={["deliveries", "custom_deliveries", "pricing"]}
                overflow="hidden"
                px={3}
                pb={3}
            />
        </FullHeightMinWidthScreen>
    );
}
