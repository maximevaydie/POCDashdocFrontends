import {Box, theme, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";

export const Th = styled(Box.withComponent("th"))<{
    isClickable?: boolean;
    isSelected?: boolean;
}>(({isClickable, isSelected}) =>
    themeAwareCss({
        cursor: isClickable ? "pointer" : "default",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "grey.ultralight",
        textAlign: "right",
        padding: "10px",
        height: "40px",
        minWidth: "150px",
        outline: isSelected ? "1px solid" : "none",
        outlineColor: "blue.default",
        backgroundColor: isSelected ? "blue.light" : "grey.light",
        position: "sticky",
        top: 0,
        zIndex: "level2",
        border: `1px solid ${theme.colors.grey.ultralight} !important`, // bypass bootstrap css
        "&:hover": {
            backgroundColor: "blue.light",
        },
        "&:first-of-type": {
            position: "sticky",
            left: 0,
            zIndex: "level3",
        },
    })
);
