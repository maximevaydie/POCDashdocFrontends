import {apiService} from "@dashdoc/web-common";
import {
    ReportFiltersData,
    ReportCalculationMode,
    ReportWidgetFull,
} from "@dashdoc/web-common/src/types/reportsTypes";
import {Logger} from "@dashdoc/web-core";
import {Area} from "dashdoc-utils";
import {useCallback, useEffect, useMemo, useState} from "react";

import {convertFull} from "./utils";

export function useWidget(reportUid: number) {
    const [{widget, loading}, setState] = useState<{
        widget: ReportWidgetFull;
        loading: boolean;
        reportUid: number;
    }>({
        // @ts-ignore
        widget: null,
        loading: true,
        // @ts-ignore
        reportUid: null,
    });

    useEffect(() => {
        const fetch = async () => {
            setState((prev) => ({...prev, reportUid, loading: true}));
            try {
                const result = await apiService.Reports.get(reportUid);
                const widget = convertFull(result);
                setState((prev) => {
                    if (prev.reportUid === reportUid) {
                        return {
                            ...prev,
                            widget,
                            loading: false,
                        };
                    } else {
                        // A concurrent async has changed the reportUid. We drop this useEffect.
                        return prev;
                    }
                });
            } catch (e) {
                Logger.error(e);
                setState((prev) => {
                    if (prev.reportUid === reportUid) {
                        return {...prev, loading: false};
                    } else {
                        // A concurrent async has changed the reportUid. We drop this useEffect.
                        return prev;
                    }
                });
            }
        };
        fetch();
    }, [reportUid]);

    const currentArgs = useMemo(() => {
        const result = {} as {
            origin_area?: Area;
            destination_area?: Area;
            parameters?: ReportFiltersData;
            calculation_mode?: ReportCalculationMode;
        };
        if (widget?.parameters) {
            result.parameters = widget.parameters;
        }
        if (widget?.origin_area && widget.origin_area.places?.length > 0) {
            result.origin_area = widget.origin_area;
        }
        if (widget?.destination_area && widget.destination_area.places?.length > 0) {
            result.destination_area = widget.destination_area;
        }
        return result;
    }, [widget]);

    const onChange = useCallback(
        async (newArgs: {
            parameters?: ReportFiltersData;
            origin_area?: Area | null;
            destination_area?: Area | null;
            calculation_mode?: ReportCalculationMode;
        }) => {
            setState((prev) => ({...prev, loading: true}));
            try {
                const data = {
                    ...currentArgs,
                };
                if (newArgs?.parameters !== undefined) {
                    data.parameters = {...data.parameters, ...newArgs.parameters};
                }

                if (newArgs?.calculation_mode !== undefined) {
                    data.calculation_mode = newArgs.calculation_mode;
                }

                if (newArgs?.origin_area !== undefined) {
                    if (newArgs.origin_area && newArgs.origin_area?.places?.length > 0) {
                        data.origin_area = newArgs.origin_area;
                    } else {
                        // @ts-ignore
                        data.origin_area = null;
                    }
                }
                if (newArgs?.destination_area !== undefined) {
                    if (newArgs.destination_area && newArgs.destination_area?.places?.length > 0) {
                        data.destination_area = newArgs.destination_area;
                    } else {
                        // @ts-ignore
                        data.destination_area = null;
                    }
                }
                const result = await apiService.Reports.patch(reportUid, {data});
                const newWidget = convertFull(result);
                setState((prev) => {
                    if (prev.reportUid === reportUid) {
                        return {
                            ...prev,
                            widget: newWidget,
                            loading: false,
                        };
                    } else {
                        // A concurrent async has changed the reportUid. We drop this useEffect.
                        return prev;
                    }
                });
            } catch (e) {
                Logger.error(e.message);
                //todo
                setState((prev) => {
                    if (prev.reportUid === reportUid) {
                        return {...prev, loading: false};
                    } else {
                        // A concurrent async has changed the reportUid. We drop this useEffect.
                        return prev;
                    }
                });
            }
        },
        [reportUid, currentArgs]
    );

    return {
        widget,
        loading,
        onChange,
    };
}
