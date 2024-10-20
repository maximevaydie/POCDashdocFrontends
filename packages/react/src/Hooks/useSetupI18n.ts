import {cookiesService} from "@dashdoc/web-core";
import {setupI18n} from "@dashdoc/web-core";
import {Manager} from "dashdoc-utils";
import {useEffect} from "react";

import {useTimezone} from "./useTimezone";

/**
 * This hook is used to setup the i18n part when the user is logged in.
 */
export function useSetupI18n(manager: Manager) {
    const language = manager.language ?? "en";
    const timezone = useTimezone();

    useEffect(() => {
        if (cookiesService.getCookie("django_language") !== manager.language) {
            cookiesService.setCookie("django_language", manager.language, 365);
            window.location.reload();
        }
        setupI18n(language, timezone);
        // We assume that the language and timezone are not going to change during the app lifecycle
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return;
}
