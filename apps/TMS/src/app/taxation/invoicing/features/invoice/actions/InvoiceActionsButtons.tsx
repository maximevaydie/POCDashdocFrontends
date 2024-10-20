import {guid} from "@dashdoc/core";
import {
    getCompanySetting,
    getConnectedManager,
    ModerationButton,
    useDispatch,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, Popover, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {MarkInvoiceFinalModal} from "app/features/pricing/invoices/actions/mark-invoice-final-modal";
import {MarkInvoicePaidModal} from "app/features/pricing/invoices/actions/MarkInvoicePaidModal";
import {TrackingInvoicePaymentFormType} from "app/features/pricing/invoices/TrackingInvoicePaymentForm";
import {fetchMarkInvoicePaid} from "app/redux/actions";
import {useSelector} from "app/redux/hooks";
import {formatTrackingInvoicePaymentPayload} from "app/services/invoicing/paymentMethod.service";
import {CreateCreditNoteActionButton} from "app/taxation/invoicing/features/invoice/actions/CreateCreditNoteActionButton";
import {DeleteActionButton} from "app/taxation/invoicing/features/invoice/actions/DeleteActionButton";
import {DuplicateActionButton} from "app/taxation/invoicing/features/invoice/actions/DuplicateActionButton";
import {ExportDocumentsActionButton} from "app/taxation/invoicing/features/invoice/actions/ExportDocumentsActionButton";
import {MarkNotFinalActionButton} from "app/taxation/invoicing/features/invoice/actions/MarkNotFinalActionButton";
import {MarkNotPaidActionButton} from "app/taxation/invoicing/features/invoice/actions/MarkNotPaidActionButton";
import {MarkPaidActionButton} from "app/taxation/invoicing/features/invoice/actions/MarkPaidActionButton";
import {SendInvoiceReminderActionButton} from "app/taxation/invoicing/features/invoice/actions/send-reminder/SendInvoiceReminderActionButton";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

import {InvoiceAction, invoiceActionsService} from "./invoiceActions.service";

type InvoiceDetailHeaderProps = {
    invoice: Invoice;
    fromSharing: boolean;
    onDeleteInvoice?: () => void;
    onCreateCreditNote?: (uid: string) => void;
    onDuplicateInvoice?: (uid: string) => void;
    setIsLoading?: () => void;
    setIsNotLoading?: () => void;
};
export const InvoiceActionsButtons: React.FunctionComponent<InvoiceDetailHeaderProps> = ({
    invoice,
    fromSharing,
    onDeleteInvoice,
    onCreateCreditNote,
    onDuplicateInvoice,
    setIsLoading,
    setIsNotLoading,
}) => {
    const dispatch = useDispatch();
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();
    const invoicePaymentSetting = useSelector((state) =>
        getCompanySetting(state, "invoice_payment")
    );

    const [key, setKey] = useState("_");

    const manager = useSelector(getConnectedManager);
    const clearPopoverState = () => setKey(guid());
    const [isOpenConfirmMarkFinalModal, openConfirmMarkFinalModal, closeConfirmMarkFinalModal] =
        useToggle(false);
    const [isOpenConfirmMarkPaidModal, openConfirmMarkPaidModal, closeConfirmMarkPaidModal] =
        useToggle(false);
    const mainActions = invoiceActionsService.getMainActions(invoice.status, fromSharing);
    const extraActions = invoiceActionsService.getExtraActions(
        invoice,
        fromSharing,
        hasDashdocInvoicingEnabled
    );
    const isEmptyBareInvoice = invoice.is_bare_invoice && invoice.lines.length === 0;

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
                        <ModerationButton manager={manager} path={`invoices/${invoice.uid}/`} />
                    </Box>
                    {extraActions.length > 0 && (
                        <Popover placement="bottom-end" key={key}>
                            <Popover.Trigger>
                                <Button variant="secondary" data-testid="more-invoice-actions">
                                    {t("common.moreActions")}
                                    <Icon name="arrowDown" ml={2} />
                                </Button>
                            </Popover.Trigger>
                            <Popover.Content>
                                {extraActions.map((action) => getActionButton(action, true))}
                            </Popover.Content>
                        </Popover>
                    )}
                    {mainActions.map((action) => getActionButton(action, false))}
                    {isOpenConfirmMarkFinalModal && (
                        <MarkInvoiceFinalModal
                            invoicingDate={invoice.invoicing_date}
                            dueDate={invoice.due_date}
                            selectedInvoicesQuery={{uid__in: invoice.uid}}
                            onClose={closeConfirmMarkFinalModal}
                        />
                    )}
                    {isOpenConfirmMarkPaidModal && (
                        <MarkInvoicePaidModal
                            debtorId={invoice.debtor.pk}
                            onSubmit={(values) => {
                                handleMarkInvoicePaid(values);
                                closeConfirmMarkPaidModal();
                            }}
                            onClose={closeConfirmMarkPaidModal}
                        />
                    )}
                </Flex>
            </Flex>
        </>
    );

    function getActionButton(action: InvoiceAction, fromMoreAction?: boolean) {
        switch (action) {
            case "sendReminder":
                return (
                    <SendInvoiceReminderActionButton
                        key="send-invoice-reminder-button"
                        invoice={invoice}
                    />
                );
            case "markFinal": {
                const buttonElement: JSX.Element = (
                    <Button
                        data-testid="mark-invoice-final-button"
                        key="mark-invoice-final-button"
                        ml={2}
                        onClick={openConfirmMarkFinalModal}
                        disabled={isEmptyBareInvoice}
                    >
                        {t("common.finalize")}
                    </Button>
                );
                if (isEmptyBareInvoice) {
                    return (
                        <TooltipWrapper
                            content={
                                <Text data-testid="cannot-finalize-empty-bare-invoice-helptext">
                                    {t("invoice.cannotFinalizeEmptyBareInvoice")}
                                </Text>
                            }
                        >
                            {buttonElement}
                        </TooltipWrapper>
                    );
                }
                return buttonElement;
            }
            case "markNotFinal":
                return (
                    <MarkNotFinalActionButton
                        key="mark-invoice-final-button"
                        invoiceUid={invoice.uid}
                    />
                );
            case "markPaid":
                return (
                    <MarkPaidActionButton
                        key="mark-invoice-paid-button"
                        onClick={handleOnClickMarkInvoiceActionButton}
                    />
                );
            case "markNotPaid":
                return (
                    <MarkNotPaidActionButton
                        invoiceUid={invoice.uid}
                        key="mark-invoice-not-paid-button"
                    />
                );
            case "exportDocuments":
                return (
                    <ExportDocumentsActionButton
                        key="export-invoice-documents-button"
                        invoiceUid={invoice.uid}
                        fromSharing={fromSharing}
                        onClose={fromMoreAction ? clearPopoverState : undefined}
                    />
                );
            case "createCreditNote":
                return (
                    <CreateCreditNoteActionButton
                        key="create-total-credit-note-button"
                        invoiceUid={invoice.uid}
                        onCreateCreditNote={onCreateCreditNote}
                    />
                );
            case "delete":
                return (
                    <DeleteActionButton
                        key="delete-invoice-button"
                        invoiceUid={invoice.uid}
                        onInvoiceDeleted={onDeleteInvoice}
                        setIsLoading={setIsLoading}
                        setIsNotLoading={setIsNotLoading}
                        onClose={fromMoreAction ? clearPopoverState : undefined}
                    />
                );
            case "duplicate":
                return (
                    <DuplicateActionButton
                        key="duplicate-invoice-button"
                        invoiceUid={invoice.uid}
                        onDuplicate={onDuplicateInvoice}
                        onClose={fromMoreAction ? clearPopoverState : undefined}
                    />
                );
            default:
                return null;
        }
    }

    function handleOnClickMarkInvoiceActionButton() {
        if (invoicePaymentSetting && invoice.is_dashdoc) {
            openConfirmMarkPaidModal();
        } else {
            handleMarkInvoicePaid({
                paid_at: undefined,
                payment_method: undefined,
                payment_notes: undefined,
            });
        }
    }

    function handleMarkInvoicePaid(payload: TrackingInvoicePaymentFormType) {
        const formattedPayload = formatTrackingInvoicePaymentPayload(payload);
        dispatch(fetchMarkInvoicePaid(invoice.uid, formattedPayload));
    }
};
