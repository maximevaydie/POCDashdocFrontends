import {t} from "@dashdoc/web-core";

/**
 * @param title
 * @returns a short version of the title
 * @example
 *  "Atlantique Transport" => "AT"
 *  "JPB" => "JP"
 *  "" => "ND"
 */
export function getShortTitle(title: string): string {
    // Init value to avoid corner cases.
    let shortTitle = t("common.notDefinedShort");
    if (!title) {
        return shortTitle;
    }

    // if the title is already short enough, return it
    if (title.length <= 2) {
        return title;
    }

    // try to take the first letter of each word
    const firstWordChars = title.match(/\b(\w)/g);
    if (firstWordChars !== null && firstWordChars.length >= 2) {
        const [first, second] = firstWordChars;
        return `${first}${second}`;
    }

    // try to take the first 2 capital letters
    const onlyCapitalChars = title.match(/[A-Z]/g);
    if (onlyCapitalChars !== null && onlyCapitalChars.length >= 2) {
        const [first, second] = onlyCapitalChars;
        return `${first}${second}`;
    }

    // if all else fails, take the first 2 chars
    const [first, second] = title;
    return `${first}${second}`;
}

function hashCode(input: string | number) {
    let hash = 0;
    const str = input.toString();

    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function pickColor(str: string | number, saturation: number, luminance: number) {
    return `hsl(${hashCode(str) % 360}, ${saturation}%, ${luminance}%)`;
}

/**
 * Generate a foreground and background color based on the input string or number.
 * @param input string or number
 * @returns {background: string, foreground: string} hsl colors
 */
export function generateColors(input: string | number) {
    return {background: pickColor(input, 80, 85), foreground: pickColor(input, 100, 15)};
}
