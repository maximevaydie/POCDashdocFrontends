import {useVirtualizer} from "@tanstack/react-virtual";
import {useEffect} from "react";

import {MIN_CELL_HEIGHT} from "../gridStyles";

export function useResourceVirtualizer(
    resourcesCount: number,
    resourcesTotalCount: number,
    parentElement: React.RefObject<HTMLDivElement>,
    onEndReached: (() => void) | undefined
) {
    const resourceVirtualizer = useVirtualizer({
        count: resourcesTotalCount,
        getScrollElement: () => parentElement.current,
        estimateSize: () => MIN_CELL_HEIGHT,
    });

    const virtualItems = resourceVirtualizer.getVirtualItems();
    const lastItemIndex = virtualItems[virtualItems.length - 1]?.index;

    useEffect(() => {
        if (!lastItemIndex) {
            return;
        }

        if (lastItemIndex >= resourcesCount - 1) {
            onEndReached?.();
        }
    }, [onEndReached, resourcesCount, lastItemIndex]);

    return {resourceVirtualizer, virtualItems};
}
