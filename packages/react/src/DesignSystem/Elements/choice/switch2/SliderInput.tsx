import {theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";

export const SliderInput = styled.input`
    &:checked + span {
        background-color: ${theme.colors.blue.default};
    }
    &:disabled + span {
        background-color: ${theme.colors.grey.light};
        opacity: 0.4;
        cursor: not-allowed;
    }
    &:disabled:checked + span {
        background-color: ${theme.colors.blue.light};
        opacity: 0.4;
        cursor: not-allowed;
    }
    &:focus + span {
        box-shadow: 0 0 1px ${theme.colors.blue.default};
    }
    &:checked + span:before {
        -webkit-transform: translateX(13px);
        -ms-transform: translateX(13px);
        transform: translateX(13px);
    }
`;

SliderInput.defaultProps = {
    type: "checkbox",
};
