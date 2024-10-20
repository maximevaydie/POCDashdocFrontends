import {useTimezone} from "@dashdoc/web-common";
import {cloneDeep} from "lodash";

import {getTransportsQueryParamsFromFiltersQuery} from "app/features/filters/deprecated/utils";
import {fetchCounters} from "app/redux/actions/counters";
import {fetchSearchTransportsCount, redoSearchTransports} from "app/redux/actions/transports";
import {useDispatch} from "app/redux/hooks";
import {TRANSPORTS_QUERY_NAME} from "app/types/constants";

import {baseParseQuery} from "../screens/transport/transports-screen/transportScreen.service";

export function useRefreshTransportLists() {
    const timezone = useTimezone();
    const dispatch = useDispatch();

    return (onlyCounters = false) => {
        const isTransportTab = /^\/app\/(transports|orders)\/$/.test(location.pathname);
        const currentQuery = baseParseQuery(location.search, true);
        const newQuery = cloneDeep(currentQuery);
        const queryFilters = getTransportsQueryParamsFromFiltersQuery(newQuery, timezone, true);
        dispatch(fetchCounters());
        if (isTransportTab && !onlyCounters) {
            dispatch(fetchSearchTransportsCount(queryFilters));
            dispatch(redoSearchTransports(TRANSPORTS_QUERY_NAME, queryFilters));
        }
    };
}
