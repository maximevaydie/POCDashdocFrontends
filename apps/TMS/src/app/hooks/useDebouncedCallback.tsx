import {useCallback, useRef} from "react";

const useDebouncedCallback = (callback: Function, delay: number, dependencies?: any[]) => {
    const timeout = useRef<ReturnType<typeof setTimeout>>();

    const comboDeps = dependencies ? [callback, delay, ...dependencies] : [callback, delay];

    return useCallback((...args: any) => {
        if (timeout.current != null) {
            clearTimeout(timeout.current);
        }

        timeout.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, comboDeps);
};

export default useDebouncedCallback;
