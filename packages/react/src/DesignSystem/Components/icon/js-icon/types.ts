import {BoxProps} from "@dashdoc/web-ui";

import {icons} from "../constants";
import {IconProps} from "../types";

export type JSIconContainerProps = BoxProps & {alt?: string; round?: boolean};

// Back in the days, Streamline shipped icons as JSFiles.
// This is the code to handle those. For archeology, read
// https://medium.com/streamline-icons/how-streamline-narrows-down-its-focus-eac6fdb5c6f2
export type JSIconNames = keyof typeof icons;

export type JSIconProps = Omit<IconProps, "name"> & {
    name: JSIconNames;
    svgWidth?: string;
    svgHeight?: string;
};
