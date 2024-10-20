import {BaseColumnProps, SortCriteriaOption} from "@dashdoc/web-ui";
import {BaseRowProps} from "@dashdoc/web-ui";
import {ReactNode} from "react";

import {RootState} from "app/redux/reducers/index";

export type EntityItem =
    | {
          pk?: number;
      }
    | {
          id?: number;
      };

export interface DataStoreBehavior {
    model: "companies" | "partnersList";
    modelSelector: (state: RootState) => any;
    selectionSelector: (state: RootState) => string[];
    loadingSelector: (state: RootState) => boolean;
    fetchAction: (
        query: any,
        timezone: string,
        page: number
    ) => (dispatch: Function) => Promise<unknown>;
}

export interface DataFetchBehavior {
    path: string;
    params: Record<string, any>;
}

export type DataBehavior = DataStoreBehavior | DataFetchBehavior;

export interface TableBehavior {
    getColumns: () => BaseColumnProps[];
    getSortableColumns?: () => Record<string, SortCriteriaOption<string>[]>;
    getI18n: (
        loadedItemsCount: number,
        totalCount: number
    ) => {
        allVisibleRowsSelectedMessage: string;
        selectAllRowsMessage: string;
        allRowsSelectedMessage: string;
        getDeleteConfirmationMessage?: (itemNumber: number) => string;
    };
    getRowCellContent?: (
        row: BaseRowProps,
        columnName: string,
        currentQuery: any
    ) => ReactNode | ReactNode[];
}
