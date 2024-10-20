import {t} from "@dashdoc/web-core";
import {Card, Flex, IconButton, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FC, useContext} from "react";

import InvoiceLineModal from "app/features/pricing/invoices/invoice-line-modal/invoice-line-modal";

import {InvoiceOrCreditNoteContext} from "../../contexts/InvoiceOrCreditNoteContext";
import {LineContext, LineContextProvider} from "../../contexts/LineContext";
import {Line} from "../Line";

import type {AddOrUpdateInvoiceLine} from "app/taxation/invoicing/types/invoice.types";
import type {InvoiceLine as InvoiceLineData} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

type InvoiceLineProps = {
    invoiceLine: InvoiceLineData;
    onDelete?: () => void;
    onUpdate?: (newInvoiceLine: AddOrUpdateInvoiceLine) => void;
    "data-testid"?: string;
};

export const InvoiceLine = ({invoiceLine, onDelete, onUpdate, ...props}: InvoiceLineProps) => {
    const grossPrice = parseFloat(invoiceLine.amount);
    const testId = props["data-testid"] ?? "invoice-line";
    return (
        <Flex
            flex={1}
            flexDirection="column"
            borderBottomStyle="solid"
            borderBottomWidth="1px"
            borderBottomColor="grey.light"
        >
            <LineContextProvider lineId={invoiceLine.id}>
                <Line
                    lineId={invoiceLine.id}
                    data-testid={testId}
                    content={
                        <Flex flex={1} justifyContent="space-between">
                            <InvoiceLineContent
                                invoiceLine={invoiceLine}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                data-testid={testId + "-content"}
                            />
                        </Flex>
                    }
                    grossPrice={grossPrice}
                    currency={invoiceLine.currency}
                />
            </LineContextProvider>
        </Flex>
    );
};

export const InvoiceLineContent: FC<{
    invoiceLine: InvoiceLineData;
    onDelete?: () => void;
    onUpdate?: (newInvoiceLine: AddOrUpdateInvoiceLine) => void;
    "data-testid"?: string;
}> = ({invoiceLine, onDelete, onUpdate, ...props}) => {
    const [modalVisible, showModal, hideModal] = useToggle(false);
    let {readOnly, invoiceOrCreditNote} = useContext(InvoiceOrCreditNoteContext);
    if (!onDelete || !onUpdate) {
        readOnly = true;
    }
    const {mouseOnLine} = useContext(LineContext);
    const testId = props["data-testid"] ?? "invoice-line-content";

    const showEditButtons = mouseOnLine && !readOnly;

    return (
        <>
            <Flex justifyContent="space-between" flex={1} alignItems="center" data-testid={testId}>
                <Text data-testid={testId + "-description"}>{invoiceLine.description}</Text>
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
                            onClick={showModal}
                            disabled={readOnly}
                            data-testid={testId + "-edit-button"}
                        />
                    )}
                    {!readOnly && onDelete && (
                        <IconButton
                            scale={[1.33, 1.33]}
                            color="red.default"
                            name="bin"
                            onClick={onDelete}
                            withConfirmation
                            confirmationMessage={t("invoiceContent.confirmRemoveInvoiceLine", {
                                invoiceLineDescription: invoiceLine.description,
                            })}
                            data-testid={"remove-transport-from-invoice-button"}
                            disabled={readOnly}
                        />
                    )}
                </Card>
            </Flex>
            {modalVisible && onUpdate && (
                <InvoiceLineModal
                    mode="edit"
                    invoiceLineId={invoiceLine.id}
                    onSubmit={onUpdate}
                    onClose={hideModal}
                    is_dashdoc={Boolean(
                        invoiceOrCreditNote &&
                            "is_dashdoc" in invoiceOrCreditNote &&
                            invoiceOrCreditNote.is_dashdoc
                    )}
                />
            )}
        </>
    );
};
