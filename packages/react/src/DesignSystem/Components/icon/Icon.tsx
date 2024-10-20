import React, {FunctionComponent} from "react";

import {InlineSVGIcon, InlineSVGIconNames} from "./inline-svg-icon";
import {JSIcon, JSIconNames} from "./js-icon";
import {IconProps} from "./types";
import {isSVG} from "./utils";

export const Icon: FunctionComponent<
    Omit<IconProps, "scale"> & {scale?: number | [number, number]}
> = ({name, scale, ...props}) => {
    if (typeof scale === "number") {
        scale = [scale, scale];
    }

    if (isSVG(name)) {
        return <InlineSVGIcon name={name as InlineSVGIconNames} scale={scale} {...props} />;
    } else {
        return <JSIcon name={name as JSIconNames} scale={scale} {...props} />;
    }
};
