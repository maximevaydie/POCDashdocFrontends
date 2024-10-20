import {theme} from "@dashdoc/web-ui";

import {BrickPickerStyle, BrickStyle} from "./types";

const emptyStyle: BrickStyle = {
    defaultStyle: {backgroundColor: theme.colors.grey.light, borderRadius: "4px"},
    hoverStyle: {backgroundColor: theme.colors.grey.default, borderRadius: "4px"},
};
const emptySelectedStyle: BrickStyle = {
    defaultStyle: {
        background: `repeating-linear-gradient(-50deg, ${theme.colors.grey.white}, ${theme.colors.grey.white} 6px, ${theme.colors.grey.light} 6px, ${theme.colors.grey.light} 12px)`,
        border: `1px solid ${theme.colors.grey.default}`,
        borderRadius: "4px",
    },
    hoverStyle: {
        background: `repeating-linear-gradient(-50deg, ${theme.colors.grey.light}, ${theme.colors.grey.light} 6px, ${theme.colors.grey.default} 6px, ${theme.colors.grey.default} 12px)`,
        borderRadius: "4px",
    },
};
const fullStyle: BrickStyle = {
    defaultStyle: {backgroundColor: theme.colors.blue.light, borderRadius: "4px"},
    hoverStyle: {backgroundColor: theme.colors.blue.dark, borderRadius: "4px"},
};
const fullSelectedStyle: BrickStyle = {
    defaultStyle: {
        background: `repeating-linear-gradient(-50deg, ${theme.colors.red.ultralight}, ${theme.colors.red.ultralight} 6px, ${theme.colors.red.light} 6px, ${theme.colors.red.light} 12px)`,
        border: `1px solid ${theme.colors.red.default}`,
        borderRadius: "4px",
    },
    hoverStyle: {
        background: `repeating-linear-gradient(-50deg, ${theme.colors.red.light}, ${theme.colors.red.light} 6px, ${theme.colors.red.default} 6px, ${theme.colors.red.default} 12px)`,
        borderRadius: "4px",
    },
};

export const defaultBrickStyles: BrickPickerStyle = {
    empty: emptyStyle,
    emptySelected: emptySelectedStyle,
    full: fullStyle,
    fullSelected: fullSelectedStyle,
    m: 2,
    height: "24px",
};
