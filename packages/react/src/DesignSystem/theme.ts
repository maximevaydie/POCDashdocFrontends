// Please apply changes from this file to the pdf/src/ui-kit/theme.ts file.
const fonts = {
    primary: "'Open Sans', sans-serif",
    monospace: "Menlo, Monaco, Consolas, 'Courier New', monospace",
    handwritten: "'Grape Nuts','Brush Script MT'",
};
const fontSizes = [10, 12, 14, 16, 20, 24, 28, 36];
const lineHeights = ["16px", "24px", "32px", "36px", "40px", "65px"];
const space = [0, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 72, 80];
const borderRadiuses = [0, 4, 8, 16, 32, 64, 128, 256, 512];
const shadows = {
    small: `0px 1px 4px rgba(33, 43, 54, 0.1);`,
    medium: `0px 2px 16px rgba(33, 43, 54, 0.08);`,
    large: `0px 4px 12px rgba(33, 43, 54, 0.1);`,
};

export const screenSizes = {
    sm: 640,
    md: 832,
    lg: 1024,
} as const;
const breakpoints = Object.values(screenSizes).map((size) => size + "px");

const zIndices = {
    level0: 0,
    level1: 1,
    level2: 2,
    level3: 3,
    filteringBar: 5,
    loadingOverlay: 10,
    dropdown: 11,
    navbar: 100,
    modal: 1040,
    insideModal: 1100,
    topbar: 2000,
    dndGhost: 9999,
    moderationPortal: 9999,
    networkMap: 10000,
    networkMap1: 10001,
    networkMap2: 10002,
    networkMap3: 10003,
    networkMap4: 10004,
    networkMap5: 10005,
    networkMap6: 10006,
    networkMap7: 10007,
    networkMap8: 10008,
    networkMap20: 10020,
    tooltip: 999999999,
};

// If you update colors, please apply the same changes to the colors in the backend/dashdoc/platform/internals/generic/colors.py file.
const colors = {
    neutral: {
        transparentBlack: "#00000080",
        lighterTransparentBlack: "#00000033",
    },
    grey: {
        white: "#ffffff",
        ultralight: "#F9FAFB",
        lighter: "#F1F5F8",
        light: "#DFE7ED",
        default: "#8EA1B1",
        dark: "#606E7C",
        ultradark: "#27333F",
    },
    blue: {
        ultralight: "#EDF1FF",
        light: "#D3DCFD",
        default: "#4B71FA",
        dark: "#223473",
    },
    cyan: {
        ultralight: "#E5F9FF",
        light: "#BEEEFD",
        default: "#25B9E6",
        dark: "#187C9A",
    },
    turquoise: {
        ultralight: "#E3F7F7",
        light: "#B9E9E9",
        default: "#12B2B2",
        dark: "#237373",
    },
    green: {
        ultralight: "#E8FAEA",
        light: "#C0EBC6",
        default: "#17AD5D",
        dark: "#1B6B40",
    },
    yellow: {
        ultralight: "#FFF7DB",
        light: "#FDE69F",
        default: "#FAC938",
        dark: "#8E711A",
    },
    orange: {
        ultralight: "#FFEDDB",
        light: "#FFD5AD",
        default: "#FA9538",
        dark: "#9B5D23",
    },
    red: {
        ultralight: "#FCEDEC",
        light: "#F7C3C0",
        default: "#E54D45",
        dark: "#B22119",
    },
    purple: {
        ultralight: "#F6EFFF",
        light: "#E5D3FD",
        default: "#A165F4",
        dark: "#6333AA",
    },
    pink: {
        ultralight: "#FFEBF4",
        light: "#FDBED8",
        default: "#F0619D",
        dark: "#AA3364",
    },
    /**
     * All following colors are alias.
     */
    pool: {
        1: "blue.default",
        2: "yellow.default",
        3: "cyan.default",
        4: "orange.default",
        5: "yellow.default",
        6: "red.default",
        7: "green.default",
        8: "pink.default",
        9: "grey.default",
        10: "purple.default",
    },
};

// Refs resolution
colors.pool[1] = colors.blue.default;
colors.pool[2] = colors.yellow.default;
colors.pool[3] = colors.cyan.default;
colors.pool[4] = colors.orange.default;
colors.pool[5] = colors.turquoise.default;
colors.pool[6] = colors.red.default;
colors.pool[7] = colors.green.default;
colors.pool[8] = colors.pink.default;
colors.pool[9] = colors.grey.default;
colors.pool[10] = colors.purple.default;

export const theme = {
    fonts,
    fontSizes,
    lineHeights,
    breakpoints,
    space,
    colors,
    shadows,
    radii: borderRadiuses,
    zIndices,
} as const;
