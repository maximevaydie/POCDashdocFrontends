import {Box, Flex} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {withReduxStore} from "../../../../../../../../.storybook/decorators";
import {invoice} from "../../__mocks__/invoice";
import {InvoiceContent as InvoiceContentComponent, InvoiceContentProps} from "../InvoiceContent";

import type {InvoiceStatus} from "app/taxation/invoicing/types/invoice.types";
const groupOptions = {
    None: null as any,
    All: {
        merge_by: "ALL_GROUPS",
        description: "A description",
    },
};
export default {
    title: "app/features/invoices/invoice-details",
    component: InvoiceContentComponent,
    args: {
        isSubmitting: false,
        fromSharing: false,
        invoiceStatus: "draft",
        onRemoveTransportFromInvoice: (param: string) =>
            alert(`onRemoveTransportFromInvoice(${param})`),
        onEditInvoiceLineGroupDescription: (param: string) =>
            alert(`onEditInvoiceLineGroupDescription(${param})`),
        onAddInvoiceLine: () => alert(`onSubmit`),
        onRemoveInvoiceLine: (param: number) => alert(`onRemoveInvoiceLine(${param})`),
        onUpdateInvoiceLine: (param: number) => alert(`onUpdateInvoiceLine(${param})`),
        onAddOrUpdateGasIndex: () => alert(`onAddOrUpdateGasIndex()`),
        invoice,
    },
    argTypes: {
        invoiceStatus: {
            control: "inline-radio",
            options: ["draft", "final", "paid"],
            defaultValue: "draft",
        },
        linesMergingInfo: {
            options: Object.keys(groupOptions),
            mapping: groupOptions,
            control: {
                type: "select",
                labels: {
                    None: "No group",
                    All: "All groups",
                },
            },
        },
    },
    parameters: {
        backgrounds: {default: "white"},
        layout: "fullscreen",
    },
} as Meta;

const Template: Story<
    InvoiceContentProps & {
        invoiceStatus: InvoiceStatus;
    }
> = (args) => {
    const {invoice, invoiceStatus, ...others} = args;
    const finalInvoice = {...invoice, status: invoiceStatus};
    return (
        <Flex>
            <Box width="900px" margin="auto">
                <InvoiceContentComponent invoice={finalInvoice} {...others} />
            </Box>
        </Flex>
    );
};
export const InvoiceContent = Template.bind({});
InvoiceContent.storyName = "InvoiceContent";
InvoiceContent.decorators = [
    withReduxStore({
        invoicingConnector: invoice.invoicing_connector,
        invoicingConnectorLoading: false,
        invoicingConnectorLoaded: true,
    }),
];
