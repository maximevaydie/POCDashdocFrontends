import {Company, Manager, ManagerMe} from "dashdoc-utils";
import {useEffect} from "react";
import {useHistory} from "react-router";

import {analyticsService} from "../services/analytics/analytics.service";
import {AnalyticsEvent} from "../services/analytics/types";

/**
 * This hook is used to setup the tracking part when the user is logged in.
 */
export function useSetupTracking(manager: Manager, company: Company) {
    const history = useHistory();

    useEffect(() => {
        const initPromise = handleInit();
        const unregisterCallback = history.listen(async () => {
            await initPromise;
            sendAnalyticsEventOnChangePage();
        });

        return unregisterCallback;

        // We assume that, when the user or company changes, this hook is unmounted and the
        // analytics are cleaned up
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return;

    async function handleInit() {
        // The analytics setup is async, so we need to wait for it to be done before sending events!
        await analyticsService.setup(
            manager as ManagerMe /* TODO why not set deleted in the type?*/,
            company
        );
        await sendAnalyticsEventOnChangePage();
    }

    async function sendAnalyticsEventOnChangePage() {
        const path = history.location.pathname + history.location.search;
        await analyticsService.sendEvent(AnalyticsEvent.userOpenedPage, {
            "company id": company.pk,
            "is staff": manager.user.is_staff,
            "page url": path,
        });
    }
}
