import {Box, NoWrap, Text} from "@dashdoc/web-ui";
import React from "react";

import {ItemGroup} from "../../types";

import {FlatItemList, ItemSelectionDisplayMode} from "./FlatItemList";

type Props = {
    items: ItemGroup[];
    values: string[];
    onClick: (id: string) => void;
    displayMode: ItemSelectionDisplayMode;
};
export function GroupedItemList({items, values, onClick, displayMode}: Props) {
    return (
        <>
            {items.map(({id, label, items}) => (
                <Box
                    key={id}
                    style={{
                        display: "grid",
                        gridTemplateColumns: `1fr`,
                    }}
                    mb={4}
                >
                    <Text
                        fontWeight={600}
                        flexGrow={1}
                        style={{cursor: "pointer"}}
                        onClick={() => onClick(id)}
                        mb={2}
                    >
                        <NoWrap>{label}</NoWrap>
                    </Text>
                    <Box px={2}>
                        <FlatItemList
                            items={items}
                            values={values}
                            onClick={onClick}
                            displayMode={displayMode}
                        />
                    </Box>
                </Box>
            ))}
        </>
    );
}
