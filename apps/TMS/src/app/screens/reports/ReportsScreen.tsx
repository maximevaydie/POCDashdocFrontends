import {t} from "@dashdoc/web-core";
import {
    Flex,
    FullHeightMinWidthScreen,
    HorizontalBarChart,
    LoadingWheel,
    TabTitle,
    Text,
    Widget,
    Widgets,
} from "@dashdoc/web-ui";
import React from "react";

import {getTabTranslations} from "app/common/tabs";
import {ReportCreationButton} from "app/features/reports/create/ReportCreationButton";
import {useWidgets} from "app/screens/reports/hooks/useWidgets";
import {SidebarTabNames} from "app/types/constants";

const THUMBNAIL_LIMIT = 6;

export function ReportsScreen() {
    const {widgets, loading, onCreate, onDelete} = useWidgets();
    if (loading) {
        return <LoadingWheel />;
    }
    return (
        <FullHeightMinWidthScreen p={4}>
            <Flex justifyContent="space-between" mb={4} mr={3}>
                <TabTitle title={getTabTranslations(SidebarTabNames.REPORTS)} />
                <ReportCreationButton onCreate={onCreate} />
            </Flex>
            {widgets.length > 0 ? (
                <Widgets>
                    {widgets.map((widget) => (
                        <Widget key={widget.id} {...widget} onDelete={() => onDelete(widget.id)}>
                            <HorizontalBarChart {...widget} thumbnailLimit={THUMBNAIL_LIMIT} />
                        </Widget>
                    ))}
                </Widgets>
            ) : (
                <Text>{t("common.noResultFound")}</Text>
            )}
        </FullHeightMinWidthScreen>
    );
}
