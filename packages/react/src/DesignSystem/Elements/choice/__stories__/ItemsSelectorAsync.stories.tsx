import {Meta, Story} from "@storybook/react/types-6-0";
import _ from "lodash";
import React, {useCallback, useEffect, useState} from "react";

import {ItemsSelector} from "../items-selector/ItemsSelector";
import {Item} from "../types";

const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
type ItemsSelectorStory = {
    nbItems: number;
    nbSelectedItems: number;
    nbGroups: number;
};

export default {
    title: "Web UI/choice/ItemsSelector",
    component: ItemsSelector,
    args: {
        nbGroups: 4,
        nbItems: 10,
        nbSelectedItems: 3,
    },
    parameters: {
        backgrounds: {default: "white"},
        layout: "fullscreen",
    },
} as Meta;

const Template: Story<ItemsSelectorStory> = ({nbItems, nbSelectedItems}) => {
    const [state, setState] = useState<{items: Item[]; selectedItems: string[]}>({
        items: [],
        selectedItems: [],
    });

    const onChange = useCallback((newValue: string[]) => {
        setState((prev) => ({...prev, selectedItems: newValue}));
    }, []);

    useEffect(() => {
        const items: Item[] = Array.from({length: nbItems}, (_, i) => ({
            id: i + "",
            label: `Item ${i} ${loremIpsum}`,
        }));
        const selectedItems = _.sampleSize(items, nbSelectedItems).map((item) => item.id);
        setState({items, selectedItems});
    }, [nbItems, nbSelectedItems]);

    return <ItemsSelector items={state.items} values={state.selectedItems} onChange={onChange} />;
};

export const Async = Template.bind({});
