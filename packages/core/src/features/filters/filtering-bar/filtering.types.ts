import {IconNames} from "@dashdoc/web-ui";
import {ReactNode} from "react";

export type FilterBadgeData = {
    count: number;
    badge: ReactNode;
    selectorDataType?: string; // data passed to selector to define initial state of selector when open it from badge
};
export type FilterData<TQuery> = {
    key: string;
    testId?: string;
    selector: {
        icon: IconNames;
        label: string;
        getFilterSelector: (
            query: TQuery,
            updateQuery: (query: Partial<TQuery>) => void,
            dataType?: string // data passed to define initial state of selector when open from badge
        ) => ReactNode;
        testId?: string;
    } | null;
    getBadges: (
        query: TQuery,
        updateQuery: (query: Partial<TQuery>) => void
    ) => Array<FilterBadgeData>;
};
