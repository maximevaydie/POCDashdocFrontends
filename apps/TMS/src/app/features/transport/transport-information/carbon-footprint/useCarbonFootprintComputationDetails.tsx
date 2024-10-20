import {apiService} from "@dashdoc/web-common";
import {TransportCarbonFootprintResponse} from "dashdoc-utils/dist/api/scopes/transports";
import {useCallback, useEffect, useState} from "react";

import {fetchRefreshCarbonFootprint} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import type {Transport} from "app/types/transport";

type ReturnValue = {
    computation: TransportCarbonFootprintResponse | null;
    refresh: (params?: {
        distance?: number | null;
        transportOperationCategory?: Transport["transport_operation_category"];
    }) => Promise<void>;
};

export function useCarbonFootprintComputationDetails(transport: Transport): ReturnValue {
    const dispatch = useDispatch();

    const [computation, setComputation] = useState<TransportCarbonFootprintResponse | null>(null);

    const refresh = useCallback(
        async (
            options: {
                distance?: number | null;
                transportOperationCategory?: Transport["transport_operation_category"];
            } = {}
        ) => {
            const computation = await dispatch(
                fetchRefreshCarbonFootprint(transport.uid, options)
            );
            setComputation(computation);
        },
        [dispatch, transport.uid]
    );

    useEffect(() => {
        async function fetchComputation() {
            try {
                setComputation(await apiService.Transports.getCarbonFootprint(transport.uid));
            } catch (e) {
                if (e.status === 404) {
                    refresh();
                }
            }
        }

        fetchComputation();
    }, [refresh, transport.uid]);

    return {computation, refresh};
}
