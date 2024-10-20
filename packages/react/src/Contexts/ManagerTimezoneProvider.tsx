import {TimezoneProvider} from "@dashdoc/web-core";
import React from "react";

import {useSelector} from "../hooks/useSelector";
import {getTimezone} from "../redux/accountSelector";
type Props = {
    children: React.ReactNode;
};
export function ManagerTimezoneProvider({children}: Props) {
    const timezone = useSelector(getTimezone);
    return <TimezoneProvider timezone={timezone}>{children}</TimezoneProvider>;
}
