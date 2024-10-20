import {t} from "@dashdoc/web-core";
import {Box, Card, Flex, IconButton, Link, Text, theme} from "@dashdoc/web-ui";
import React, {useContext} from "react";

import {LineContext} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/LineContext";

import {InvoiceOrCreditNoteContext} from "../../../contexts/InvoiceOrCreditNoteContext";

import type {InvoiceTransport} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

type TransportLineProps = {
    transport: InvoiceTransport;
    deleteConfirmationMessage: string;
    onDeleteTransport: () => void;
    onEditInvoiceLineGroupDescription?: () => void;
    ["data-testid"]?: string;
};

export const TransportLink = ({
    transport,
    onDeleteTransport,
    onEditInvoiceLineGroupDescription,
    deleteConfirmationMessage,
    ...props
}: TransportLineProps) => {
    const {fromSharing, readOnly} = useContext(InvoiceOrCreditNoteContext);
    const {mouseOnLine} = useContext(LineContext);

    if (fromSharing) {
        return null;
    }

    return (
        <Card
            py="2"
            pl="2"
            pr={readOnly ? "2" : "0"}
            display="flex"
            alignItems="center"
            css={{
                columnGap: "2px",
                visibility: mouseOnLine ? "inherit" : "hidden",
            }}
        >
            <Link
                href={`/app/transports/${transport.uid}/`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={props["data-testid"] ?? "transport-link"}
                css={{
                    "&:hover": {
                        backgroundColor: theme.colors.grey.light,
                        borderRadius: "2px",
                        borderBottom: 0,
                    },
                }}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <Text px="1" color="blue.default">
                    {t("components.invoice.showTransports", {smart_count: 1})}
                </Text>
            </Link>
            {!readOnly && (
                <Flex alignItems="center">
                    <Box borderLeft="1px solid" pl="2px" borderColor="grey.light" height="25px" />
                    {onEditInvoiceLineGroupDescription && (
                        <IconButton
                            name="edit"
                            color="blue.default"
                            scale={[1.33, 1.33]}
                            disabled={readOnly}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditInvoiceLineGroupDescription();
                            }}
                            data-testid={"edit-description-from-invoice-button"}
                        />
                    )}
                    <IconButton
                        name="bin"
                        color="red.default"
                        scale={[1.33, 1.33]}
                        disabled={readOnly}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTransport();
                        }}
                        withConfirmation
                        confirmationMessage={deleteConfirmationMessage}
                        data-testid={"remove-transport-from-invoice-button"}
                    />
                </Flex>
            )}
        </Card>
    );
};
