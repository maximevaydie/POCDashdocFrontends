import {css} from "@emotion/react";
import React from "react";

import {Box} from "../../Elements/layout/Box";
import {theme} from "../../Elements/theme";

export const LoadingWheel = (props: {noMargin?: boolean; small?: boolean; inline?: boolean}) => {
    const size = props.small ? 17 : 34;
    let margin;

    if (!props.small) {
        margin = "100px auto";
    }
    if (props.noMargin) {
        margin = "auto";
    }

    return (
        <Box
            data-testid="loading-wheel"
            margin={margin}
            textAlign={props.noMargin || !props.small ? "center" : "left"}
            display={props.inline ? "inline-block" : "block"}
            width={size}
            height={size}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 200 200"
                width={size}
                height={size}
                css={css`
                    @keyframes loading-wheel {
                        0% {
                            transform: rotate(0deg);
                        }

                        to {
                            transform: rotate(1turn);
                        }
                    }
                    animation: loading-wheel 2s infinite linear;
                `}
            >
                <circle
                    fill="none"
                    stroke={theme.colors.grey.ultradark}
                    strokeWidth="20"
                    strokeDasharray="410 1000"
                    strokeDashoffset="0"
                    cx="100"
                    cy="100"
                    r="70"
                ></circle>
            </svg>
        </Box>
    );
};
