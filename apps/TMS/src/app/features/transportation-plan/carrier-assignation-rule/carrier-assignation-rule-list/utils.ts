import {Arrayify} from "@dashdoc/web-common";
import {parseQueryString} from "dashdoc-utils";

import {RulesScreenQuery} from "./types";

export const rulesParseQuery = (queryString: string): RulesScreenQuery => {
    const parsedParams = parseQueryString(queryString, {
        parseBooleans: true,
        parseNumbers: true,
        arrayFormat: "comma",
    });

    return {
        ...parsedParams,
        query: Arrayify(parsedParams.query || []).map((t) => t.toString()),
    };
};
