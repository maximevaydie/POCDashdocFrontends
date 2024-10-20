// eslint-disable-next-line no-restricted-imports
import {startOfMinute} from "date-fns";
import React, {createContext, useEffect, useState} from "react";

// Time interval to update the browser time
const INTERVAL = 1 * 1000; // 1 second

/**
 * A context to store the browser time state (from year to minute) according to the browser Date API.
 *
 * Usage in a child component:
 * ```
 * const time = useContext(BrowserTimeContext);
 * ```
 */
export const BrowserTimeContext = createContext<Date>(startOfMinute(new Date()));

type Props = {
    interval?: number;
    children: React.ReactNode;
};
export function BrowserTimeProvider({interval = INTERVAL, children}: Props) {
    const [storedDate, persistDate] = useState<Date>(() => {
        return startOfMinute(new Date());
    });

    useEffect(() => {
        var timer = setInterval(() => persistDate(startOfMinute(new Date())), interval);
        return function cleanup() {
            clearInterval(timer);
        };
    });

    return (
        <BrowserTimeContext.Provider value={storedDate}>{children}</BrowserTimeContext.Provider>
    );
}
