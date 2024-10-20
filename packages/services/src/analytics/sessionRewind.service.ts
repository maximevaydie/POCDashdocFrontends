import {Company, ManagerMe} from "dashdoc-utils";

function setup(manager: ManagerMe, company: Company) {
    const user = manager.user;
    const fullName = `${user.first_name} ${user.last_name}`;
    const role = company.settings?.default_role;

    window.sessionRewind?.identifyUser({
        userId: String(user.pk),
        displayName: fullName,
        email: user.email,
        companyId: String(company.pk),
        companyName: company.name,
        companyStatus: company.account_type,
        managedByName: company.managed_by_name,
        role: role,
        personas: manager.personas,
    });

    window.sessionRewind?.startSession();
}

function cleanup() {
    // We voluntarily don't clean SessionRewind info in order to keep session as a whole
}

export const sessionRewindService = {
    setup,
    cleanup,
};
