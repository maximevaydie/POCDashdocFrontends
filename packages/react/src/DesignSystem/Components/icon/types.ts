import {InlineSVGIconContainer, InlineSVGIconNames} from "./inline-svg-icon";
import {JSIconNames} from "./js-icon";

type IconSlug = string;
type IconWidth = number;
type IconHeight = number;
type IconOptions = {
    fill: string;
    stroke: string;
    "stroke-linecap": "butt" | "round" | "square" | "inherit";
    "stroke-linejoin": "miter" | "round" | "bevel" | "inherit";
    "stroke-width": number | string;
};
type IconPaths = string;
export type IconDefinition = [IconSlug, IconWidth, IconHeight, IconOptions[], IconPaths[]];

export type IconNames = JSIconNames | InlineSVGIconNames;

export type IconProps = Parameters<typeof InlineSVGIconContainer>[0] & {
    name: IconNames;
    rotation?: number;
    scale?: [number, number];
    round?: boolean;
    strokeWidth?: number;
    svgWidth?: string;
    svgHeight?: string;
};
