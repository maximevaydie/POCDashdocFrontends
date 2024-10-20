import React, {ReactChild, ReactFragment} from "react";

import {useDevice} from "./useDevice";

/**
 * Wrapper to show children only on mobile.
 */
export function OnMobile({children}: {children?: ReactChild | ReactFragment}) {
    const device = useDevice();
    if (device === "mobile") {
        return <>{children}</>;
    }
    return null;
}

/**
 * Wrapper to show children only on desktop.
 */
export function OnDesktop({children}: {children?: ReactChild | ReactFragment}) {
    const device = useDevice();
    if (device === "desktop") {
        return <>{children}</>;
    }
    return null;
}
