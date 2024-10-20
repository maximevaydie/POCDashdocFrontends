import {screenSizes} from "@dashdoc/web-ui";
import React, {createContext, useCallback, useEffect, useState} from "react";

export type Device = "mobile" | "desktop";

const initialContext: Device = "mobile";

/**
 * A context to store the device state according to the window resizing.
 *
 * Usage in a child component:
 * ```
 * const device = useContext(DeviceContext);
 * ```
 */
export const DeviceContext = createContext<Device>(initialContext);

type Props = {
    children: React.ReactNode;
};
export function DeviceContextProvider({children}: Props) {
    const [storedDevice, persistDevice] = useState<Device>(() => {
        const innerWidth = window.innerWidth;
        return getDevice(innerWidth);
    });

    const listener = useCallback(() => {
        const innerWidth = window.innerWidth;
        const currentDevice = getDevice(innerWidth);
        persistDevice(currentDevice);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", listener);
        return () => {
            window.removeEventListener("resize", listener);
        };
    }, [listener]);

    return <DeviceContext.Provider value={storedDevice}>{children}</DeviceContext.Provider>;
}

function getDevice(innerWidth: number): Device {
    return innerWidth <= screenSizes.sm ? "mobile" : "desktop"; // fit with FullHeightMinWidthNarrowScreen
}
