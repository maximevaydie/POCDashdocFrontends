import React, {FunctionComponent} from "react";
import InlineSVG from "react-inlinesvg";

import {defaultPropsByIconNames, svgs} from "../constants";

import {InlineSVGIconContainer} from "./InlineSVGIconContainer";
import {InlineSVGIconProps} from "./types";

export const InlineSVGIcon: FunctionComponent<InlineSVGIconProps> = ({
    name,
    rotation,
    scale,
    ...props
}) => {
    const defaultProps = defaultPropsByIconNames[name] ?? {};
    rotation = rotation ?? defaultProps.rotation ?? 0;

    // The whole idea is that the <InlineSVG> element
    // scales to fit the <InlineSVGIconContainer> container, in other words
    // to scale an icon we scale its container.
    // So scale is multiplied to witdh and height and applied
    // to <InlineSVGIconContainer>, while <InlineSVG> fits 100% of the
    // <InlineSVGIconContainer>
    scale = scale ?? defaultProps.scale ?? [1, 1];
    const width = `${scale[0] * 1.15}em`;
    const height = `${scale[1] * 1.15}em`;
    const src: string = svgs[name] as any as string;

    return (
        <InlineSVGIconContainer width={width} height={height} {...props}>
            <InlineSVG
                style={{display: "block"}}
                transform={`rotate(${rotation})`}
                src={src}
                width="100%"
                height="100%"
                preProcessor={replaceHardcodedColors}
            />
        </InlineSVGIconContainer>
    );
};

function replaceHardcodedColors(code: string): string {
    const result = code
        .replace(/stroke=".*?"/g, 'stroke="currentcolor"')
        .replace(/stroke:.*?;/g, "stroke: currentcolor;");
    return result;
}
