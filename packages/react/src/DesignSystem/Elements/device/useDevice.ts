import {useContext} from "react";

import {DeviceContext} from "./deviceContext";

export function useDevice() {
    return useContext(DeviceContext);
}
