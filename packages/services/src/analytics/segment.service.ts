import {Logger} from "@dashdoc/web-core";
import {ManagerMe} from "dashdoc-utils";
import omit from "lodash.omit";

import {libService} from "./lib.service";
import {AnalyticsEvent} from "./types";

const ANONYMOUS_USER_ID = "fake user for anonymous events";

/**
 * We use a singleton to store the user id because:
 * the window.analytics.identify function is asynchronous and we can't trust
 * window.analytics.user?.().id?.() to retrieve the user id.
 */
let userIdSingleton: string | null = null;

async function setup(manager: ManagerMe) {
    if (!["prod", "staging"].includes(import.meta.env.MODE)) {
        return;
    }
    const user = manager.user;
    const newUserId = String(user.pk);
    userIdSingleton = newUserId;
    // Segments' analytics module is loaded asynchronously by the html
    // so we need to wait for it to be ready
    await libService.waitingFor(() => "analytics" in window);

    // Here we identify the user with the minimum of data.
    // All the other metadata are send through the backend, see
    // `update_users_and_companies_for_analytics` task.
    await window.analytics.identify(newUserId);
}

function cleanup() {
    window.analytics?.reset();
    userIdSingleton = ANONYMOUS_USER_ID;
}

async function sendEvent(event: AnalyticsEvent, properties: {[key: string]: unknown}) {
    const environment = import.meta.env.MODE;
    if ("user id" in properties) {
        Logger.error(
            "Do not set `user id` in `properties`, it would duplicate already available information"
        );
    }

    const updatedProperties = {
        // 'user id' is set automatically when calling `analytics.track` (it was bound with `analytics.identify`).
        ...omit(properties, "user id"),
        environment,
    };

    if ((environment === "prod" || environment === "staging") && window.analytics) {
        // If there is no userId, we send a fake one to segment
        // Otherwise we pay for one user for each anonymous event
        const currentIdentify = window.analytics.user?.().id?.();
        if (userIdSingleton && userIdSingleton === currentIdentify) {
            await window.analytics.track(event, updatedProperties);
        } else if (userIdSingleton /* and no currentIdentify */) {
            // Should not happen, but we never know
            await window.analytics.identify(userIdSingleton);
            await window.analytics.track(event, updatedProperties);
        } else {
            await window.analytics.identify(ANONYMOUS_USER_ID);
            await window.analytics.track(event, updatedProperties);
        }
    }
    Logger.log("[Analytics event]", event, "[Properties]", updatedProperties);
}

export const segmentService = {
    sendEvent,
    setup,
    cleanup,
};
