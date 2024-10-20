import * as Sentry from "@sentry/browser";

import {SentryApiKey, CommitHash} from "../constants/constants";

function setup() {
    if (import.meta.env.MODE === "e2e") {
        return;
    }

    Sentry.init({
        dsn: SentryApiKey,
        environment: import.meta.env.MODE.toUpperCase(),
        ignoreErrors: [
            // Network errors such as going offline or being blocked by a proxy
            "Failed to fetch",
            "NetworkError when attempting to fetch resource",
            // Random plugins/extensions
            "top.GLOBALS",
        ],
        denyUrls: [
            // Chrome extensions
            /extensions\//i,
            /^chrome:\/\//i,
        ],
        release: CommitHash ?? undefined,

        // Add the sessionRewind url to the event
        beforeSend(event) {
            const sessionRewindUrl = window.sessionRewind?.getSessionUrl();
            if (sessionRewindUrl && event?.extra?.["SessionRewind"]) {
                event.extra["SessionRewind"] = sessionRewindUrl;
                return event;
            } else {
                return event;
            }
        },
    });
}

function setupUser(userPk: number) {
    Sentry.setUser({id: userPk.toString()});
}

function cleanup() {
    Sentry.setUser(null);
}

export const monitoringService = {
    setup,
    setupUser,
    cleanup,
};
