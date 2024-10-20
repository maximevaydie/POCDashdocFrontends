import {TimezoneContext} from "@dashdoc/web-core";
import {useContext} from "react";

export function useTimezone() {
    const timezone = useContext(TimezoneContext);
    return timezone;
}
