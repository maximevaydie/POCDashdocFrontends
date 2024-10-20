import {Text} from "@dashdoc/web-ui";
import React from "react";
import Highlighter from "react-highlight-words";

import type {EntityItem} from "app/features/core/entity-list/types";

type Props = {
    item: EntityItem;
    columnName: string;
    currentQuery: any;
};

export function DefaultCell({item, columnName, currentQuery}: Props) {
    const searchedTexts: string[] = currentQuery.query ?? [];
    let label = "";
    if (columnName in item) {
        label = (item as any)[columnName]?.toString();
    }
    return (
        <Text variant="caption" lineHeight={0} ellipsis>
            <Highlighter autoEscape={true} searchWords={searchedTexts} textToHighlight={label} />
        </Text>
    );
}
