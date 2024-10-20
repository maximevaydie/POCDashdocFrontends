import {Ref} from "react";
import {useDndScrolling, createHorizontalStrength, BoxType, Point} from "react-dnd-scrolling";

import {useResourceOffset} from "./useResourceOffset";

export function useDndScrollingWithOffset(ref: Ref<any>) {
    const linearHorizontalStrength = createHorizontalStrength(60);
    const resourceOffset = useResourceOffset();
    const leftOffset = resourceOffset - 40;

    function hStrength(box: BoxType, point: Point) {
        return linearHorizontalStrength(
            {...box, x: box.x + leftOffset, w: box.w - leftOffset},
            point
        );
    }
    useDndScrolling(ref, {horizontalStrength: hStrength});
}
