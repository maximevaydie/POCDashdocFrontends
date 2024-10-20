import {t} from "@dashdoc/web-core";
import {theme} from "@dashdoc/web-ui";
import {VerticalChart} from "@dashdoc/web-ui";
import {DeliveriesStats} from "dashdoc-utils";
import {useMemo} from "react";

import {formatBarChartData, formatTimeStep} from "app/features/transport/transports-dashboard";

export function useDistributionOfActivityTimesChart(data: DeliveriesStats) {
    // @ts-ignore
    const distributionOfActivityTimes: VerticalChart = useMemo(() => {
        if (data === null) {
            return null;
        }
        // @ts-ignore
        const {augmentedData: distributionOfLoadingDurationsData} = formatBarChartData<
            DeliveriesStats["loading_duration"]
        >(data.loading_duration);

        // @ts-ignore
        const {augmentedData: distributionOfUnloadingDurationsData} = formatBarChartData<
            DeliveriesStats["unloading_duration"]
        >(data.unloading_duration);

        const rows = Object.keys(distributionOfLoadingDurationsData).map((key) => ({
            label: formatTimeStep(key),
            values: [
                distributionOfLoadingDurationsData[key],
                distributionOfUnloadingDurationsData[key],
            ],
        }));

        return {
            title: t("dashboard.transports.punctuality.distributionOfActivityTimes"),
            legends: [
                {label: t("common.transportLoading"), color: theme.colors.blue.light},
                {label: t("common.transportUnloading"), color: theme.colors.blue.default},
            ],

            bars: [{color: theme.colors.blue.light}, {color: theme.colors.blue.default}],
            rows,
        };
    }, [data]);
    return distributionOfActivityTimes;
}
