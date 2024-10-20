import {managerService, getConnectedManager} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import {Trucker, useToggle} from "dashdoc-utils";
import React, {useMemo} from "react";

import SendTruckersInviteCodeModal from "app/features/settings/truckers/send-truckers-invite-codes-modal";
import {useSelector} from "app/redux/hooks";
import {RootState} from "app/redux/reducers/index";

type Props = {
    allTruckersSelected: boolean;
    currentSelection: string[];
    truckers: Trucker[];
    onInviteSent: () => void;
    totalCount: number;
};

export function SendInviteCodeButton({
    truckers,
    allTruckersSelected,
    currentSelection,
    onInviteSent,
    totalCount,
}: Props) {
    const [isSendInviteCodeModalOpen, openSendInviteCodeModal, closeSendInviteCodeModal] =
        useToggle();
    const shouldSMSButtonBeDisplayed = useMemo(() => {
        const truckersWithPhoneNumbers = truckers?.filter(
            // @ts-ignore All our search / selections selector assume the identifier is of type `string`
            (trucker) => trucker.phone_number && currentSelection.includes(trucker.pk)
        );

        if (allTruckersSelected || truckersWithPhoneNumbers?.length) {
            return true;
        }
        return false;
    }, [allTruckersSelected, currentSelection, truckers]);
    const hasEditAccess = useSelector((state: RootState) =>
        managerService.hasAtLeastUserRole(getConnectedManager(state))
    );

    if (!hasEditAccess || !shouldSMSButtonBeDisplayed) {
        return null;
    }

    return (
        <>
            <IconButton
                ml={2}
                mr={2}
                key="textmessage"
                name="textMessage"
                onClick={openSendInviteCodeModal}
                label={t("settings.sendInviteCodeViaSms")}
            />

            {isSendInviteCodeModalOpen && (
                <SendTruckersInviteCodeModal
                    onInviteCodesSent={() => {
                        closeSendInviteCodeModal();
                        onInviteSent();
                    }}
                    selectedTruckers={currentSelection.reduce(
                        (acc, uid) => {
                            acc[uid] = true;
                            return acc;
                        },
                        {} as Record<string, boolean>
                    )}
                    allTruckersCount={totalCount}
                    allTruckersSelected={allTruckersSelected}
                    onClose={closeSendInviteCodeModal}
                />
            )}
        </>
    );
}
