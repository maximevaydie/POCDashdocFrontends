import {Company, ManagerMe} from "dashdoc-utils";

import {ScreebAppId} from "../../constants/constants";
import {apiService} from "../api.service";
import {storeService} from "../store.service";

import {libService} from "./lib.service";

async function setup(manager: ManagerMe, company: Company) {
    // Screeb module is loaded asynchronously by the html
    // so we need to wait for it to be ready
    await libService.waitingFor(() => "Screeb" in window);

    const user = manager.user;
    // TODO : we should not fetch the feature flags here, it's already done in the redux store !
    const featuresFlagDict = await apiService.get("/feature-flags/", {apiVersion: "web"});

    const featureFlags = Object.entries(featuresFlagDict).reduce(
        (features, [FeatureFlagName, FeatureFlagValue]) => {
            return {
                ...features,
                [`feature_flag_${FeatureFlagName}`]: FeatureFlagValue,
            };
        },
        {}
    );
    window.Screeb("init", ScreebAppId, {
        identity: {
            id: String(user.pk),
            properties: {
                firstname: user.first_name,
                lastname: user.last_name,
                plan: company?.subscription_access?.name,
                last_seen_at: new Date(),
                authenticated: true,
                user_id: String(user.pk),
                username: user.username,
                user_persona: manager.personas,
                company_name: company.name,
                company_id: String(company.pk),
                company_type: company.settings?.default_role,
                invited_by: company.managed_by_name,
                company_status: company.account_type,
                company_role: company.settings?.default_role,
                ...featureFlags,
            },
        },
    });
}

function cleanup() {
    // fix https://dashdoc.sentry.io/issues/4216195421/
    // should not call identity.reset if not authenticated
    if (storeService.getState().auth.token) {
        window.Screeb?.("identity.reset");
    }
}

export const screebService = {
    setup,
    cleanup,
};
