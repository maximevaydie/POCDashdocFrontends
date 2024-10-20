import {svgs} from "./constants";
import {IconNames} from "./types";

// Dispatch between JS and SVG icons depending on the icon name
export function isSVG(name: IconNames): name is keyof typeof svgs {
    return Object.keys(svgs).includes(name);
}
