import {fetchSearch} from "@dashdoc/web-common";

import {exportSchema} from "../schemas";

export function fetchSearchExports(queryName: string, query: any, page: number) {
    return fetchSearch("exports", "export", exportSchema, queryName, query, page, "v4");
}
