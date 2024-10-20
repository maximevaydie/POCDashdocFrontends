import {t} from "@dashdoc/web-core";
import {Button, theme} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FC} from "react";

import {SendInvoiceReminderModal} from "app/taxation/invoicing/features/invoice/actions/send-reminder/SendInvoiceReminderModal";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

export const SendInvoiceReminderActionButton: FC<{invoice: Invoice}> = ({invoice}) => {
    const [showInvoiceReminderModal, openInvoiceReminderModal, closeInvoiceReminderModal] =
        useToggle(false);
    return (
        <>
            <Button
                data-testid="send-invoice-reminder-button"
                variant="plain"
                onClick={openInvoiceReminderModal}
                color={`${theme.colors.grey.ultradark} !important`}
                width={"100%"}
                justifyContent={"flex-start"}
            >
                {t("common.sendInvoiceReminder")}
            </Button>
            {showInvoiceReminderModal && (
                <SendInvoiceReminderModal invoice={invoice} onClose={closeInvoiceReminderModal} />
            )}
        </>
    );
};
