import {t} from "@dashdoc/web-core";
import {action} from "@storybook/addon-actions";
import {Meta, Story} from "@storybook/react/types-6-0";
import {Trucker, useToggle} from "dashdoc-utils";
import sortBy from "lodash.sortby";
import React, {useEffect, useState} from "react";

import {Button} from "../../button";
import {Box} from "../../layout/Box";
import {Flex} from "../../layout/Flex";
import {Icon} from "../icon";
import {Text} from "../Text";

import {Table as TableComponent, TableProps} from "./Table";

export default {
    title: "Web UI/base/Table",
    component: TableComponent,
} as Meta;

const Template: Story<TableProps> = (args) => (
    <TableComponent width="80vw" height="200px" {...args} />
);

const columns = Array.from({length: 5}, (_, i) => ({
    id: i.toString(),
    key: i.toString(),
    name: `column_${i}`,
    label: `Column ${i}`,
}));

const rows = Array.from({length: 10}, (_, i) => ({
    id: i,
    key: i.toString(),
    ...columns.reduce(
        (acc, c) => {
            acc[c.name] = `Row ${i}, Column ${c.id}`;
            return acc;
        },
        {} as Record<string, string>
    ),
}));

export const Table = Template.bind({});
Table.storyName = "Table with pre-formatted data";
Table.args = {columns, rows};

export const TableWithNoData = Template.bind({});
TableWithNoData.storyName = "Table with no data";
TableWithNoData.args = {columns, rows: []};

const truckersTableColumns = [
    "dashdoc_id",
    "name",
    "remote_id",
    "invite_code",
    "last_login",
    "last_app_version",
    "edit",
] as const;

const truckers: Partial<Trucker>[] = [
    {
        pk: 11,
        display_name: "Alexandre Rousseau",
        user: {
            pk: 4,
            first_name: "Alexandre",
            last_name: "Rousseau",
            username: "",
            display_name: "",
            email: "alexandre@dashdoc.eu",
            last_login: "09/09/19 08:56",
            date_joined: null,
        },
        invite_code: "TFUDHH",
        phone_number: "0602030405",
        remote_id: "911",
    },
    {
        pk: 45,
        display_name: "Noémi Regnier",
        user: {
            pk: 5,
            first_name: "Noémi",
            last_name: "Regnier",
            username: "",
            display_name: "",
            email: "",
            last_login: "09/07/19 13:48",
            date_joined: null,
        },
        invite_code: "TDFQWM",
        phone_number: "",
        remote_id: "",
    },
    {
        pk: 73,
        display_name: "Tristan Seguin",
        user: {
            pk: 3,
            first_name: "Tristan",
            last_name: "Seguin",
            username: "",
            display_name: "",
            email: "",
            last_login: "08/12/20 01:11",
            date_joined: null,
        },
        invite_code: "TMDWVM",
        phone_number: "",
        remote_id: "777",
    },
    {
        pk: 117,
        display_name: "Hubert Bonisseur de La Bath",
        user: {
            pk: 1,
            first_name: "Hubert",
            last_name: "Bonisseur de La Bath",
            username: "",
            display_name: "",
            email: "hubert@oss.fr",
            last_login: "01/12/20 06:52",
            date_joined: null,
        },
        invite_code: "TABLE",
        phone_number: "0605040302",
        remote_id: "",
    },
    {
        pk: 283,
        display_name: "Victoire Thierry",
        user: {
            pk: 2,
            first_name: "Victoire",
            last_name: "Thierry",
            username: "",
            display_name: "",
            email: "",
            last_login: "08/10/19 11:38",
            date_joined: null,
        },
        invite_code: "TTVXUY",
        phone_number: "",
        remote_id: "",
    },
];

