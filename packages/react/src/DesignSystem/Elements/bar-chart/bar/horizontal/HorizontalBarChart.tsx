import orderBy from "lodash.orderby";
import React, {FunctionComponent} from "react";

import {Full} from "./components/Full";
import {Thumbnail} from "./components/Thumbnail";
import {HorizontalChart} from "./types";

export type HorizontalBarChartProps = HorizontalChart & {
    /**
     * This property condition the thumbnail display.
     * The given number should be greater than 0 to be considered.
     * When this limit is enabled, we limit the number of bar according to the thumbnailLimit value.
     */
    thumbnailLimit?: number;
};
export const HorizontalBarChart: FunctionComponent<HorizontalBarChartProps> = (props) => {
    const {thumbnailLimit, results, ...others} = props;
    // order the results by the value in any cases
    const sortedResults = orderBy(results, "value", "desc");

    if (thumbnailLimit && thumbnailLimit > 0) {
        const filteredResults = sortedResults.filter(({checked}) => checked !== false);
        const limitedResults = filteredResults.slice(0, thumbnailLimit);
        return <Thumbnail {...others} results={limitedResults} count={filteredResults.length} />;
    } else {
        return <Full {...others} results={sortedResults} />;
    }
};
