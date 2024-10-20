import {Button, Icon, ToastContainer} from "@dashdoc/web-ui";
import {AccountType} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";

import {ModerationAccountTypeModal} from "./moderation-account-type-modal";

export type ModerationSetAccountTypeProps = {
    companyPk: number;
    companyName: string;
    accountType: AccountType;
    chargebeeStatus: string;
};

export const ModerationSetAccountType: FunctionComponent<ModerationSetAccountTypeProps> = ({
    companyPk,
    companyName,
    accountType,
    chargebeeStatus,
}) => {
    const [showAccountTypeModal, setShowAccountTypeModal] = useState<boolean>(false);

    return (
        <>
            <Button
                variant="plain"
                onClick={() => setShowAccountTypeModal(true)}
                data-testid="edit-account-type-popover-open-button"
                paddingX={1}
                paddingY={0}
            >
                <Icon name="user" />
                &nbsp;Change account type
            </Button>
            {showAccountTypeModal && (
                <ModerationAccountTypeModal
                    companyPk={companyPk}
                    companyName={companyName}
                    accountType={accountType}
                    chargebeeStatus={chargebeeStatus}
                    onClose={() => setShowAccountTypeModal(false)}
                />
            )}
            <ToastContainer />
        </>
    );
};
