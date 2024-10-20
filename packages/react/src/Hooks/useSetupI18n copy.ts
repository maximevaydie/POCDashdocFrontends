import {useTimezone} from "@dashdoc/web-common";
import {BuildConstants, cookiesService} from "@dashdoc/web-core";
import {setupI18n} from "@dashdoc/web-core";
import {Manager} from "dashdoc-utils";
import {useEffect} from "react";

/**
 * This hook is used to setup the i18n part when the user is logged in.
 */
export function useSetupI18n(manager?: Manager) {
    const language = manager?.language ?? BuildConstants.language;
    const timezone = useTimezone();

    useEffect(() => {
        if (cookiesService.getCookie("django_language") !== language) {
            cookiesService.setCookie("django_language", language, 365);
        }
        setupI18n(language, timezone);
    }, [language, timezone]);

    return;
}
