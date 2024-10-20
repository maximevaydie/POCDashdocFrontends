import type {
    Report,
    ReportData,
    ReportDataPart,
    ReportType,
    ReportWidget,
    ReportWidgetFull,
} from "@dashdoc/web-common";
import {i18nReportService} from "@dashdoc/web-core";
import {theme} from "@dashdoc/web-ui";
import {HorizontalChartRow} from "@dashdoc/web-ui";

const AVAILABLE_COLORS = Object.values(theme.colors.pool);

/**
 * Convert a {IResultPart} to a {HorizontalChartRow}.
 */
const convertResult = (result: ReportDataPart, i: number, reportType: ReportType) => {
    const color = AVAILABLE_COLORS[i % AVAILABLE_COLORS.length];
    const value = Number(result.value);
    const valueLabel = i18nReportService.getValueLabel(value, reportType);
    const row: HorizontalChartRow = {...result, value, valueLabel, color};
    return row;
};

/**
 * Convert a {ReportData} to a {TWidget}.
 */
export const convert = (reportData: ReportData) => {
    const {subtitle_value, ...others} = reportData;
    const results: HorizontalChartRow[] = reportData.results.map((result, i) =>
        convertResult(result, i, reportData.type)
    );
    const widget: ReportWidget = {
        titleLabel: i18nReportService.getTotalCalculationLabel(reportData.type),
        titleValue: i18nReportService.getValueLabel(subtitle_value, reportData.type),
        ...others,
        results,
    };
    return widget;
};

/**
 * Convert a {Report} to a {ReportWidgetFull}.
 */
export const convertFull = (report: Report) => {
    const data = report.data as ReportData;
    const {type, parameters, origin_area, destination_area} = report;
    const {subtitle_value, ...others} = data;
    const results: HorizontalChartRow[] = data.results.map((result, i) =>
        convertResult(result, i, type)
    );
    const widget: ReportWidgetFull = {
        // @ts-ignore
        type,
        parameters,
        origin_area,
        destination_area,
        titleLabel: i18nReportService.getTotalCalculationLabel(type),
        titleValue: i18nReportService.getValueLabel(subtitle_value, report.type),
        ...others,
        results,
    };
    return widget;
};
