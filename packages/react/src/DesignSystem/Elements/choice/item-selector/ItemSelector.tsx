import {ClickableFlex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

import {Item} from "../types";

export type ItemSelectorProps = {
    items: Item[];
    value: string | undefined; // id of selected item
    onChange: (newValue: string) => void; // update selected item
    "data-testid"?: string;
};

export function ItemSelector({
    items,
    value,
    onChange,
    "data-testid": dataTestId,
}: ItemSelectorProps) {
    return (
        <>
            {items.map(({id, label}) => {
                const isSelected = id === value;
                return (
                    <ClickableFlex
                        key={id}
                        flexGrow={1}
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange(id);
                        }}
                        py={1}
                        px={2}
                        data-testid={`${dataTestId}-${id}`}
                    >
                        <Icon
                            name="check"
                            mr={2}
                            color="blue.default"
                            opacity={isSelected ? 1 : 0}
                        />
                        <Text>{label}</Text>
                    </ClickableFlex>
                );
            })}
        </>
    );
}