export const TableWithCustomData = Template.bind({});
TableWithCustomData.storyName = "Table with custom data";
const TableWithCustomDataArgs: TableProps<{id: string}, Partial<Trucker>> = {
    height: 400,
    columns: truckersTableColumns.map((id) => ({id})),
    rows: truckers,
    // @ts-ignore
    getRowId: (row) => row.pk.toString(),
    getColumnName: (column) => column.id,
    getColumnLabel: (column) => {
        switch (column.id) {
            case "dashdoc_id":
                return t("settings.dashdocIdentifier");
            case "name":
                return t("common.driver");
            case "remote_id":
                return t("components.remoteId");
            case "invite_code":
                return t("settings.inviteCode");
            case "last_login":
                return t("truckersList.lastLogin");
            case "last_app_version":
                return t("dashboard.lastAppVersion");
            case "edit":
                return t("common.edit");
            default:
                return "";
        }
    },
    // @ts-ignore
    getRowKey: (row) => row.pk.toString(),
    getRowCellContent: (trucker, columnName) => {
        switch (columnName) {
            case "dashdoc_id":
                return <Text variant="caption">{trucker.pk}</Text>;
            case "name":
                return (
                    <Box>
                        <Flex>
                            <Icon color="grey.dark" name="user" mr={2} />
                            <Text fontWeight="bold">{trucker.display_name}</Text>
                        </Flex>
                        {/*
// @ts-ignore */}
                        {trucker.user.email && (
                            <Flex mt={1}>
                                <Icon color="grey.dark" name="send" mr={2} />{" "}
                                {/*
// @ts-ignore */}
                                <Text>{trucker.user.email}</Text>
                            </Flex>
                        )}
                        {trucker.phone_number && (
                            <Flex mt={1}>
                                <Icon color="grey.dark" name="phone" mr={2} />{" "}
                                <Text>{trucker.phone_number}</Text>
                            </Flex>
                        )}
                    </Box>
                );
            case "remote_id":
                return <Text>{trucker.remote_id}</Text>;
            case "invite_code":
                return (
                    <Box>
                        {trucker.invite_code ? (
                            <Flex flexWrap="wrap">
                                <Box mr={2} alignSelf="center">
                                    <Text variant="caption" fontWeight="bold">
                                        {trucker.invite_code}
                                    </Text>
                                </Box>
                                {trucker.phone_number && (
                                    <Button variant="secondary">
                                        {t("truckersList.sendBySMS")}
                                    </Button>
                                )}
                            </Flex>
                        ) : (
                            <Flex>
                                <Button>{t("truckersList.generateInviteCode")}</Button>
                            </Flex>
                        )}
                    </Box>
                );
            case "last_login":
                // @ts-ignore
                return <Text>{trucker.user.last_login}</Text>;
            case "last_app_version":
                return <Text>{t("common.yes")}</Text>;
            case "edit":
                return (
                    <Flex flexWrap="wrap">
                        <Button variant="secondary" mr={2}>
                            {t("common.edit")}
                        </Button>
                        <Button variant="secondary" severity="danger">
                            {t("common.delete")}
                        </Button>
                    </Flex>
                );
            default:
                return "";
        }
    },
};
TableWithCustomData.args = TableWithCustomDataArgs;

export const TableWithSelectableRows: Story<TableProps> = (args) => {
    const [selectedRows, setSelectedRows] = useState<TableProps["selectedRows"]>({});
    const [allRowsSelected, setAllRowsSelect, unsetAllRowsSelect] = useToggle();

    return (
        <Template
            {...args}
            selectedRows={selectedRows}
            onSelectRow={({id}, selected) => {
                unsetAllRowsSelect();
                // @ts-ignore
                setSelectedRows({...selectedRows, [id]: selected});
            }}
            onSelectAllVisibleRows={(selected) => {
                unsetAllRowsSelect();
                setSelectedRows(
                    rows.reduce(
                        (acc, {id}) => {
                            // @ts-ignore
                            acc[id] = selected;
                            return acc;
                        },
                        {} as TableProps["selectedRows"]
                    )
                );
            }}
            allRowsSelected={allRowsSelected}
            onSelectAllRows={setAllRowsSelect}
            onClickOnRow={(row) => action(`click: Row ${row.id}`)()}
        />
    );
};
TableWithSelectableRows.args = {
    columns,
    rows,
    withSelectableRows: true,
    hasNextPage: true,
    allVisibleRowsSelectedMessage: t("components.selectedTruckersCount", {
        smart_count: rows.length,
    }),
    selectAllRowsMessage: t("components.selectAllTruckersCount", {
        smart_count: rows.length * 2,
    }),
    allRowsSelectedMessage: t("components.allTruckersSelectedCount", {
        smart_count: rows.length * 2,
    }),
};
TableWithSelectableRows.storyName = "Table with selectable rows";

export const TableWithSelectableColumns: Story<TableProps> = (args) => {
    const [selectedColumnNames, setSelectedColumns] = useState<TableProps["selectedColumnNames"]>(
        columns.map((c) => c.name)
    );

    return (
        <Template
            {...args}
            selectedColumnNames={selectedColumnNames}
            onSelectColumns={setSelectedColumns}
        />
    );
};
TableWithSelectableColumns.args = {
    rows,
    columns,
    withSelectableColumns: true,
};
TableWithSelectableColumns.storyName = "Table with selectable columns";

