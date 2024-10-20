import {Logger} from "@dashdoc/web-core";
import {useEffect, useState} from "react";

export function useMouseButtonDown(rootId: string) {
    const [mouseDown, setMouseDown] = useState(false);

    useEffect(() => {
        const dom = document.getElementById(rootId);
        if (dom) {
            const handleDocumentMouseUp = (ev: MouseEvent) => {
                if (ev.button !== 2) {
                    setMouseDown(false);
                }
            };
            const handleDocumentMouseDown = (ev: MouseEvent) => {
                if (ev.button !== 2) {
                    setMouseDown(true);
                }
            };
            dom.addEventListener("mouseup", handleDocumentMouseUp);
            dom.addEventListener("mousedown", handleDocumentMouseDown);
            return () => {
                if (dom) {
                    dom.removeEventListener("mouseup", handleDocumentMouseUp);
                    dom.removeEventListener("mouseup", handleDocumentMouseDown);
                }
            };
        } else {
            Logger.error("dom is null");
            return () => {
                // Nothing to clean
            };
        }
    }, [rootId]);

    return mouseDown;
}
