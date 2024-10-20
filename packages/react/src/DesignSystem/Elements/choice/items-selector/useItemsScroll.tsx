import debounce from "lodash.debounce";
import React, {useCallback} from "react";

export function useItemsScroll(onEndReached: (() => void) | undefined) {
    const debouncedOnScroll = useCallback(
        debounce(({target}) => {
            if (onEndReached) {
                if (target.scrollHeight - target.clientHeight - target.scrollTop <= 50) {
                    onEndReached();
                }
            }
        }, 300),
        [onEndReached]
    );

    const onScroll = useCallback(
        (e: React.UIEvent<HTMLElement>) => {
            e.persist();
            debouncedOnScroll(e);
        },
        [debouncedOnScroll]
    );

    return onScroll;
}
