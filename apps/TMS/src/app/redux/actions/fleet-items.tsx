import {fetchSearch} from "@dashdoc/web-common";
import {UnifiedFleetQuery} from "dashdoc-utils";

import {fleetItemSchema} from "../schemas";

export function fetchSearchFleetItems(
    queryName: string,
    query: UnifiedFleetQuery,
    page:
        | number
        | {
              fromPage: number;
              toPage: number;
          }
) {
    return fetchSearch("unified-fleet", "fleet-items", fleetItemSchema, queryName, query, page);
}
