import {t} from "@dashdoc/web-core";
import {theme} from "@dashdoc/web-ui";
import {VerticalChart} from "@dashdoc/web-ui";
import {DeliveriesStats} from "dashdoc-utils";
import {useMemo} from "react";

import {formatBarChartData, formatTimeStep} from "app/features/transport/transports-dashboard";

export function useDelayChart(data: DeliveriesStats) {
    // @ts-ignore
    const delayChart: VerticalChart = useMemo(() => {
        if (data === null) {
            return null;
        }
        // @ts-ignore
        const {augmentedData: loadingDelays} = formatBarChartData<
            DeliveriesStats["loading_delay"]
        >(data.loading_delay);

        // @ts-ignore
        const {augmentedData: unloadingDelays} = formatBarChartData<
            DeliveriesStats["unloading_delay"]
        >(data.unloading_delay);

        const rows = Object.keys(loadingDelays).map((delay) => ({
            label: formatTimeStep(delay),
            values: [loadingDelays[delay], unloadingDelays[delay]],
        }));

        return {
            title: t("dashboard.transports.punctuality.distributionOfDelays"),
            legends: [
                {label: t("common.transportLoading"), color: theme.colors.blue.light},
                {label: t("common.transportUnloading"), color: theme.colors.blue.default},
            ],
            bars: [{color: theme.colors.blue.light}, {color: theme.colors.blue.default}],
            rows,
        };
    }, [data]);
    return delayChart;
}
