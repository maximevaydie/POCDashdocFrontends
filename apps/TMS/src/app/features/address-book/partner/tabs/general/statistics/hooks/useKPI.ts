import {DeliveriesStats} from "dashdoc-utils";
import {useMemo} from "react";

import {formatPieChartData} from "app/features/transport/transports-dashboard";

export function useKPI(data: DeliveriesStats) {
    // add labels and colors to data and extract needed information
    const kpi = useMemo(() => {
        if (!data) {
            return {};
        }
        const {
            // @ts-ignore
            not_done: notDone,
            // @ts-ignore
            done,
            // @ts-ignore
            cancelled,
        } = formatPieChartData<DeliveriesStats["progress"]>(data.progress);
        return {notDone, done, cancelled};
    }, [data]);
    return kpi;
}
