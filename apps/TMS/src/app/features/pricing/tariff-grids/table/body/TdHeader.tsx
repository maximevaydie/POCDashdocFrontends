import {Box, themeAwareCss} from "@dashdoc/web-ui";
import {theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";

export const TdHeader = styled(Box.withComponent("td"))<{
    isClickable?: boolean;
    isSelected?: boolean;
}>(({isClickable, isSelected}) =>
    themeAwareCss({
        cursor: isClickable ? "pointer" : "default",
        border: `1px solid ${theme.colors.grey.ultralight} !important`, // bypass bootstrap css
        textAlign: "right",
        padding: "10px",
        height: "40px",
        minWidth: "150px",
        outline: isSelected ? "1px solid" : "none",
        outlineColor: "blue.default",
        backgroundColor: isSelected ? "blue.light" : "grey.ultralight",
        position: "sticky",
        left: 0,
        zIndex: "level2",
        "&:hover": {
            backgroundColor: "blue.light",
        },
    })
);
