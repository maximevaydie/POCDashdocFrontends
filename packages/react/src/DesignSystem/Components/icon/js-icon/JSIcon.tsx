import React, {FunctionComponent} from "react";

import {defaultPropsByIconNames, icons} from "../constants";
import {IconDefinition} from "../types";
import {JSIconContainer} from "./JSIconContainer";
import {SVG} from "./StyledSVG";
import {JSIconProps} from "./types";

export const JSIcon: FunctionComponent<JSIconProps> = ({
    name,
    rotation,
    scale,
    strokeWidth,
    svgWidth,
    svgHeight,
    ...props
}) => {
    const defaultProps = defaultPropsByIconNames[name] ?? {};
    rotation = rotation ?? defaultProps.rotation ?? 0;
    scale = scale ?? defaultProps.scale ?? [1, 1];

    const icon = icons[name] as IconDefinition;
    const [iconSlug, iconWidth, iconHeight, iconOptions, iconPaths] = icon;

    return (
        <JSIconContainer alt={iconSlug} {...props}>
            <SVG
                viewBox={`0 0 ${iconWidth} ${iconHeight}`}
                width={svgWidth ?? "1.15em"}
                height={svgHeight ?? "1.15em"}
                transform={`rotate(${rotation}) scale(${scale})`}
            >
                <g transform="matrix(1,0,0,1,0,0)">
                    {iconPaths.map((path, index) => (
                        <path
                            fill={iconOptions[index]["fill"] !== "none" ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeLinecap={iconOptions[index]["stroke-linecap"]}
                            strokeLinejoin={iconOptions[index]["stroke-linejoin"]}
                            strokeWidth={strokeWidth ?? iconOptions[index]["stroke-width"]}
                            key={path}
                            d={path}
                        />
                    ))}
                </g>
            </SVG>
        </JSIconContainer>
    );
};
