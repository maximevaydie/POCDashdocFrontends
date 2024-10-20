import {
    ReportFiltersData,
    ReportCalculationMode,
    type ReportWidgetFull,
} from "@dashdoc/web-common/src/types/reportsTypes";
import {t} from "@dashdoc/web-core";
import {TabTitle, IconButton, Box, Flex} from "@dashdoc/web-ui";
import {Area} from "dashdoc-utils";
import React, {FunctionComponent} from "react";
import {Link} from "react-router-dom";

import {getTabTranslations} from "app/common/tabs";
import {ReportActions} from "app/features/reports/actions/ReportActions";
import {ReportFilters} from "app/features/reports/filters/ReportFilters";
import {SidebarTabNames} from "app/types/constants";

const HeaderButton = (props: any) => (
    <IconButton
        {...props}
        textAlign="center"
        color="grey.ultradark"
        alignItems="center"
        fontSize={3}
    />
);

type ReportHeaderProps = {
    widget?: ReportWidgetFull;
    onChange: (newArgs: {
        parameters?: ReportFiltersData;
        origin_area?: Area | null;
        destination_area?: Area | null;
        calculation_mode?: ReportCalculationMode;
    }) => void;
};

export const ReportHeader: FunctionComponent<ReportHeaderProps> = ({widget, onChange}) => {
    const title = widget ? widget.name : t("common.noResultFound");
    return (
        <>
            <Flex justifyContent="space-between">
                <Flex alignItems="center">
                    <Link to={`/app/reports/`} data-testid={"report-list-link"}>
                        <HeaderButton name={"arrowLeft"} />
                    </Link>
                    <TabTitle
                        title={getTabTranslations(SidebarTabNames.REPORTS)}
                        customTitle={title}
                    />
                </Flex>
                {widget && <ReportActions widget={widget} onChange={onChange} />}
            </Flex>
            {widget && (
                <Box pt={3} pb={2}>
                    <ReportFilters widget={widget} onChange={onChange} />
                </Box>
            )}
        </>
    );
};
