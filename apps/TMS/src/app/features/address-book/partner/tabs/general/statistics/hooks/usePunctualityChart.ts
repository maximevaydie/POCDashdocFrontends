import {t} from "@dashdoc/web-core";
import {theme} from "@dashdoc/web-ui";
import {Bar, Legend, ChartRow, VerticalChart} from "@dashdoc/web-ui";
import {DeliveriesStats} from "dashdoc-utils";
import {useMemo} from "react";

export function usePunctualityChart(data: DeliveriesStats) {
    // @ts-ignore
    const punctualityChart: VerticalChart = useMemo(() => {
        if (data === null) {
            return null;
        }

        const legends: Legend[] = [
            {label: t("dashboard.transports.ontime"), color: theme.colors.green.default},
            {label: t("dashboard.transports.delayed"), color: theme.colors.red.default},
            {
                label: t("dashboard.transports.punctuality.unknown"),
                color: theme.colors.grey.default,
            },
        ];
        const bars: Bar[] = [
            {color: theme.colors.green.default, barSize: 40, stackId: "group1"},
            {color: theme.colors.red.default, barSize: 40, stackId: "group1"},
            {color: theme.colors.grey.default, barSize: 40, stackId: "group1"},
        ];
        const rows: ChartRow[] = [
            {
                values: data.loading_punctuality.map((item) => item.value),
                label: t("common.transportLoading"),
            },
            {
                values: data.unloading_punctuality.map((item) => item.value),
                label: t("common.transportUnloading"),
            },
        ];
        return {
            title: t("dashboard.transports.punctuality"),
            legends,
            bars,
            rows,
        };
    }, [data]);
    return punctualityChart;
}
