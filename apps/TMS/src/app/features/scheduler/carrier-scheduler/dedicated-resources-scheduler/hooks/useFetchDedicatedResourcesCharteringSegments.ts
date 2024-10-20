import {apiService} from "@dashdoc/web-common";
import {formatDate, usePrevious, useToggle} from "dashdoc-utils";
import chunk from "lodash.chunk";
import difference from "lodash.difference";
import flatten from "lodash.flatten";
import uniqBy from "lodash.uniqby";
import {useCallback, useEffect, useMemo, useState} from "react";

import {
    DedicatedResourceForCharteringScheduler,
    DedicatedResourcesCharteringSchedulerSegment,
} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";

type ResourceTypeFilter = "trucker__in" | "trailer__in" | "vehicle__in";

type RowIdsPerResourceTypeFilter = Record<ResourceTypeFilter, number[]>;

export function useFetchDedicatedResourcesCharteringSegments(
    startDate: Date,
    endDate: Date,
    dedicatedResources: DedicatedResourceForCharteringScheduler[]
) {
    const rowIds = useMemo(
        () =>
            dedicatedResources.reduce<RowIdsPerResourceTypeFilter>(
                (acc, resource) => {
                    switch (resource.resource_type) {
                        case "trucker":
                            acc.trucker__in.push(resource.pk);
                            break;
                        case "trailer":
                            acc.trailer__in.push(resource.pk);
                            break;
                        case "vehicle":
                            acc.vehicle__in.push(resource.pk);
                            break;
                    }
                    return acc;
                },
                {
                    trucker__in: [],
                    trailer__in: [],
                    vehicle__in: [],
                }
            ),

        [dedicatedResources]
    );

    const previousRowsIds = usePrevious(rowIds);
    const additionalRowIds = useMemo<RowIdsPerResourceTypeFilter>(() => {
        if (!previousRowsIds) {
            return rowIds;
        }

        return {
            trucker__in: difference(rowIds.trucker__in, previousRowsIds.trucker__in),
            trailer__in: difference(rowIds.trailer__in, previousRowsIds.trailer__in),
            vehicle__in: difference(rowIds.vehicle__in, previousRowsIds.vehicle__in),
        };
    }, [rowIds, previousRowsIds]);

    const [isLoadingCharteringSegments, loadingStart, loadingEnd] = useToggle(true);
    const [charteringSegments, setCharteringSegments] = useState<
        DedicatedResourcesCharteringSchedulerSegment[]
    >([]);

    const fetchSearchCharteringSegments = useCallback(
        async (rowsIdsQuery: RowIdsPerResourceTypeFilter) => {
            const start = formatDate(startDate, "yyyy-MM-dd");
            const end = formatDate(endDate, "yyyy-MM-dd");

            loadingStart();
            // recent browsers allow very long url length but in IE11, url length is
            //  limited to 2083 bytes. We may have to launch several requests.
            await Promise.all(
                Object.entries(rowsIdsQuery).flatMap(([key, values]) => {
                    return chunk(values, 50).map((uids_chunk) => {
                        return apiService.get(
                            `/dedicated-resources-scheduler/?date__gte=${start}&date__lte=${end}&view=chartering&${key}=${uids_chunk.join(
                                ","
                            )}`,
                            {
                                apiVersion: "web",
                                debouncedDelay: 500,
                            }
                        );
                    });
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
        if (
            Object.values(additionalRowIds).every((ids: number[]) => ids.length === 0) ||
            Object.entries(additionalRowIds).every(
                ([key, values]) => rowIds[key as ResourceTypeFilter].length === values.length
            )
        ) {
            rowsIdsQuery = rowIds;
            fetchSearchCharteringSegments(rowsIdsQuery); // should merge all data result unless we need to reset research
        }
        if (!rowsIdsQuery || Object.values(rowsIdsQuery).every((ids) => ids.length === 0)) {
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
