export const BADGE_COLOR_VARIANTS = {
    neutral: {
        backgroundColor: "grey.light",
        color: "grey.ultradark",
    },
    blue: {
        backgroundColor: "blue.ultralight",
        color: "blue.dark",
    },
    success: {
        backgroundColor: "green.ultralight",
        color: "green.dark",
    },
    warning: {
        backgroundColor: "yellow.ultralight",
        color: "yellow.dark",
    },
    error: {
        backgroundColor: "red.ultralight",
        color: "red.dark",
    },
    purple: {
        backgroundColor: "purple.ultralight",
        color: "purple.dark",
    },
    turquoise: {
        backgroundColor: "turquoise.ultralight",
        color: "turquoise.dark",
    },
    pink: {
        backgroundColor: "pink.ultralight",
        color: "pink.dark",
    },
    neutralDark: {
        backgroundColor: "grey.dark",
        color: "grey.white",
    },
    blueDark: {
        backgroundColor: "blue.default",
        color: "grey.white",
    },
    errorDark: {
        backgroundColor: "red.default",
        color: "grey.white",
    },
    purpleDark: {
        backgroundColor: "purple.default",
        color: "grey.white",
    },
    pinkLight: {
        backgroundColor: "pink.default",
        color: "grey.white",
    },
    none: {
        backgroundColor: undefined,
        color: undefined,
    },
};

export type BadgeColorVariant = keyof typeof BADGE_COLOR_VARIANTS;

export const BADGE_SIZE_VARIANTS = {
    small: {
        fontSize: 0,
        paddingX: 2,
        paddingY: "2px",
    },
    medium: {
        fontSize: 1,
        paddingX: 3,
        paddingY: 1,
    },
};
