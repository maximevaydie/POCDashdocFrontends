import {useState, useCallback, useLayoutEffect, useEffect} from "react";

export const useIsOverflow = (ref: React.RefObject<HTMLElement>, dependencies: any) => {
    const [isOverflow, setIsOverflow] = useState<boolean>(false);

    const trigger = useCallback(() => {
        const {current} = ref;
        if (current) {
            setIsOverflow(
                current.scrollHeight > current.clientHeight ||
                    current.scrollWidth > current.clientWidth
            );
        }
    }, [ref]);

    useLayoutEffect(() => {
        const {current} = ref;
        if (current) {
            if ("ResizeObserver" in window) {
                new ResizeObserver(trigger).observe(current);
            }
        }
    }, [ref, trigger]);

    useEffect(() => {
        trigger();
    }, [trigger, dependencies]);

    return isOverflow;
};
