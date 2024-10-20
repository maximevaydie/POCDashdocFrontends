import {Meta, Story} from "@storybook/react/types-6-0";
import {Box, Flex} from "layout";
import _ from "lodash";
import React, {useCallback, useEffect, useState} from "react";

import {ItemsSelector} from "../items-selector/ItemsSelector";
import {Item} from "../types";

const loremIpsum = `Lorem ipsum dolor sit amet`;

export default {
    title: "Web UI/choice/ItemsSelector/DisplayModes",
    component: ItemsSelector,
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const TemplateDisplayModes: Story = () => {
    const nbItems = 5;
    const nbSelectedItems = 3;
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
        <Flex>
            <Box mr={5}>
                <b>Display Mode : checkbox (default)</b>
                <ItemsSelector
                    items={state.items}
                    values={state.selectedItems}
                    onChange={onChange}
                />
            </Box>
            <Box>
                <b>Display Mode : addButton</b>
                <ItemsSelector
                    items={state.items}
                    values={state.selectedItems}
                    onChange={onChange}
                    displayMode="addButton"
                />
            </Box>
        </Flex>
    );
};

export const DisplayModes = TemplateDisplayModes.bind({});
