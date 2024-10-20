import {t} from "@dashdoc/web-core";
import React, {ReactNode} from "react";

import {FloatingMenu, Text} from "../base";
import {Button} from "../button";
import {Box} from "../layout";

import {ItemSelector} from "./item-selector/ItemSelector";

export type SortValue<T extends string> = {
    criterion: T;
    order: "desc" | "asc";
};

export type SortCriteriaOption<T> = {
    value: T;
    label: string;
};
export interface MultiCriteriaSortSelectorProps<T extends string> {
    label: ReactNode;
    value: SortValue<T> | null;
    criteriaOptions: Array<SortCriteriaOption<T>>;
    onChange: (value: SortValue<T> | null) => void;
    "data-testid"?: string;
}

export function MultiCriteriaSortSelector<T extends string = string>({
    label,
    value: sortValue,
    criteriaOptions,
    onChange,
    "data-testid": dataTestId,
}: MultiCriteriaSortSelectorProps<T>) {
    const ORDER_OPTIONS = [
        {value: "asc", label: t("common.ascendingOrder")},
        {value: "desc", label: t("common.descendingOrder")},
    ] as const;

    return (
        <FloatingMenu label={label} dataTestId={dataTestId}>
            <Box p={3}>
                <Button
                    variant="plain"
                    onClick={() => onChange(null)}
                    data-testid={`${dataTestId}-reset`}
                    disabled={!sortValue}
                    position="absolute"
                    size="xsmall"
                    top={2}
                    right={1}
                >
                    {t("common.reset")}
                </Button>
                {criteriaOptions.length && (
                    <Box pb={3} mb={3} borderBottom="1px solid" borderColor="grey.light">
                        <Text variant="subcaption" color="grey.dark" fontWeight="400" mb={2}>
                            {t("common.sortCriterion")}
                        </Text>
                        <ItemSelector
                            items={criteriaOptions.map(({value, label}) => ({
                                id: value,
                                label,
                            }))}
                            value={sortValue?.criterion}
                            onChange={(criterion) =>
                                onChange({
                                    ...(sortValue || {
                                        order: "asc", // default to ascending order
                                    }),
                                    criterion: criterion as T,
                                })
                            }
                            data-testid={dataTestId}
                        />
                    </Box>
                )}

                <Text variant="subcaption" color="grey.dark" fontWeight="400" mb={2}>
                    {t("common.sortOrder")}
                </Text>
                <ItemSelector
                    items={ORDER_OPTIONS.map(({value, label}) => ({
                        id: value,
                        label,
                    }))}
                    value={sortValue?.order}
                    onChange={(order: "desc" | "asc") => {
                        if (!sortValue) {
                            onChange({
                                criterion: criteriaOptions[0].value, // default to first criterion
                                order,
                            });
                        } else {
                            onChange({...sortValue, order});
                        }
                    }}
                    data-testid={dataTestId}
                />
            </Box>
        </FloatingMenu>
    );
}
