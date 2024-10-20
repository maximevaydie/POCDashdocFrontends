import {apiService} from "@dashdoc/web-common";
import {ReportPost, ReportWidget} from "@dashdoc/web-common/src/types/reportsTypes";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {useEffect, useState} from "react";
import {useHistory} from "react-router";
import {toast} from "react-toastify";

import {convert} from "./utils";

export function useWidgets() {
    const history = useHistory();
    const [{widgets, loading}, setState] = useState<{
        widgets: ReportWidget[];
        loading: boolean;
    }>({
        widgets: [],
        loading: true,
    });

    const onCreate = async (report: ReportPost) => {
        const result = await apiService.Reports.post({data: report});
        if (result) {
            const newWidget = convert(result.data);
            setState((prev) => ({...prev, widgets: [...prev.widgets, newWidget]}));
            history.push(`/app/reports/${newWidget.id}`);
        }
    };

    const onDelete = async (reportUid: number) => {
        try {
            await apiService.Reports.delete(reportUid);
            setState((prev) => ({
                ...prev,
                widgets: prev.widgets.filter((aWidget) => aWidget.id !== reportUid),
            }));
        } catch (e) {
            Logger.error(e);
            setState((prev) => ({...prev, loading: false}));
            toast.error(t("common.error"));
        }
    };

    useEffect(() => {
        const fetch = async () => {
            setState((prev) => ({...prev, loading: true}));
            try {
                const response = await apiService.Reports.getAll();
                const widgets = response.results.map((result: any) => convert(result));
                setState((prev) => ({...prev, widgets, loading: false}));
            } catch (e) {
                Logger.error(e);
                setState((prev) => ({...prev, loading: false}));
            }
        };
        fetch();
    }, []);

    return {widgets, loading, onCreate, onDelete};
}
