import {useTimezone} from "@dashdoc/web-common";
import {useToggle} from "dashdoc-utils";
import {useCallback, useEffect, useMemo} from "react";
import {useDispatch} from "react-redux";

import {getTransportsQueryParamsFromFiltersQuery} from "app/features/filters/deprecated/utils";
import {selectRows} from "app/redux/actions/selections";
import {useSelector} from "app/redux/hooks";
import {TransportsScreenQuery} from "app/screens/transport/transports-screen/transports.types";

import type {Transport} from "app/types/transport";
import type {TransportListWeb} from "app/types/transport_list_web";

export function useTransportSelection(
    transports: TransportListWeb[] | undefined,
    currentSelection: string[],
    currentQuery: TransportsScreenQuery
) {
    const [allTransportsSelected, selectAllTransports, unselectAllTransports] = useToggle();
    const dispatch = useDispatch();
    const timezone = useTimezone();
    const onSelectTransport = useCallback((transport: Transport, selected: boolean) => {
        dispatch(selectRows(selected, "transports", [transport.uid]));
        unselectAllTransports();
    }, []);
    const onSelectAllVisibleTransports = useCallback(
        (selected: boolean) => {
            dispatch(selectRows(selected, "transports", transports?.map(({uid}) => uid) ?? []));
            unselectAllTransports();
        },
        [transports]
    );

    // For Command and Transports menus we want to clear the
    // allTransportsSelected flag when we change page.
    useEffect(() => {
        unselectAllTransports();
    }, [unselectAllTransports, location.pathname]);

    const allTransportsCount = useSelector((state) => state.transportsCount);

    const allTransportsCountOrZero = allTransportsCount ?? 0;
    const selectedTransportsCount = useMemo(
        () => (allTransportsSelected ? allTransportsCountOrZero : currentSelection.length),
        [allTransportsSelected, allTransportsCountOrZero, currentSelection]
    );

    const selectedTransportsQuery = useMemo(() => {
        if (allTransportsSelected) {
            return getTransportsQueryParamsFromFiltersQuery(currentQuery, timezone, true);
        }
        return {uid__in: currentSelection};
    }, [allTransportsSelected, currentSelection, currentQuery, timezone]);

    return {
        onSelectTransport,
        onSelectAllVisibleTransports,
        selectedTransportsQuery,
        selectAllTransports,
        allTransportsCount,
        allTransportsCountOrZero,
        selectedTransportsCount,
        allTransportsSelected,
    };
}
