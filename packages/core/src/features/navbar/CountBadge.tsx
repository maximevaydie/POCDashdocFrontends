import {Box, theme} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import styled from "@emotion/styled";

const countBadgeImportant = (props: {important: boolean; alert?: boolean}) => css`
    background-color: ${props.alert
        ? theme.colors.red.default
        : props.important
        ? theme.colors.blue.default
        : "transparent"};
    color: ${props.alert
        ? theme.colors.grey.white
        : props.important
        ? theme.colors.grey.white
        : theme.colors.grey.dark};
`;

export const CountBadge = styled(Box)`
    display: inline-block;
    min-width: 10px;
    padding: 3px 7px;
    font-size: 12px;
    font-weight: 400;
    line-height: 1;
    vertical-align: middle;
    white-space: nowrap;
    text-align: center;
    border-radius: 10px;
    float: right !important;
    margin-right: 10px;
    margin-top: 2px;
    height: fit-content;
    ${countBadgeImportant};
`;
