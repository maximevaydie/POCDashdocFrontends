/// <reference types="intercom-web" />
import {Logger} from "@dashdoc/web-core";
import {Company, ManagerMe} from "dashdoc-utils";

function setup(settings?: {manager: ManagerMe; company: Company}) {
    Logger.log("Help setup");
    if (settings) {
        const {manager, company} = settings;
        const user = manager.user;
        const fullName = `${user.first_name} ${user.last_name}`;
        const role = company.settings?.default_role;

        // Update Intercom info
        Intercom("update", {
            user_id: String(user.pk),
            user_hash: manager.intercom_hash,
            name: fullName,
            email: user.email,
            phone: manager.phone_number,
            signed_up_at: user.date_joined
                ? Math.floor(new Date(user.date_joined).getTime() / 1000)
                : undefined,
            username: user.username,
            company: {
                id: String(company.pk),
                name: company.name,
                remote_created_at: company.created
                    ? Math.floor(new Date(company.created).getTime() / 1000)
                    : undefined,
                plan: company?.subscription_access?.name || undefined,
                company_type: role,
            },
            user_persona: manager?.personas?.[0],
        });
    } else {
        Intercom("update", {
            user_id: undefined,
            user_hash: undefined,
            name: undefined,
            email: undefined,
            phone: undefined,
            signed_up_at: undefined,
            username: undefined,
            company: undefined,
            user_persona: undefined,
        });
    }
}

function cleanup() {
    Logger.log("Help cleanup");
    Intercom("shutdown");
}

export const helpService = {
    setup,
    cleanup,
};
