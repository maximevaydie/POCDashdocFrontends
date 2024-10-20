import {theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";

export const InputContainer = styled.label`
    position: relative;
    display: inline-block;
    min-width: 35px;
    width: 35px;
    height: 20px;
    margin-bottom: 0;
    > input {
        display: none;
    }
`;

export const Slider = styled.span`
    position: absolute;
    cursor: pointer;
    display: flex;
    align-items: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${theme.colors.grey.light};
    -webkit-transition: 0.2s;
    transition: 0.2s;
    border-radius: 12px;
    &:before {
        position: relative;
        border-radius: 50%;
        content: "";
        height: 15px;
        width: 15px;
        left: 4px;
        background-color: ${theme.colors.grey.white};
        -webkit-transition: 0.2s;
        transition: 0.2s;
        box-shadow: 0px 2px 4px 0px ${theme.colors.neutral.transparentBlack};
    }
`;
