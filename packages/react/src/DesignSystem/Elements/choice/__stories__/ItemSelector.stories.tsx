import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useCallback, useEffect, useState} from "react";

import {ItemSelector as ItemSelectorComponent} from "../item-selector/ItemSelector";
import {Item} from "../types";

type ItemSelectorStory = {
    nbItems: number;
};

export default {
    title: "Web UI/choice",
    component: ItemSelectorComponent,
    args: {
        nbItems: 5,
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const Template: Story<ItemSelectorStory> = ({nbItems}) => {
    const [state, setState] = useState<{items: Item[]; selectedItem: string | undefined}>({
        items: [],
        selectedItem: undefined,
    });

    const onChange = useCallback((newValue: string) => {
        setState((prev) => ({...prev, selectedItem: newValue}));
    }, []);

    useEffect(() => {
        const items: Item[] = Array.from({length: nbItems}, (_, i) => ({
            id: i + "",
            label: `Item ${i} `,
        }));
        setState({items, selectedItem: "2"});
    }, [nbItems]);

    return (
        <ItemSelectorComponent
            items={state.items}
            value={state.selectedItem}
            onChange={onChange}
        />
    );
};

export const ItemSelector = Template.bind({});
