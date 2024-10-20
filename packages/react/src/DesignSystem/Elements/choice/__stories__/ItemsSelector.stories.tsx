import {Meta, Story} from "@storybook/react/types-6-0";
import {ItemSelectionDisplayMode} from "choice/items-selector/components/FlatItemList";
import _ from "lodash";
import React, {useCallback, useEffect, useState} from "react";

import {ItemsSelector} from "../items-selector/ItemsSelector";
import {Item, ItemGroup} from "../types";

const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
type ItemsSelectorStory = {
    nbItems: number;
    nbSelectedItems: number;
    nbGroups: number;
    displayMode: ItemSelectionDisplayMode;
};

export default {
    title: "Web UI/choice/ItemsSelector",
    component: ItemsSelector,
    args: {
        displayMode: "checkbox",
        nbGroups: 4,
        nbItems: 10,
        nbSelectedItems: 3,
    },
    parameters: {
        backgrounds: {default: "white"},
        layout: "fullscreen",
    },
    argTypes: {
        displayMode: {control: "select", options: ["checkbox", "addButton"]},
    },
} as Meta;

const Template: Story<ItemsSelectorStory> = ({nbItems, nbSelectedItems, displayMode}) => {
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

    return (
        <ItemsSelector
            items={state.items}
            values={state.selectedItems}
            onChange={onChange}
            displayMode={displayMode}
        />
    );
};

export const Default = Template.bind({});

const TemplateGroup: Story<ItemsSelectorStory> = ({
    nbItems,
    nbSelectedItems,
    nbGroups,
    displayMode,
}) => {
    const [state, setState] = useState<{items: ItemGroup[]; selectedItems: string[]}>({
        items: [],
        selectedItems: [],
    });

    const onChange = useCallback((newValue: string[]) => {
        setState((prev) => ({...prev, selectedItems: newValue}));
    }, []);

    useEffect(() => {
        const items: ItemGroup[] = Array.from({length: nbGroups}, (_, i) => ({
            id: i + "",
            label: `Group ${i} ${loremIpsum}`,
            items: Array.from({length: nbItems}, (_, j) => ({
                id: `${i}-${j}`,
                label: `Item ${i}-${j} ${loremIpsum}`,
            })),
        }));
        const selectedItems = _.sampleSize(items, nbSelectedItems).map((item) => item.id);
        setState({items, selectedItems});
    }, [nbGroups, nbItems, nbSelectedItems]);

    return (
        <ItemsSelector
            items={state.items}
            values={state.selectedItems}
            onChange={onChange}
            displayMode={displayMode}
        />
    );
};

export const Group = TemplateGroup.bind({});