export const TableWithOnEndReachHandler: Story<TableProps> = (args) => (
    <Template {...args} onEndReached={() => action(`end reached`)()} />
);
TableWithOnEndReachHandler.storyName = "Table with on end reached handler";
TableWithOnEndReachHandler.args = {columns, rows};

export const TableWithCustomOrdering: Story<TableProps> = (args) => {
    const [sortedRows, setSortedRows] = useState(args.rows);

    const sortableColumns = columns.reduce(
        (acc, c, i) => {
            // keep first column unsortable for the example
            // @ts-ignore
            acc[c.name] = i > 0;
            return acc;
        },
        {} as TableProps["sortableColumns"]
    );

    const [ordering, setOrdering] = useState<TableProps["ordering"]>({});

    useEffect(() => {
        // @ts-ignore
        if (Object.keys(ordering).length) {
            // @ts-ignore
            const [columnName, direction] = Object.entries(ordering)[0];
            const rowsSortedByColumnName = sortBy(sortedRows, columnName);
            setSortedRows(
                direction === "desc" ? rowsSortedByColumnName.reverse() : rowsSortedByColumnName
            );
        }
    }, [ordering]);

    return (
        <Template
            {...args}
            rows={sortedRows}
            sortableColumns={sortableColumns}
            ordering={ordering}
            onOrderingChange={setOrdering}
        />
    );
};
TableWithCustomOrdering.args = {
    rows,
    columns,
};
TableWithCustomOrdering.storyName = "Table with custom ordering";

export const TableAllInclusive: Story<TableProps> = (args) => {
    const {rows, columns} = args;

    const sortableColumns = {dashdoc_id: true, remote_id: true};

    const [ordering, setOrdering] = useState<TableProps["ordering"] | null>(null);

    const [sortedRows, setSortedRows] = useState(rows);

    useEffect(() => {
        // @ts-ignore
        if (Object.keys(ordering).length) {
            // @ts-ignore
            const [columnName, direction] = Object.entries(ordering)[0];
            const rowsSortedByColumnName = sortBy(
                sortedRows,
                columnName === "dashdoc_id" ? "pk" : columnName
            );
            setSortedRows(
                direction === "desc" ? rowsSortedByColumnName.reverse() : rowsSortedByColumnName
            );
        }
    }, [ordering]);

    const [selectedColumnNames, setSelectedColumns] = useState<TableProps["selectedColumnNames"]>(
        columns.map((c) => c.id as string)
    );

    const [selectedRows, setSelectedRows] = useState<TableProps["selectedRows"]>({});
    const [allRowsSelected, setAllRowsSelect, unsetAllRowsSelect] = useToggle();

    return (
        <Template
            {...args}
            rows={sortedRows}
            sortableColumns={sortableColumns}
            ordering={ordering}
            onOrderingChange={setOrdering}
            selectedColumnNames={selectedColumnNames}
            onSelectColumns={setSelectedColumns}
            selectedRows={selectedRows}
            onSelectRow={({pk}, selected) => {
                unsetAllRowsSelect();
                setSelectedRows({...selectedRows, [pk]: selected});
            }}
            onSelectAllVisibleRows={(selected) => {
                unsetAllRowsSelect();
                setSelectedRows(
                    rows.reduce(
                        (acc, {pk}) => {
                            // @ts-ignore
                            acc[pk] = selected;
                            return acc;
                        },
                        {} as TableProps["selectedRows"]
                    )
                );
            }}
            allRowsSelected={allRowsSelected}
            onSelectAllRows={setAllRowsSelect}
            onClickOnRow={(row) => action(`click: Row ${row.pk}`)()}
            onEndReached={() => action(`end reached`)()}
        />
    );
};
TableAllInclusive.storyName = "Table all inclusive";
TableAllInclusive.args = {
    ...TableWithCustomDataArgs,
    withSelectableColumns: true,
    withSelectableRows: true,
    hasNextPage: true,
    allVisibleRowsSelectedMessage: t("components.selectedTruckersCount", {
        smart_count: rows.length,
    }),
    selectAllRowsMessage: t("components.selectAllTruckersCount", {
        smart_count: rows.length * 2,
    }),
    allRowsSelectedMessage: t("components.allTruckersSelectedCount", {
        smart_count: rows.length * 2,
    }),
};
