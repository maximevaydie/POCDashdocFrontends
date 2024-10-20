import {OnDesktop, OnMobile} from "@dashdoc/web-ui";
import {SlotFloatingPanel} from "features/slot/slot-panel/SlotFloatingPanel";
import React from "react";

import {ZoneContainerMobile} from "./manager/ZoneContainerMobile";
import {ZonesContainer} from "./manager/ZonesContainer";

export function ManagerPortal() {
    return (
        <>
            <OnDesktop>
                <ZonesContainer />
            </OnDesktop>
            <OnMobile>
                <ZoneContainerMobile />
            </OnMobile>
            <SlotFloatingPanel />
        </>
    );
}
