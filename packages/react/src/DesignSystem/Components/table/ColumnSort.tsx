import React from "react";

import {
    MultiCriteriaSortSelector,
    SortCriteriaOption,
    SortValue,
} from "../../choice/MultiCriteriaSortSelector";
import {Flex} from "../../layout";
import {Icon} from "../icon";

interface ColumnSortProps<T extends string> {
    sortValue: SortValue<T> | null;
    sortCriteria: Array<SortCriteriaOption<T>>;
    onUpdateSort: (sortValue: SortValue<T> | null) => void;
    "data-testid": string;
}

export function ColumnSort<T extends string = string>({
    sortValue,
    sortCriteria,
    onUpdateSort,
    "data-testid": dataTestId,
}: ColumnSortProps<T>) {
    const isActive = sortCriteria.some((c) => c.value === sortValue?.criterion);

    return (
        <MultiCriteriaSortSelector
            label={
                <Flex
                    flexShrink={0}
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor={isActive ? "blue.ultralight" : "transparent"}
                    height="20px"
                    width="20px"
                    borderRadius="50%"
                    data-testid="sort-button"
                >
                    <Flex
                        flexDirection="column"
                        fontSize="0.4em"
                        color={isActive ? "blue.default" : "grey.dark"}
                    >
                        {sortValue?.order !== "desc" && (
                            <Icon name="triangleUp" alignSelf="start" />
                        )}
                        {sortValue?.order !== "asc" && (
                            <Icon name="triangleDown" alignSelf="end" />
                        )}
                    </Flex>
                </Flex>
            }
            value={sortValue ?? null}
            criteriaOptions={sortCriteria}
            onChange={onUpdateSort}
            data-testid={dataTestId}
        />
    );
}
