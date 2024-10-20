import {TableProps} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {List} from "./components/list";
import {useDataFetching} from "./hooks/useDataFetch";
import useDataStore from "./hooks/useDataStore";
import {
    DataBehavior,
    DataFetchBehavior,
    DataStoreBehavior,
    EntityItem,
    TableBehavior,
} from "./types";

type EntityListProps = {
    currentQuery: any;
    dataBehavior: DataBehavior;
    tableBehavior: TableBehavior;
    onClick: (item: EntityItem) => unknown;
    onDelete?: (items: EntityItem[]) => unknown;
    ["data-testid"]: string;
};
export const EntityList: FunctionComponent<EntityListProps & Partial<TableProps>> = (props) => {
    const {dataBehavior, ...others} = props;
    if ("model" in dataBehavior) {
        return (
            <EntityListFromStore
                dataStoreBehavior={dataBehavior as DataStoreBehavior}
                {...others}
            />
        );
    } else {
        return (
            <EntityListFromFetch
                dataFetchBehavior={dataBehavior as DataFetchBehavior}
                {...others}
            />
        );
    }
};

type EntityListFromFetchProps = {
    dataFetchBehavior: DataFetchBehavior;
    currentQuery: any;
    tableBehavior: TableBehavior;
    onClick: (item: EntityItem) => unknown;
    onDelete?: (items: EntityItem[]) => unknown;
    ["data-testid"]: string;
};
const EntityListFromFetch: FunctionComponent<EntityListFromFetchProps & Partial<TableProps>> = ({
    dataFetchBehavior,
    ...others
}) => {
    const dataProps = useDataFetching(dataFetchBehavior);
    return <List {...dataProps} {...others} />;
};

type EntityListFromStoreProps = {
    dataStoreBehavior: DataStoreBehavior;
    currentQuery: any;
    tableBehavior: TableBehavior;
    onClick: (item: EntityItem) => unknown;
    onDelete?: (items: EntityItem[]) => unknown;
    ["data-testid"]: string;
};
const EntityListFromStore: FunctionComponent<EntityListFromStoreProps & Partial<TableProps>> = ({
    dataStoreBehavior,
    currentQuery,
    ...others
}) => {
    const dataStoreProps = useDataStore(dataStoreBehavior, currentQuery);
    return <List {...dataStoreProps} currentQuery={currentQuery} {...others} />;
};
