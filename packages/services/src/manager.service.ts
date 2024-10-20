import {t} from "@dashdoc/web-core";
import {Manager, ManagerRole} from "dashdoc-utils";

import {GROUP_VIEW_PATH} from "../constants/constants";

/**
 * @deprecated should be avoided the most possible to replay the expected behavior in moderation dashboard workflow.
 */
function isDashdocStaff(manager: Manager | null): boolean {
    return !!manager?.user?.is_staff;
}

function isGroupView(manager: Manager | null) {
    return (
        !!manager &&
        manager.role === ManagerRole.GroupViewAdmin &&
        !!location.href.match(GROUP_VIEW_PATH)
    );
}

function hasAtLeastGroupAdminRole(manager: Manager | null) {
    return !!manager && [ManagerRole.GroupViewAdmin].includes(manager.role);
}

function hasAtLeastAdminRole(manager: Manager | null): boolean {
    return !!manager && [ManagerRole.Admin, ManagerRole.GroupViewAdmin].includes(manager.role);
}

function hasAtLeastUserRole(manager: Manager | null): boolean {
    return (
        !!manager &&
        [ManagerRole.User, ManagerRole.Admin, ManagerRole.GroupViewAdmin].includes(manager.role)
    );
}

function hasAtLeastReadOnlyRole(manager: Manager | null): boolean {
    return (
        !!manager &&
        [
            ManagerRole.ReadOnly,
            ManagerRole.User,
            ManagerRole.Admin,
            ManagerRole.GroupViewAdmin,
        ].includes(manager.role)
    );
}

function isReadOnly(manager: Manager | null) {
    return !manager || manager.role === ManagerRole.ReadOnly;
}

const getRoleLabels = (includeGroupViewAdmin = true) => {
    let labels: Record<string, string> = {
        [ManagerRole.ReadOnly]: t("settings.readOnlyRole"),
        [ManagerRole.User]: t("settings.userRole"),
        [ManagerRole.Admin]: t("settings.adminRole"),
    };

    if (includeGroupViewAdmin) {
        labels[ManagerRole.GroupViewAdmin] = t("settings.groupAdminRole");
    }

    return labels;
};

function getSidebarRoleLabel(manager: Pick<Manager, "role"> | null): string {
    switch (manager?.role) {
        case ManagerRole.User:
            return t("sidebar.role-user");
        case ManagerRole.Admin:
            return t("sidebar.role-admin");
        case ManagerRole.GroupViewAdmin:
            return t("sidebar.role-group_admin");
        default:
            return t("sidebar.role-readonly");
    }
}

export const managerService = {
    hasTmsAccess: hasAtLeastReadOnlyRole,
    isReadOnly,
    isGroupView,
    getRoleLabels,
    hasAtLeastGroupAdminRole,
    hasAtLeastReadOnlyRole,
    hasAtLeastUserRole,
    hasAtLeastAdminRole,
    getSidebarRoleLabel,
    isDashdocStaff,
};
