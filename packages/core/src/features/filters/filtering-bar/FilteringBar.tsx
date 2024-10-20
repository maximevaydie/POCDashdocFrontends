import {t} from "@dashdoc/web-core";
import {ClickableFlex, Flex, Icon, TooltipWrapper} from "@dashdoc/web-ui";
import React, {FunctionComponent, useCallback, useState} from "react";

import {BadgesSection} from "./components/BadgesSection";
import {FiltersSection} from "./components/FiltersSection";
import {SaveViewButton} from "./components/SaveViewButton";
import {SearchInputBar} from "./components/SearchSection";
import {ViewSelection} from "./components/ViewSelection";

import type {FilterData} from "./filtering.types";
import type {GenericSettingsView} from "./genericSettingsViews.types";
import type {SearchQuery} from "../badges-and-selectors";

export type FilteringBarProps<TQuery = Record<string, any> & SearchQuery> = {
    filters: Array<FilterData<TQuery>>; // define selectors and badges of your filtering bar
    // you can use helpers from frontends/web/common/src/features/filters/badges-and-selectors/generic to create new filters
    // or reuse existing ones

    query: TQuery;
    updateQuery: (query: Partial<TQuery>) => void;
    resetQuery?: TQuery;
    parseQuery?: (query: TQuery) => TQuery; // used to parse query to be aligned with backend schema when save a new view

    // Specify viewsParam to handle filter saving into a view
    // Don't forget to check if parseQuery and backend settings schema are aligned. It is required to have the view properly saved
    viewsParams?: {
        selectedViewPk: number | undefined;
        setSelectedViewPk: (viewPk: number | undefined) => void;
        viewCategory: string; // the category should be an option of SettingsViewCategory account model in backend
        addEnabled: boolean;
        deleteEnabled: boolean;
    };

    size?: "small" | "medium" | "large";
    searchEnabled?: boolean; // search is based on "text" query key
    searchPlaceholder?: string;
    "data-testid": string; // enforced here so we don't mess with PW tests
};

export function FilteringBar<TQuery extends Record<string, any> & SearchQuery>({
    filters,
    query: unformattedQuery,
    updateQuery,
    resetQuery,
    parseQuery,
    viewsParams,
    size = "medium",
    searchEnabled = false,
    searchPlaceholder,
    "data-testid": dataTestId,
}: FilteringBarProps<TQuery>): ReturnType<FunctionComponent<FilteringBarProps<TQuery>>> {
    const query = parseQuery ? parseQuery(unformattedQuery) : unformattedQuery;
    const [searchingByText, setSearchingByText] = useState<string | null>(null);

    const handleUpdateQuery = useCallback(
        (query: Partial<TQuery>) => {
            updateQuery(query);
            // unselect view
            if (viewsParams) {
                viewsParams.setSelectedViewPk(undefined);
            }
        },
        [updateQuery, viewsParams]
    );

    const onSearch = useCallback(
        (value: string) => {
            const previousSearchValues = query.text;
            let newSearchValues = [value];
            if (previousSearchValues) {
                let idTextToUpdate = previousSearchValues.findIndex(
                    (value: string) => value === searchingByText
                );

                if (idTextToUpdate === -1) {
                    newSearchValues = previousSearchValues.concat(value);
                } else {
                    previousSearchValues.splice(idTextToUpdate, 1, value);
                    newSearchValues = previousSearchValues;
                }
            }

            handleUpdateQuery({text: newSearchValues} as Partial<TQuery>);
            setSearchingByText(null);
        },
        [query, searchingByText, handleUpdateQuery]
    );

    const onSelectView = useCallback(
        (view: GenericSettingsView<TQuery>) => {
            if (!viewsParams) {
                return;
            }
            let query = {
                ...(resetQuery ?? {}),
                ...view?.settings,
            };
            if (parseQuery) {
                query = parseQuery(query);
            }
            updateQuery(query);
            viewsParams?.setSelectedViewPk(view?.pk);
        },
        [parseQuery, updateQuery, viewsParams, resetQuery]
    );

    return (
        <>
            {searchingByText !== null ? (
                <SearchInputBar
                    initialValue={searchingByText}
                    onSearch={onSearch}
                    closeSearchBar={() => setSearchingByText(null)}
                    searchPlaceholder={searchPlaceholder}
                />
            ) : (
                <Flex position="relative" width="100%">
                    <Flex
                        flex={1}
                        border={"1px solid"}
                        bg="grey.white"
                        borderColor="grey.light"
                        px={2}
                        py={1}
                        alignItems="center"
                        borderRadius={1}
                        height="42px"
                        data-testid={dataTestId}
                    >
                        {searchEnabled && (
                            <Flex
                                borderRight={"1px solid"}
                                borderColor="grey.light"
                                alignItems="center"
                                height="25px"
                                mr={2}
                            >
                                <TooltipWrapper
                                    content={t("common.search")}
                                    boxProps={{flexShrink: 0}}
                                >
                                    <ClickableFlex
                                        onClick={openSearchBar}
                                        borderRadius="50%"
                                        mr={2}
                                        p={1}
                                        my={-1}
                                    >
                                        <Icon
                                            name="search"
                                            data-testid="search-button"
                                            color="grey.dark"
                                        />
                                    </ClickableFlex>
                                </TooltipWrapper>
                            </Flex>
                        )}
                        {filters.length > 0 && (
                            <FiltersSection<TQuery>
                                filters={filters}
                                query={query}
                                updateQuery={handleUpdateQuery}
                                displayLabel={size === "large"}
                            />
                        )}
                        <BadgesSection<TQuery>
                            filters={filters}
                            query={query}
                            updateQuery={handleUpdateQuery}
                            resetQuery={resetQuery ? onResetQuery : undefined}
                            alwaysCollapsed={size === "small"}
                            searchEnabled={searchEnabled}
                            onBadgeClick={onBadgeClick}
                        />
                        {viewsParams?.addEnabled && (
                            <SaveViewButton<TQuery>
                                query={query}
                                viewCategory={viewsParams.viewCategory}
                                defaultSettings={resetQuery}
                                setSelectedView={onSelectView}
                            />
                        )}
                    </Flex>
                    {viewsParams && (
                        <Flex ml={2} height="inherit">
                            <ViewSelection<TQuery>
                                selectedViewPk={viewsParams.selectedViewPk}
                                setSelectedView={onSelectView}
                                viewCategory={viewsParams.viewCategory}
                                deleteEnabled={viewsParams.deleteEnabled}
                                displayViewName={size === "large"}
                            />
                        </Flex>
                    )}
                </Flex>
            )}
        </>
    );

    function onResetQuery() {
        if (resetQuery) {
            handleUpdateQuery(resetQuery);
        }
        setSearchingByText(null);
    }

    function onBadgeClick(value: string) {
        setSearchingByText(value);
    }

    function openSearchBar() {
        setSearchingByText("");
    }
}
