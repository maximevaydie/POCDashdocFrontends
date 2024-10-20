import {apiService} from "@dashdoc/web-common";
import {PageReloadedAfterSwitchModal, SwitchCompanyDemoModal} from "@dashdoc/web-common";
import {history} from "@dashdoc/web-core";
import {Manager, useToggle} from "dashdoc-utils";
import React from "react";
import {useLocation} from "react-router";

import {NoTmsAccessModal} from "app/common/screen/no-tms-access/NoTmsAccessModal";
import {InvitedCompanySignupModal} from "app/features/company/contact/invitation/InvitedCompanySignupModal";
import {useHasTmsAccess} from "app/hooks/useIsNoTmsAccess";

const RELOAD_AFTER_COMPANY_SWITCH_PARAM = "reload_after_company_switch";
const SHOW_MULTI_ACCOUNT_HELP_PARAM = "show_multi_account_help_popup";
const CONTACT_INVITATION_UID_PARAM = "contact_invitation_uid";

export const Modals = ({connectedManager}: {connectedManager: Manager}) => {
    const [showFinishSignupModal, , closeFinishSignupModal] = useToggle(
        shouldShowFinishSignupModal()
    );
    const [showSwitchCompanyDemoModal, openSwitchCompanyDemoModal, closeSwitchCompanyDemoModal] =
        useToggle();
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const [showPageReloadedAfterSwitchPopup, , closePageReloadedAfterSwitchPopup] = useToggle(
        urlParams.get(RELOAD_AFTER_COMPANY_SWITCH_PARAM) === "true"
    );
    const hasTmsAccess = useHasTmsAccess();

    return (
        <>
            {showFinishSignupModal && (
                <InvitedCompanySignupModal onFinished={handleSignupFinish} />
            )}
            {showSwitchCompanyDemoModal && (
                <SwitchCompanyDemoModal onClose={handleSwitchCompanyModalClose} />
            )}
            {showPageReloadedAfterSwitchPopup && (
                <PageReloadedAfterSwitchModal onClose={closePageReloadedAfterSwitchPopup} />
            )}
            {!hasTmsAccess && <NoTmsAccessModal />}
        </>
    );

    function handleSignupFinish() {
        removeSearchParam(RELOAD_AFTER_COMPANY_SWITCH_PARAM);
        closeFinishSignupModal();

        if (urlParams.get(SHOW_MULTI_ACCOUNT_HELP_PARAM) === "true") {
            openSwitchCompanyDemoModal();
        }
        apiService.post("/managers/signup-success/", {
            contact_invitation_uid: urlParams.get(CONTACT_INVITATION_UID_PARAM),
        });
    }

    function handleSwitchCompanyModalClose() {
        removeSearchParam(SHOW_MULTI_ACCOUNT_HELP_PARAM);
        closeSwitchCompanyDemoModal();
    }

    function shouldShowFinishSignupModal() {
        // Check if we have a manager user
        if (!connectedManager.user) {
            return false;
        }

        // Check if the user is from staff
        if (connectedManager.user.is_staff) {
            return false;
        }

        // Check if the user has usable password
        if (!connectedManager.user?.has_usable_password) {
            return true;
        }

        // Check if the user has personas
        if (!connectedManager.personas) {
            return true;
        }

        return false;
    }

    /**
     * Remove a search param from the URL (if it exists)
     */
    function removeSearchParam(paramKey: string) {
        if (urlParams.has(paramKey)) {
            urlParams.delete(paramKey);
            history.replace({
                search: urlParams.toString(),
            });
        }
    }
};
