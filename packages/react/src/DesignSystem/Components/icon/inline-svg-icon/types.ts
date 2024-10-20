import {BoxProps} from "@dashdoc/web-ui";

import {svgs} from "../constants";
import {IconProps} from "../types";

export type InlineSVGIconNames = keyof typeof svgs;

export type InlineSVGIconProps = Omit<IconProps, "name"> & {name: InlineSVGIconNames};

export type InlineSVGIconContainerProps = BoxProps & {alt?: string; strokeWidth?: number};
