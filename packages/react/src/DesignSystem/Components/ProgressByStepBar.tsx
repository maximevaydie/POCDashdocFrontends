import {theme} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";

const ProgressBarContainer = styled("div")`
    position: relative;
    display: table;
    height: 24px;
    overflow: visible;
`;

const ProgressBarUl = styled("ul")`
    width: 100%;
    display: table;
    border-collapse: collapse;
    table-layout: fixed;
    height: 24px;
    -ms-box-sizing: border-box;
    -o-box-sizing: border-box;
    box-sizing: border-box;
    overflow: hidden;
    list-style: none;
    border-radius: 3px;
`;

const activeBackground = (props: {[property: string]: any}) => css`
    background: ${props.active
        ? props.danger
            ? theme.colors.red.default
            : theme.colors.green.default
        : theme.colors.grey.light};
`;

const activeColor = (props: {[property: string]: any}) => css`
    color: ${props.active ? theme.colors.grey.white : theme.colors.grey.ultradark};
`;

const ProgressBarLi = styled("li")<{active: boolean; danger: boolean}>`
    position: relative;
    display: table-cell;
    text-align: left;
    line-height: 24px;
    vertical-align: middle;
    ${activeColor};
    text-align: center;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    ${activeBackground};
`;

const ProgressBarContent = styled("div")`
    position: relative;
`;

const ProgressBarCellName = styled("span")`
    font:
        400 12px/16px "Open Sans",
        sans-serif;
    display: inline-block;
    position: relative;
    left: 4px;
`;

const ProgressBarCellArrow = styled("span")<{active: boolean; danger: boolean}>`
    width: 6px;
    height: 30px;
    position: absolute;
    top: -4px;
    left: 0px;
    overflow: hidden;

    &::after {
        width: 32px;
        height: 33px;
        position: absolute;
        right: -7px;
        top: 0px;
        border-top: 2px solid ${theme.colors.grey.white};
        border-right: 2px solid ${theme.colors.grey.white};
        -webkit-transform: scaleX(0.3) rotate(45deg);
        -ms-transform: scaleX(0.3) rotate(45deg);
        transform: scaleX(0.4) rotate(45deg);
        content: " ";
        ${activeBackground};
    }
`;

interface ProgressBarItem {
    label: string;
    active: boolean;
    danger?: boolean;
}

export interface ProgressBarProps {
    items: Array<ProgressBarItem>;
}

export class ProgressByStepBar extends React.PureComponent<ProgressBarProps> {
    _renderItem = (item: ProgressBarItem, index: number) => {
        const prevItem = this.props.items[index - 1];
        return (
            // @ts-ignore
            <ProgressBarLi key={index} active={item.active} danger={item.danger}>
                <ProgressBarContent>
                    <ProgressBarCellName>{item.label}</ProgressBarCellName>
                    {index !== 0 && (
                        <ProgressBarCellArrow
                            active={prevItem && prevItem.active}
                            // @ts-ignore
                            danger={prevItem && prevItem.danger}
                        />
                    )}
                </ProgressBarContent>
            </ProgressBarLi>
        );
    };

    render = () => {
        return (
            <ProgressBarContainer>
                <ProgressBarUl>{this.props.items.map(this._renderItem)}</ProgressBarUl>
            </ProgressBarContainer>
        );
    };
}
