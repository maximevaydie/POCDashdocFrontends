import {ReorderableList} from "@dashdoc/web-ui";
import {Item} from "@dashdoc/web-ui/src/choice/types";
import React, {useMemo} from "react";

import {ColumnsSpec} from "../../types";

import {itemService} from "./item.service";

type Props = {
    columnsSpec: ColumnsSpec;
    columns: string[];
    onChange: (columns: string[]) => void;
};
export function SelectedColumnsField({columnsSpec, columns, onChange}: Props) {
    const selectedItems: Item[] = useMemo(
        () => itemService.retrieveItems(columnsSpec, columns),
        [columnsSpec, columns]
    );

    const memoized = useMemo(() => {
        return (
            <ReorderableList
                items={selectedItems}
                onChange={(newReorderableItems) => {
                    const columns = newReorderableItems.map((item) => item.id);
                    onChange(columns);
                }}
            />
        );
    }, [selectedItems, onChange]);

    return memoized;
}
