import {t} from "@dashdoc/web-core";
import {Box, Card, Flex, IconButton, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FC, useContext} from "react";

import {useCreditNoteContext} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/InvoiceOrCreditNoteContext";
import {
    LineContext,
    LineContextProvider,
} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/LineContext";
import {Line} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/Line";
import {deleteCreditNoteStandaloneLine} from "app/taxation/invoicing/features/credit-note/hooks/creditNoteStandaloneLineCrud.service";
import {UpdateStandaloneCreditNoteLineModal} from "app/taxation/invoicing/features/credit-note/UpdateCreditNoteStandaloneLineModal";
import {toastCreditNoteLineDeleteError} from "app/taxation/invoicing/services/invoicingToasts";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";

type StandaloneCreditNoteLinesProps = {
    hideIfEmpty: boolean;
};

export const StandaloneCreditNoteLines: FC<StandaloneCreditNoteLinesProps> = ({hideIfEmpty}) => {
    const {creditNote} = useCreditNoteContext();
    if (creditNote.lines.length === 0 && hideIfEmpty) {
        return null;
    }
    return (
        <>
            <Text
                px={4}
                py={2}
                variant="captionBold"
                backgroundColor="blue.ultralight"
                color="blue.dark"
            >
                {creditNote.is_bare_credit_note
                    ? t("creditNotes.bareCreditNoteLines")
                    : t("components.invoice.otherInvoiceLines")}
            </Text>
            <Box>
                {creditNote.lines.map((line, index) => (
                    <StandaloneCreditNoteLine key={line.id} line={line} lineIndex={index} />
                ))}
            </Box>
        </>
    );
};

const StandaloneCreditNoteLine = ({
    line,
    lineIndex,
}: {
    line: CreditNote["lines"][0];
    lineIndex: number;
}) => {
    const {creditNote} = useCreditNoteContext();
    const [isUpdateModalOpen, openUpdateModal, closeUpdateModal] = useToggle(false);
    const handleDelete = async () => {
        try {
            await deleteCreditNoteStandaloneLine(creditNote.uid, line.id);
        } catch (e) {
            toastCreditNoteLineDeleteError();
        }
    };
    const testId = `credit-note-standalone-line-${lineIndex}`;
    const grossPrice = parseFloat(line.amount);

    return (
        <>
            <Flex
                flex={1}
                flexDirection="column"
                borderBottomStyle="solid"
                borderBottomWidth="1px"
                borderBottomColor="grey.light"
            >
                <LineContextProvider lineId={line.id}>
                    <Line
                        lineId={line.id}
                        data-testid={testId}
                        content={
                            <Flex flex={1} justifyContent="space-between">
                                <StandaloneCreditNoteLineContent
                                    creditNoteLine={line}
                                    onUpdate={openUpdateModal}
                                    onDelete={handleDelete}
                                    data-testid={testId + "-content"}
                                />
                            </Flex>
                        }
                        grossPrice={grossPrice}
                        currency={line.currency}
                    />
                </LineContextProvider>
            </Flex>
            {isUpdateModalOpen && (
                <UpdateStandaloneCreditNoteLineModal
                    creditNoteUid={creditNote.uid}
                    line={line}
                    onClose={closeUpdateModal}
                />
            )}
        </>
    );
};

const StandaloneCreditNoteLineContent: FC<{
    creditNoteLine: CreditNote["lines"][0];
    onDelete: () => void;
    onUpdate: () => void;
    "data-testid": string;
}> = ({creditNoteLine, onDelete, onUpdate, ...props}) => {
    let {readOnly} = useCreditNoteContext();
    const {mouseOnLine} = useContext(LineContext);
    const testId = props["data-testid"];

    const showEditButtons = mouseOnLine && !readOnly;

    return (
        <>
            <Flex justifyContent="space-between" flex={1} alignItems="center" data-testid={testId}>
                <Text data-testid={testId + "-description"}>{creditNoteLine.description}</Text>
                <Card
                    p="1"
                    display="flex"
                    alignItems="center"
                    css={{
                        columnGap: "2px",
                        visibility: showEditButtons ? "inherit" : "hidden",
                    }}
                >
                    {showEditButtons && (
                        <IconButton
                            name="edit"
                            color="blue.default"
                            scale={[1.33, 1.33]}
                            onClick={onUpdate}
                            disabled={readOnly}
                            data-testid={testId + "-edit-button"}
                        />
                    )}
                    {!readOnly && (
                        <IconButton
                            scale={[1.33, 1.33]}
                            color="red.default"
                            name="bin"
                            onClick={onDelete}
                            withConfirmation
                            confirmationMessage={t("creditNotes.confirmRemoveCreditNoteLine", {
                                invoiceLineDescription: creditNoteLine.description,
                            })}
                            data-testid={"remove-transport-from-invoice-button"}
                            disabled={readOnly}
                        />
                    )}
                </Card>
            </Flex>
        </>
    );
};
