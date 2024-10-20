import {t} from "@dashdoc/web-core";
import {Button, Flex} from "@dashdoc/web-ui";
import React, {ReactNode, useEffect, useState} from "react";

type Props = {
    items: Array<{id: string; label: string | ReactNode}>;
    values: string[];
    onChange: (newValues: string[]) => void;
};
type AsyncProps = Props & {
    hasMore: boolean;
    loadAll: () => void;
};

export function SelectUnSelectAllItems({
    items,
    values,
    onChange,
    ...asyncProps
}: Props | AsyncProps) {
    const hasMore = "hasMore" in asyncProps ? asyncProps.hasMore : false;
    const loadAll = "loadAll" in asyncProps ? asyncProps.loadAll : undefined;

    const [actionOnAllItems, setActionOnAllItems] = useState<null | "select" | "unselect">(null);
    useEffect(() => {
        if (!hasMore) {
            switch (actionOnAllItems) {
                case "select":
                    onChange([...new Set([...values, ...items.map((item) => item.id)])]);
                    setActionOnAllItems(null);
                    break;
                case "unselect":
                    onChange(values.filter((value) => !items.some((item) => item.id === value)));
                    setActionOnAllItems(null);
                    break;
            }
        }
        // only triggered when load last page of items and when actionOnAllItems is triggered
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasMore, actionOnAllItems]);

    return (
        <Flex my={1}>
            <Button
                onClick={handleSelectAll}
                variant="plain"
                data-testid="filter-select-all-results"
                disabled={!!actionOnAllItems}
                size="xsmall"
            >
                {t("common.selectAll")}
            </Button>

            <Button
                onClick={handleUnselectAll}
                variant="plain"
                data-testid="filter-select-all-results"
                disabled={!!actionOnAllItems}
                size="xsmall"
            >
                {t("common.deselectAll")}
            </Button>
        </Flex>
    );

    function handleSelectAll() {
        loadAll?.();
        setActionOnAllItems("select");
    }
    function handleUnselectAll() {
        loadAll?.();
        setActionOnAllItems("unselect");
    }
}
