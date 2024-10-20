import {t} from "@dashdoc/web-core";
import {Box, Flex, ItemsSelector, Link, Text, TextInput} from "@dashdoc/web-ui";
import {ItemGroup} from "@dashdoc/web-ui/src/choice/types";
import uniq from "lodash.uniq";
import React, {useMemo, useState} from "react";

import {ColumnsSpec} from "../../types";

import {itemService} from "./item.service";

type Props = {
    columnsSpec: ColumnsSpec;
    columns: string[];
    onChange: (columns: string[]) => void;
};
export function AvailableColumnsField({columnsSpec, columns, onChange}: Props) {
    const [searchText, setSearchText] = useState("");
    const itemGroups: ItemGroup[] = useMemo(
        () => itemService.getItemGroups(columnsSpec, searchText),
        [columnsSpec, searchText]
    );
    const allVisibleColumns = itemGroups.flatMap((group) => group.items).map((item) => item.id);

    const totalOptions = itemGroups.reduce((acc, group) => acc + group.items.length, 0);
    let addAllLabel: string;
    let behavior: "add" | "remove" = "add";
    if (searchText.length <= 0) {
        if (allVisibleColumns.length === columns.length) {
            behavior = "remove";
            addAllLabel = t("common.removeAll");
        } else {
            addAllLabel = t("common.addAll");
        }
    } else {
        if (allVisibleColumns.some((column) => !columns.includes(column))) {
            addAllLabel = t("common.addTheXResults", {
                smart_count: totalOptions,
            });
        } else {
            behavior = "remove";
            addAllLabel = t("common.removeTheXResults", {
                smart_count: totalOptions,
            });
        }
    }

    const memoizedItemSelector = useMemo(() => {
        return (
            <ItemsSelector
                items={itemGroups}
                values={columns}
                onChange={onChange}
                displayMode="addButton"
            />
        );
    }, [itemGroups, columns, onChange]);
    return (
        <>
            <TextInput
                leftIcon="search"
                leftIconColor="grey.dark"
                value={searchText}
                onChange={setSearchText}
                lineHeight={2}
                placeholder={t("common.searchColumns")}
                backgroundColor="grey.ultralight"
                autoFocus
                mt={1}
            />
            <Box my={4}>
                {totalOptions > 1 && (
                    <Link onClick={behavior === "add" ? handleAddAll : handleRemoveAll}>
                        {addAllLabel}
                    </Link>
                )}
            </Box>
            <Flex flexDirection="column" flexGrow={1} style={{overflowY: "auto"}}>
                {itemGroups.length === 0 && (
                    <Text variant="h1" color="grey.default" ml={2}>
                        {t("common.noResultFound")}
                    </Text>
                )}
                {memoizedItemSelector}
            </Flex>
        </>
    );
    function handleAddAll() {
        const allItems = itemService
            .getFlatItems(columnsSpec)
            .filter((item) =>
                (item.label as string).toLowerCase().includes(searchText.toLowerCase())
            );
        const newColumns = allItems.map((item) => item.id);
        onChange(uniq([...columns, ...newColumns]));
    }

    function handleRemoveAll() {
        const newColumns = columns.filter((column) => !allVisibleColumns.includes(column));
        onChange(newColumns);
    }
}
