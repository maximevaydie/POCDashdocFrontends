import {SlotFloatingPanel} from "features/slot/slot-panel/SlotFloatingPanel";
import React from "react";

import {SlotLayout} from "./delegate/SlotLayout";

export function DelegatePortal() {
    return (
        <>
            <SlotLayout />
            <SlotFloatingPanel />
        </>
    );
}
