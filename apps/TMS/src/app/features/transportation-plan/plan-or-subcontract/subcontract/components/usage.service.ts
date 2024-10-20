import {Usage} from "dashdoc-utils";

// Warn the user when the limit will be reached
const THRESHOLD_WARN = 5;

function limitReached(usage: Usage) {
    const {limit, used} = usage;
    if (limit === null) {
        return false;
    }
    const remaining = limit - used;
    return remaining <= 0;
}

function limitWillBeReached(usage: Usage) {
    const {limit, used} = usage;
    if (limit === null) {
        return false;
    }
    const remaining = limit - used;
    return remaining <= THRESHOLD_WARN;
}

export const usageService = {limitWillBeReached, limitReached};
