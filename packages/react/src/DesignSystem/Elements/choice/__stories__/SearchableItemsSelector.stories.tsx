import {Meta, Story} from "@storybook/react/types-6-0";
import {SearchableStaticItemsSelector as SearchableStaticItemsSelectorComponent} from "choice/searchable-items-selector/SearchableStaticItemsSelector";
import {Box} from "layout";
import React, {useCallback, useMemo, useState} from "react";

import {SearchableItemsSelector as SearchableItemsSelectorComponent} from "../searchable-items-selector/SearchableItemsSelector";

type SearchableItemsSelectorStory = {
    enableSelectAll: boolean;
};

export default {
    title: "Web UI/choice/ItemsSelector",
    component: SearchableItemsSelectorComponent,
    args: {
        enableSelectAll: true,
    },
    parameters: {
        backgrounds: {default: "white"},
    },
    argTypes: {
        displayMode: {control: "select", options: ["checkbox", "addButton"]},
    },
} as Meta;

const Template: Story<SearchableItemsSelectorStory> = ({enableSelectAll}) => {
    const [state, setState] = useState<{items: Array<number>; selectedItems: string[]}>({
        items: Array.from({length: 5}, (_, i) => i),
        selectedItems: [],
    });

    const onChange = useCallback((newValue: string[]) => {
        setState((prev) => ({...prev, selectedItems: newValue}));
    }, []);

    const [searchText, setSearchText] = useState("");

    const filteredItems = useMemo(
        () => state.items.filter((item) => !searchText || getItemLabel(item).includes(searchText)),
        [searchText, state.items]
    );

    return (
        <>
            <SearchableItemsSelectorComponent<number>
                items={filteredItems}
                getItemId={(item) => `${item}`}
                getItemLabel={getItemLabel}
                values={state.selectedItems}
                onChange={onChange}
                searchText={searchText}
                onSearchTextChange={setSearchText}
                enableSelectAll={enableSelectAll}
            />
            <Box width="400px" mt={4}>
                Use <b>SearchableItemsSelector</b> to handle filtering list of items on your own
                according search text value
            </Box>
        </>
    );

    function getItemLabel(item: number) {
        return `My item ${item}`;
    }
};

export const SearchableItemsSelector = Template.bind({});

const TemplateStatic: Story<SearchableItemsSelectorStory> = ({enableSelectAll}) => {
    const [state, setState] = useState<{items: Array<number>; selectedItems: string[]}>({
        items: Array.from({length: 5}, (_, i) => i),
        selectedItems: [],
    });

    const onChange = useCallback((newValue: string[]) => {
        setState((prev) => ({...prev, selectedItems: newValue}));
    }, []);

    return (
        <>
            <SearchableStaticItemsSelectorComponent<number>
                items={state.items}
                getItemId={(item) => `${item}`}
                getItemLabel={getItemLabel}
                values={state.selectedItems}
                onChange={onChange}
                searchTextMatchItem={(item, searchText) => getItemLabel(item).includes(searchText)}
                enableSelectAll={enableSelectAll}
            />

            <Box width="400px" mt={4}>
                Use <b>SearchableStaticItemsSelector</b>, if you want to search among a static list
                of items
            </Box>
        </>
    );

    function getItemLabel(item: number) {
        return `My item ${item}`;
    }
};

export const SearchableStaticItemsSelector = TemplateStatic.bind({});
