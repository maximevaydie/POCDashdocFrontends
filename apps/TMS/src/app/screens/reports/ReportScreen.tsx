import {ReportType} from "@dashdoc/web-common/src/types/reportsTypes";
import {t} from "@dashdoc/web-core";
import {Box, HorizontalBarChart, LoadingWheel} from "@dashdoc/web-ui";
import {FullHeightMinWidthScreen} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import {RouteComponentProps} from "react-router";

import {ReportHeader} from "app/features/reports/header/ReportHeader";

import {useParams} from "./hooks/useParams";
import {useWidget} from "./hooks/useWidget";

type ReportScreenProps = Partial<RouteComponentProps<{reportUid: string}>>;

export const ReportScreen: FunctionComponent<ReportScreenProps> = ({match}) => {
    // @ts-ignore
    const {reportUid} = useParams(match);
    const {widget, loading, onChange} = useWidget(reportUid);

    const isOrderReport = [
        ReportType.TRANSPORT_AVG_PRICING,
        ReportType.TRANSPORT_COUNT,
        ReportType.TRANSPORT_SUM_PRICING,
    ].includes(widget?.type as ReportType);

    const isTurnoverPerFleetItemReport = [
        ReportType.TURNOVER_PER_TRUCKER,
        ReportType.TURNOVER_PER_VEHICLE,
        ReportType.TURNOVER_PER_TRAILER,
        ReportType.TURNOVER_PER_KM_PER_TRUCKER,
        ReportType.TURNOVER_PER_KM_PER_VEHICLE,
        ReportType.TURNOVER_PER_KM_PER_TRAILER,
    ].includes(widget?.type as ReportType);

    return (
        <FullHeightMinWidthScreen p={4}>
            <ReportHeader widget={widget} onChange={onChange} />

            <Box backgroundColor="grey.white" mt={2} mb={2} alignItems="stretch" flexGrow={1}>
                {loading ? (
                    <LoadingWheel />
                ) : (
                    <>
                        {widget ? (
                            <HorizontalBarChart
                                {...widget}
                                informationLabel={
                                    isOrderReport
                                        ? t("reports.orderReportInformation")
                                        : t("reports.reportInformation") +
                                          (isTurnoverPerFleetItemReport
                                              ? " " +
                                                t("reports.turnoverPerFleetItemReportInformation")
                                              : "")
                                }
                                placeholder={t("common.noDataWithFilters")}
                                onSelectKey={(checkedKeys) =>
                                    onChange({
                                        parameters: {
                                            unchecked_keys: widget.results.reduce(
                                                (acc, {id}) =>
                                                    checkedKeys.includes(id) ? acc : [...acc, id],
                                                []
                                            ),
                                        },
                                    })
                                }
                            />
                        ) : (
                            t("common.noDataWithFilters")
                        )}
                    </>
                )}
            </Box>
        </FullHeightMinWidthScreen>
    );
};
