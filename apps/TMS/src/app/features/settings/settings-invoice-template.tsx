import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Callout,
    Flex,
    Icon,
    IconButton,
    MenuItem,
    MenuSeparator,
    Popover,
    ScrollableTableFixedHeader,
    BaseColumnProps,
    Table,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import React, {FC, useState} from "react";
// eslint-disable-next-line import/no-named-as-default
import Helmet from "react-helmet";
import {RouteComponentProps, withRouter} from "react-router";

import {useInvoiceTemplates} from "app/hooks/useInvoiceTemplates";
import {InvoiceTemplate} from "app/services/invoicing";

import InvoiceTemplateModal from "../pricing/invoice-template/InvoiceTemplateEditionModal";

type SettingsInvoiceTemplateProps = {} & RouteComponentProps;

const ShipperCell: FC<{shippers: {pk: number; name: string}[]}> = ({shippers}) => {
    const TooltipContentTitle: FC = () => (
        <Box
            paddingBottom={2}
            marginBottom={2}
            borderBottomStyle={"solid"}
            borderBottomColor="grey.light"
            borderBottomWidth={1}
        >
            <Text variant="h1">{t("invoiceTemplates.customersToInvoice")}</Text>
        </Box>
    );
    let shipperString = t("invoiceTemplates.AllCustomersToInvoiceButtonLabel");
    if (shippers.length === 0) {
        return (
            <TooltipWrapper
                content={
                    <Flex minWidth={"220px"} flexDirection={"column"}>
                        <TooltipContentTitle />
                        {t("invoiceTemplates.TemplateAppliedToAllTooltip")}
                    </Flex>
                }
            >
                <Text>{shipperString}</Text>
            </TooltipWrapper>
        );
    }
    if (shippers.length > 0) {
        shipperString = shippers
            .slice(0, 2)
            .map(({name}) => name)
            .join(", ");
    }
    if (shippers.length > 2) {
        shipperString += `, (+${shippers.length - 2})`;
    }

    return (
        <TooltipWrapper
            content={
                <Flex minWidth={"220px"} flexDirection={"column"}>
                    <TooltipContentTitle />
                    <ul>
                        {shippers.map(({pk, name}) => (
                            <li key={pk}>{name}</li>
                        ))}
                    </ul>
                </Flex>
            }
        >
            <Text>{shipperString}</Text>
        </TooltipWrapper>
    );
};

const INITIAL_TEMPLATE: InvoiceTemplate = {
    name: "",
    template: "",
    shippers: [],
};

const SettingsInvoiceTemplate: FC<SettingsInvoiceTemplateProps> = () => {
    const [openedRowActions, setOpenedRowActions] = useState<string | null>(null); //contains the key of the row whose actions menu is open or null if none is opened
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalInitialTemplate, setModalInitialTemplate] =
        useState<InvoiceTemplate>(INITIAL_TEMPLATE);
    const {invoiceTemplates, createInvoiceTemplate, updateInvoiceTemplate, deleteInvoiceTemplate} =
        useInvoiceTemplates();
    const columns: BaseColumnProps[] = [
        {key: "name", name: "name", label: t("invoiceTemplates.Name")},
        {key: "shippers", name: "shippers", label: t("invoiceTemplates.customersToInvoice")},
        {key: "actions", name: "actions", label: ""},
    ];

    const ActionMenu: FC<{row: InvoiceTemplate}> = ({row}) => {
        return (
            <Popover
                visibility={{
                    isOpen: openedRowActions === row.uid,
                    onOpenChange: (value) => {
                        value ? setOpenedRowActions(row.uid ?? null) : setOpenedRowActions(null);
                    },
                }}
                key={"action-menu-" + row.uid}
            >
                <Popover.Trigger>
                    <IconButton name={"moreActions"} />
                </Popover.Trigger>
                <Popover.Content>
                    <MenuItem
                        icon="edit"
                        label={t("invoiceTemplates.Modify")}
                        onClick={() => {
                            setModalInitialTemplate(row);
                            setIsModalOpen(true);
                            setOpenedRowActions(null);
                        }}
                    />
                    <MenuItem
                        icon="duplicate"
                        label={t("invoiceTemplates.Duplicate")}
                        onClick={() => {
                            setModalInitialTemplate({...row, uid: undefined});
                            setIsModalOpen(true);
                            setOpenedRowActions(null);
                        }}
                    />
                    <MenuSeparator />
                    <MenuItem
                        icon="bin"
                        label={t("invoiceTemplates.Delete")}
                        onClick={() => {
                            // @ts-ignore
                            deleteInvoiceTemplate(row.uid);
                            setOpenedRowActions(null);
                        }}
                    />
                </Popover.Content>
            </Popover>
        );
    };

    return (
        <Box>
            <ScrollableTableFixedHeader>
                <Flex justifyContent="space-between" mb={3}>
                    <Helmet>
                        <title>{t("settings.invoiceTemplates")}</title>
                    </Helmet>
                    <Text
                        as="h3"
                        variant="title"
                        display="inline-block"
                        data-testid="screen-title"
                    >
                        {t("settings.invoiceTemplates")}
                    </Text>
                </Flex>

                <Box mb={3}>
                    <Callout>{t("settings.invoiceTemplatesInformation")}</Callout>
                </Box>
                <Flex flexDirection={"row"}>
                    <Flex flexGrow={1}></Flex>
                    <Button
                        variant={"primary"}
                        onClick={() => {
                            setModalInitialTemplate(INITIAL_TEMPLATE);
                            setIsModalOpen(true);
                        }}
                        data-testid={"add-template-button"}
                    >
                        <Flex flexDirection={"row"} alignItems={"center"}>
                            <Icon name={"add"} pt={1} mr={2} />
                            <Box>{t("invoiceTemplates.addATemplate")}</Box>
                        </Flex>
                    </Button>
                </Flex>
            </ScrollableTableFixedHeader>
            <Flex overflow="hidden" minHeight={"400px"} px={3} pb={3} flexDirection="column">
                <Table
                    minHeight={"400px"}
                    columns={columns}
                    rows={invoiceTemplates}
                    getRowCellContent={(row, columnName: "name" | "shippers" | "actions") => {
                        if (columnName === "actions") {
                            return (
                                <Flex flexDirection={"row"} justifyContent={"end"}>
                                    <ActionMenu row={row} />
                                </Flex>
                            );
                        }
                        if (columnName === "shippers") {
                            return <ShipperCell shippers={row.shippers} />;
                        }
                        return <Text>{row[columnName]}</Text>;
                    }}
                />
            </Flex>
            {isModalOpen && (
                <InvoiceTemplateModal
                    initialInvoiceTemplate={modalInitialTemplate}
                    onClose={() => {
                        setIsModalOpen(false);
                    }}
                    onSave={(invoiceTemplate) => {
                        if (invoiceTemplate.uid === undefined) {
                            createInvoiceTemplate(invoiceTemplate);
                            setIsModalOpen(false);
                        } else {
                            updateInvoiceTemplate(invoiceTemplate);
                            setIsModalOpen(false);
                        }
                    }}
                />
            )}
        </Box>
    );
};

export default withRouter(SettingsInvoiceTemplate);
