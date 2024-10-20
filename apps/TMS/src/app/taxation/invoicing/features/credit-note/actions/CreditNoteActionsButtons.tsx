import {guid} from "@dashdoc/core";
import {getConnectedManager, ModerationButton, useSelector} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, Popover, theme} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {DeleteButton} from "app/taxation/invoicing/features/credit-note/actions/DeleteButton";
import {FinalizeButton} from "app/taxation/invoicing/features/credit-note/actions/FinalizeButton";
import {MarkNotPaidButton} from "app/taxation/invoicing/features/credit-note/actions/MarkNotPaidButton";
import {MarkPaidButton} from "app/taxation/invoicing/features/credit-note/actions/MarkPaidButton";
import {CreditNote} from "app/taxation/invoicing/types/creditNote.types";

import {CreditNoteAction, creditNoteActionsService} from "./creditNoteActions.service";

type InvoiceDetailHeaderProps = {
    creditNote: CreditNote;
    fromSharing: boolean;
    onDelete?: () => void;
    setIsLoading?: () => void;
    setIsNotLoading?: () => void;
};
export const CreditNoteActionsButtons: React.FunctionComponent<InvoiceDetailHeaderProps> = ({
    creditNote,
    fromSharing,
    onDelete,
    setIsLoading,
    setIsNotLoading,
}) => {
    const [key, setKey] = useState("_");
    const clearPopoverState = () => setKey(guid());
    const mainActions = creditNoteActionsService.getMainActions(creditNote.status, fromSharing);
    const extraActions = creditNoteActionsService.getExtraActions(creditNote.status, fromSharing);
    const manager = useSelector(getConnectedManager);
    return (
        <>
            <Flex
                alignItems="baseline"
                flexWrap="wrap"
                justifyContent="flex-end"
                marginLeft="auto"
            >
                <Flex alignItems="center" justifyContent="flex-end">
                    <Box mr={1}>
                        <ModerationButton
                            manager={manager}
                            path={`credit-notes/${creditNote.uid}/`}
                        />
                    </Box>
                    {extraActions.length > 0 && (
                        <Popover placement="bottom-end" key={key}>
                            <Popover.Trigger>
                                <Button variant="secondary" data-testid="more-credit-note-actions">
                                    {" "}
                                    {t("common.moreActions")}
                                    <Icon name="arrowDown" ml={2} />
                                </Button>
                            </Popover.Trigger>
                            <Popover.Content>
                                {extraActions.map((action) => getActionButton(action))}
                            </Popover.Content>
                        </Popover>
                    )}

                    {mainActions.map((action) => getActionButton(action))}
                </Flex>
            </Flex>
        </>
    );

    function getActionButton(action: CreditNoteAction) {
        switch (action) {
            case "finalize":
                return (
                    <FinalizeButton
                        key="finalize-credit-note-button"
                        invoicingDate={creditNote.invoicing_date}
                        dueDate={creditNote.due_date}
                        creditNoteUid={creditNote.uid}
                        generatedFromInvoice={creditNote.generated_from}
                    />
                );
            case "markPaid":
                return (
                    <MarkPaidButton
                        creditNoteUid={creditNote.uid}
                        key="mark-credit-note-paid-button"
                    />
                );
            case "markNotPaid":
                return (
                    <MarkNotPaidButton
                        creditNoteUid={creditNote.uid}
                        key="mark-credit-note-not-paid-button"
                    />
                );
            case "openInNewTab":
                return (
                    <Button
                        key="open-credit-note-in-new-tab-button"
                        data-testid="open-credit-note-in-new-tab-button"
                        name="openInNewTab"
                        onClick={() =>
                            window.open(`/app/credit-notes/${creditNote.uid}`, "_blank")
                        }
                        variant="plain"
                        color={`${theme.colors.grey.ultradark} !important`}
                        width={"100%"}
                        justifyContent={"flex-start"}
                    >
                        {t("invoiceDetails.openInFullPage")}
                    </Button>
                );
            case "delete":
                return (
                    <DeleteButton
                        key="delete-draft-credit-note-button"
                        creditNoteUid={creditNote.uid}
                        onCreditNoteDeleted={onDelete}
                        setIsLoading={setIsLoading}
                        setIsNotLoading={setIsNotLoading}
                        onClose={clearPopoverState}
                    />
                );
            default:
                return null;
        }
    }
};
