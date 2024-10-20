import React, {useEffect, useState} from "react";

import {useResourceOffset} from "../../hooks/useResourceOffset";

export function useZoom(ref: React.RefObject<HTMLDivElement>, onZoom?: (delta: number) => void) {
    const resourceOffset = useResourceOffset();

    const [scrollValues, setScrollValues] = useState<{
        scrollWidth: number;
        scrollLeft: number;
        mouseOffset: number;
    } | null>(null);

    useEffect(() => {
        function handleZoom(event: WheelEvent) {
            // Apply only if CTRL or CMD key are pressed
            if ((event.metaKey || event.ctrlKey) && onZoom && ref.current) {
                // prevent default horizontal scroll
                event.preventDefault();

                // Store scroll state before zoom
                const {x: xElementOffset} = ref.current.getBoundingClientRect();

                setScrollValues({
                    scrollWidth: ref.current.scrollWidth,
                    scrollLeft: ref.current.scrollLeft,
                    mouseOffset: Math.max(event.clientX - xElementOffset, 0),
                });

                // Zoom
                onZoom(event.deltaY > 0 ? 1 : -1);
            }
        }

        const element = ref.current;

        if (element && onZoom) {
            element.addEventListener("wheel", handleZoom, false);
        }
        return function cleanup() {
            if (element) {
                element.removeEventListener("wheel", handleZoom, false);
            }
        };
    }, []);

    useEffect(() => {
        if (!scrollValues || !ref.current) {
            return;
        }

        const prevScrolllWidth = scrollValues.scrollWidth;
        const prevScrollLeft = scrollValues.scrollLeft;
        const mouseOffset = scrollValues.mouseOffset;

        // Adjust scroll to center at mouse position
        const zoomFactor =
            (ref.current.scrollWidth - resourceOffset) / (prevScrolllWidth - resourceOffset);

        ref.current.scrollLeft =
            resourceOffset +
            zoomFactor * (prevScrollLeft + mouseOffset - resourceOffset) -
            mouseOffset;
        setScrollValues(null);
    }, [ref, resourceOffset, scrollValues]);
}
