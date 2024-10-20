import {theme} from "@dashdoc/web-ui";
import React from "react";
export const TimeSvg = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M2.875 16C2.875 19.481 4.25781 22.8194 6.71922 25.2808C9.18064 27.7422 12.519 29.125 16 29.125C19.481 29.125 22.8194 27.7422 25.2808 25.2808C27.7422 22.8194 29.125 19.481 29.125 16C29.125 12.519 27.7422 9.18064 25.2808 6.71922C22.8194 4.25781 19.481 2.875 16 2.875C12.519 2.875 9.18064 4.25781 6.71922 6.71922C4.25781 9.18064 2.875 12.519 2.875 16Z"
            stroke={theme.colors.blue.default}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M16 16V11.3125"
            stroke={theme.colors.blue.default}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M16 16L21.8587 21.86"
            stroke={theme.colors.blue.default}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
