import {t} from "@dashdoc/web-core";
import {Button, Text} from "@dashdoc/web-ui";
import {BadgeList} from "@dashdoc/web-ui";
import React, {FC, useState} from "react";

import InvoiceTemplateClientsModal from "./InvoiceTemplateClientsModal";

const InvoiceTemplateClientsCardContent: FC<{
    shippers: {pk: number; name: string}[];
    onChange: (newClients: {pk: number; name: string}[]) => unknown;
}> = ({shippers: clients, onChange}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Text variant="h1" mb={3}>
                {t("invoiceTemplates.customersToInvoice")}
            </Text>
            {clients.length > 0 ? (
                <BadgeList
                    isMultiLine={true}
                    values={clients.map((client) => client.name).slice(0, 5)}
                />
            ) : (
                <Text>{t("invoiceTemplates.TemplateAppliedToAll")}</Text>
            )}

            {clients.length > 5 && (
                <Button
                    mt={1}
                    variant={"plain"}
                    onClick={() => {
                        setIsModalOpen(true);
                    }}
                >
                    {t("invoiceTemplates.MoreClients", {
                        smart_count: clients.length - 5,
                    })}
                </Button>
            )}
            <Button
                mt={3}
                variant={"plain"}
                onClick={() => {
                    setIsModalOpen(true);
                }}
            >
                {clients.length > 0
                    ? t("invoiceTemplates.EditClients")
                    : t("invoiceTemplates.SelectClients")}
            </Button>
            {isModalOpen && (
                <InvoiceTemplateClientsModal
                    setIsModalOpen={setIsModalOpen}
                    onChange={onChange}
                    clients={clients}
                />
            )}
        </>
    );
};

export default InvoiceTemplateClientsCardContent;
