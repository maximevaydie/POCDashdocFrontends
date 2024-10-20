import React, {ReactNode} from "react";
import {DndProvider as ReactDndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {TouchBackend} from "react-dnd-touch-backend";

type Props = {
    children: ReactNode;
};

/**
 * Should wrap the whole area where a dnd should be available.
 */
export const DndProvider = ({children}: Props) => {
    // isTouchDevice is set to true if touch pointer is the main one used in the device
    // (eg it won't be activated for desktop with touched screen)
    const isTouchDevice = window.matchMedia("(pointer:coarse)").matches;
    const backend = isTouchDevice ? TouchBackend : HTML5Backend;
    return <ReactDndProvider backend={backend}>{children}</ReactDndProvider>;
};
