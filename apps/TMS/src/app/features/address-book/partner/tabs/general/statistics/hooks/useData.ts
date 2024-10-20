import {apiService, PartnerDetailOutput} from "@dashdoc/web-common";
import {useTimezone} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {Company, DeliveriesStats} from "dashdoc-utils";
import {useEffect, useMemo, useState} from "react";

import {getTransportsQueryParamsFromFiltersQuery} from "app/features/filters/deprecated/utils";

export function useData(company: Company | PartnerDetailOutput) {
    const companyPk = company.pk.toString();
    const timezone = useTimezone();
    const [state, setState] = useState<{data: DeliveriesStats; loading: boolean}>({
        // @ts-ignore
        data: null,
        loading: true,
    });
    const {data, loading} = state;

    const currentQuery = useMemo(
        () => ({
            archived: false,
            // when arrays contain only one value they will be returned as a string
            // so we have to "arrayify" them in that case
            text: [] as string[],
            address__in: [] as string[],
            origin_address__in: [] as string[],
            destination_address__in: [] as string[],
            shipper__in: [] as string[],
            carrier__in: [companyPk],
            creator__in: [] as string[],
            trucker__in: [] as string[],
            fleet_tags__in: [] as string[],
            tags__in: [] as string[],
        }),
        [companyPk]
    );

    useEffect(() => {
        // fetch stats on mount and as soon as the query change
        const fetchDashboardData = async () => {
            // @ts-ignore
            setState({data: null, loading: true});
            try {
                const data = await apiService.Deliveries.getStats({
                    query: getTransportsQueryParamsFromFiltersQuery(currentQuery, timezone),
                });
                setState({data, loading: false});
            } catch (error) {
                // @ts-ignore
                setState({data: null, loading: false});
                Logger.error(error);
                toast.error(t("transportStats.error.couldNotFetch"));
            }
        };
        fetchDashboardData();
    }, [currentQuery, timezone]);

    return {
        loading,
        data,
    };
}
