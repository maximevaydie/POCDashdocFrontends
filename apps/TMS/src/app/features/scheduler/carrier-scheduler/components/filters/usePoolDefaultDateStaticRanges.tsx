import {useToday} from "@dashdoc/web-common";
import {DateRangePickerProps} from "@dashdoc/web-ui";
import {useMemo} from "react";

import {getPoolDefaultDateStaticRanges} from "app/features/scheduler/carrier-scheduler/components/filters/filters.service";

export function usePoolDefaultDateStaticRanges(): DateRangePickerProps["staticRanges"] {
    const today = useToday();

    return useMemo(() => getPoolDefaultDateStaticRanges(today), [today]);
}
