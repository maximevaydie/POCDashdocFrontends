import {css} from "@emotion/react";
import {CSSInterpolation} from "@emotion/serialize";
import React from "react";

interface IconProps {
    background?: string;
    circle?: any;
    name: string;
    css?: CSSInterpolation;
    nonFixedWidth?: boolean;
    className?: string;
    color?: string;
    style?: "regular" | "solid";
    onClick?: () => any;
}

/**
 * @deprecated - use Icon from ui-kit instead
 */
export class Icon extends React.PureComponent<IconProps> {
    static defaultProps = {style: "solid"};

    render() {
        const circleCss = css`
            background: ${this.props.background};
            border-radius: 100px;
            padding: 3px;
        `;
        const colorCss = css`
            color: ${this.props.color};
        `;
        const clickableCss = css`
            cursor: pointer;
        `;
        const baseClass = this.props.style === "regular" ? "far" : "fa";
        return (
            <i
                className={`${baseClass} fa-${this.props.name} ${
                    !this.props.nonFixedWidth && "fa-fw"
                } ${this.props.className || ""}`}
                css={[
                    this.props.circle && circleCss,
                    this.props.css,
                    this.props.color && colorCss,
                    this.props.onClick && clickableCss,
                ]}
                onClick={this.props.onClick}
            />
        );
    }
}
