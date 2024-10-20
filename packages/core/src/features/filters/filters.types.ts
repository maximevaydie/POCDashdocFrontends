export type FilterSelectorProps<TQuery> = {
    currentQuery: TQuery;
    updateQuery: (newQuery: Partial<TQuery>, method?: "push" | "replace") => void;
};
