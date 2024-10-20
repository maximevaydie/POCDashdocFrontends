import React, {createContext} from "react";

/**
 * The default timezone is based on the behavior of DateTimeFormat ("Europe/Paris" in fallback).
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions
 */
export const BROWSER_TIMEZONE =
    Intl.DateTimeFormat()?.resolvedOptions()?.timeZone ?? "Europe/Paris";

/**
 * A context to store the timezone state.
 *
 * Usage in a child component:
 * ```
 * const timezone = useContext(TimezoneContext);
 * ```
 */
export const TimezoneContext = createContext<string>(BROWSER_TIMEZONE);

type Props = {
    timezone?: string;
    children: React.ReactNode;
};
export function TimezoneProvider({timezone = BROWSER_TIMEZONE, children}: Props) {
    return <TimezoneContext.Provider value={timezone}>{children}</TimezoneContext.Provider>;
}
