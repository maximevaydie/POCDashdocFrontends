import {apiService} from "@dashdoc/web-common";
import {formatDate, usePrevious, useToggle} from "dashdoc-utils";
import chunk from "lodash.chunk";
import difference from "lodash.difference";
import flatten from "lodash.flatten";
import uniqBy from "lodash.uniqby";
import {useCallback, useEffect, useMemo, useState} from "react";

import {
    RawCarrierCharteringSchedulerSegment,
    RowCompany,
} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";

export function useFetchCharteringSegments(startDate: Date, endDate: Date, rows: RowCompany[]) {
    const rowIds = useMemo(() => (rows ? rows.map((row) => row.pk) : []), [rows]);
    const previousRowsIds = usePrevious(rowIds);
    const additionalRowIds: number[] = useMemo(
        () => (previousRowsIds ? difference(rowIds, previousRowsIds) : rowIds),
        [rowIds, previousRowsIds]
    );

    const [isLoadingCharteringSegments, loadingStart, loadingEnd] = useToggle(true);
    const [charteringSegments, setCharteringSegments] = useState<
        RawCarrierCharteringSchedulerSegment[]
    >([]);

    const fetchSearchCharteringSegments = useCallback(
        async (rowsIdsQuery: number[]) => {
            const start = formatDate(startDate, "yyyy-MM-dd");
            const end = formatDate(endDate, "yyyy-MM-dd");
            loadingStart();
            // recent browsers allow very long url length but in IE11, url length is
            //  limited to 2083 bytes. We may have to launch several requests.
            await Promise.all(
                chunk(rowsIdsQuery, 50).map((uids_chunk) => {
                    return apiService.get(
                        `/chartering-scheduler/?date__gte=${start}&date__lte=${end}&view=chartering&carrier_id__in=${uids_chunk.join(
                            ","
                        )}`,
                        {
                            apiVersion: "v4",
                            debouncedDelay: 500,
                        }
                    );
                })
            ).then((results) => {
                const segments = flatten(results);
                // quick fix : we need to check the unicity by uid because the backend send twice the same segments sometimes
                setCharteringSegments(uniqBy(segments, (s) => s.uid));
                loadingEnd();
            });
        },
        [endDate, loadingEnd, loadingStart, startDate, setCharteringSegments]
    );

    const fetchCharteringSegmentsByUIDs = useCallback(
        async (uids: string[]) => {
            loadingStart();
            const results = await apiService.get(
                `/chartering-scheduler/?view=chartering&uid__in=${uids}`,
                {
                    apiVersion: "v4",
                }
            );
            setCharteringSegments((prev) => [
                ...prev.filter((s) => !uids || !uids.includes(s.uid)),
                ...results,
            ]);
            loadingEnd();
        },
        [setCharteringSegments, loadingEnd, loadingStart]
    );

    const fetchCharteringSegmentsInTimeSpan = useCallback(async () => {
        let rowsIdsQuery = additionalRowIds;
        if (additionalRowIds.length === 0 || additionalRowIds.length === rowIds.length) {
            rowsIdsQuery = rowIds;
            fetchSearchCharteringSegments(rowsIdsQuery); // should merge all data result unless we need to reset research
        }
        if (rowsIdsQuery?.length === 0) {
            return;
        }
        fetchSearchCharteringSegments(rowsIdsQuery);

        // - remove additionalRowIds to avoid double call
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowIds, fetchSearchCharteringSegments]);

    /**
     * useEffect
     **/

    useEffect(() => {
        fetchCharteringSegmentsInTimeSpan();
    }, [fetchCharteringSegmentsInTimeSpan]);

    return {
        charteringSegments,
        isLoadingCharteringSegments,
        fetchCharteringSegmentsByUIDs,
    };
}
