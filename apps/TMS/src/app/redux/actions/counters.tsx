import {fetchListAction} from "@dashdoc/web-common";

export function fetchCounters() {
    return fetchListAction("counters", "counters", null, "GET", null, null);
}
