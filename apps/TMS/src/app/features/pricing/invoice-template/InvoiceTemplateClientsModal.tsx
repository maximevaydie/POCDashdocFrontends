import {t} from "@dashdoc/web-core";
import {Box, Card, Flex, Modal, OutlinedBigIconAndTextButton, Text} from "@dashdoc/web-ui";
import React, {FC, useEffect, useState} from "react";

import {CustomerToInvoiceSelect} from "app/taxation/invoicing/features/customer-to-invoice/CustomerToInvoiceSelect";

const InvoiceTemplateClientsModal: FC<{
    setIsModalOpen: (value: boolean) => unknown;
    onChange: (clients: {pk: number; name: string}[]) => unknown;
    clients: {pk: number; name: string}[];
}> = ({setIsModalOpen, onChange, clients}) => {
    const [applyToAll, setApplyToAll] = useState(clients.length === 0);
    const [localClients, setLocalClients] = useState(
        [...clients].sort((clientA, clientB) => {
            return clientA.name.localeCompare(clientB.name);
        })
    );
    useEffect(() => {
        setLocalClients(
            [...clients].sort((clientA, clientB) => {
                return clientA.name.localeCompare(clientB.name);
            })
        );
    }, [clients]);

    return (
        <Modal
            title={t("invoiceTemplates.customersToInvoice")}
            onClose={() => {
                setIsModalOpen(false);
            }}
            secondaryButton={{
                onClick: () => {
                    setIsModalOpen(false);
                },
            }}
            mainButton={{
                onClick: () => {
                    onChange(localClients);
                    setIsModalOpen(false);
                },
                children: t("invoiceTemplates.ValidateClientEdition"),
            }}
        >
            <Text variant="h1" mb={3}>
                {t("invoiceTemplates.InvoiceClientApplication")}
            </Text>
            <Flex flexDirection={"row"} justifyContent={"flex-start"} style={{gap: 12}}>
                <OutlinedBigIconAndTextButton
                    iconName={"building"}
                    onClick={() => {
                        setApplyToAll(true);
                        setLocalClients([]);
                    }}
                    active={applyToAll}
                    label={t("invoiceTemplates.AllCustomersToInvoiceButtonLabel")}
                    flexGrow={0}
                />
                <OutlinedBigIconAndTextButton
                    iconName={"cursorSelect"}
                    onClick={() => {
                        setApplyToAll(false);
                    }}
                    active={!applyToAll}
                    label={t("invoiceTemplates.SelectedCustomersToInvoiceButtonLabel")}
                    flexGrow={0}
                />
            </Flex>
            <Text variant="h1" mt={3} mb={3}>
                {t("invoiceTemplates.customersToInvoice")}
            </Text>
            <Card boxShadow={0} backgroundColor="grey.ultralight" padding={2} marginBottom={2}>
                <Text>
                    {applyToAll
                        ? t("invoiceTemplates.CouldBeAppliedToAll")
                        : t("invoiceTemplates.AppliedOnlyToSelected")}
                </Text>
            </Card>
            {!applyToAll && (
                <Flex>
                    <Box width="400px">
                        <CustomerToInvoiceSelect
                            value={localClients}
                            onChange={(options) =>
                                setLocalClients(
                                    (options as {pk: number; name: string}[])?.sort(
                                        (clientA, clientB) => {
                                            return clientA.name.localeCompare(clientB.name);
                                        }
                                    )
                                )
                            }
                            isMulti={true}
                            displayTooltip
                        />
                    </Box>
                </Flex>
            )}
        </Modal>
    );
};

export default InvoiceTemplateClientsModal;
