import {t} from "@dashdoc/web-core";
import {
    Card,
    ClickableFlex,
    Flex,
    Icon,
    IconButton,
    Modal,
    CardProps,
    Text,
    TextInput,
    applyTemplate,
    TemplateArea,
} from "@dashdoc/web-ui";
import React, {FC, useEffect, useRef, useState} from "react";
import cloneDeep from "rfdc/default";

import {InvoiceTemplate} from "app/services/invoicing";

import {getTranslatedVariableList} from "./invoice-template-variable-list";
import InvoiceTemplateClientsCardContent from "./InvoiceTemplateClientsCardContent";

export type GroupedVariableList = {
    groupId: string;
    groupLabel: string;
    groupVariables: {
        id: string;
        label: string;
        mockValue?: string;
    }[];
}[];

const ungroupVariableList = (variableList: GroupedVariableList): {id: string; label: string}[] => {
    const result = [];
    for (const group of variableList) {
        for (const variable of group.groupVariables) {
            result.push({
                id: variable.id,
                label: variable.label,
            });
        }
    }
    return result;
};

const getMockMapping = (variableList: GroupedVariableList): {[id: string]: string} => {
    const result: {[id: string]: string} = {};
    for (const group of variableList) {
        for (const variable of group.groupVariables) {
            result[variable.id] = variable.mockValue || `(${variable.label})`;
        }
    }
    return result;
};

interface VariableListCardProps extends CardProps {
    variableList: GroupedVariableList;
    onClick?: (variableId: string) => unknown;
}

const VariableListCard: FC<VariableListCardProps> = ({
    variableList = [],
    onClick = () => {},
    ...cardProps
}) => {
    const [openedGroupId, setOpenedGroupId] = useState<string | null>(null);
    return (
        <Card
            boxShadow={0}
            borderStyle={"solid"}
            borderWidth={"1px"}
            borderColor="grey.light"
            padding={2}
            {...cardProps}
        >
            <Text variant="captionBold">{t("invoiceTemplates.VariablesList")}</Text>
            {variableList.map(({groupId, groupLabel, groupVariables}) => (
                <React.Fragment key={groupId}>
                    <ClickableFlex
                        paddingY={2}
                        key={groupId}
                        onClick={() => {
                            if (groupId === openedGroupId) {
                                setOpenedGroupId(null);
                            } else {
                                setOpenedGroupId(groupId);
                            }
                        }}
                        data-testid={`variable-list-group-${groupId}`}
                    >
                        <Text fontWeight="600" color="grey.dark" flexGrow={1}>
                            {groupLabel}
                        </Text>
                        <Icon
                            name={openedGroupId === groupId ? "arrowDown" : "arrowRight"}
                            data-data-testid={
                                openedGroupId === groupId
                                    ? `close-variable-group-${groupId}`
                                    : `open-variable-group-${groupId}`
                            }
                        />
                    </ClickableFlex>

                    {openedGroupId === groupId && (
                        <Flex flexDirection={"column"} marginBottom={3}>
                            {groupVariables.map(({id, label}) => (
                                <ClickableFlex
                                    paddingY={2}
                                    key={id}
                                    borderBottomStyle={"solid"}
                                    borderBottomColor="grey.light"
                                    borderBottomWidth={"1px"}
                                    onClick={() => {
                                        onClick(id);
                                    }}
                                    data-testid={`variable-list-variable-${id}`}
                                >
                                    <Text fontWeight="400" color="grey.dark" flexGrow={1}>
                                        {label}
                                    </Text>
                                </ClickableFlex>
                            ))}
                        </Flex>
                    )}
                </React.Fragment>
            ))}
        </Card>
    );
};

interface InvoiceTemplateModalProps {
    initialInvoiceTemplate: InvoiceTemplate;
    onClose?: () => unknown;
    onSave: (invoiceTemplate: InvoiceTemplate) => unknown;
}

const InvoiceTemplateModal: FC<InvoiceTemplateModalProps> = ({
    initialInvoiceTemplate,
    onClose,
    onSave,
}) => {
    const [invoiceName, setInvoiceName] = useState(initialInvoiceTemplate.name);
    const [isOpenPreview, setIsOpenPreview] = useState(true);
    const [currentTemplate, setCurrentTemplate] = useState(initialInvoiceTemplate.template);
    const [shippers, setShippers] = useState(cloneDeep(initialInvoiceTemplate.shippers));

    useEffect(() => {
        setInvoiceName(initialInvoiceTemplate.name);
        setCurrentTemplate(initialInvoiceTemplate.template);
        setShippers(cloneDeep(initialInvoiceTemplate.shippers));
    }, [initialInvoiceTemplate]);

    const isInvoiceNameEmpty = invoiceName === "";
    const isCurrentTemplateEmpty = currentTemplate === "";

    const variablesList = getTranslatedVariableList();
    const templateAreaRef = useRef<{
        addVariable: (variableId: string) => void;
    }>();
    const RIGHT_PANNEL_WIDTH = 300;
    return (
        <Modal
            title={
                initialInvoiceTemplate.uid === undefined
                    ? t("invoiceTemplates.NewInvoiceTemplate")
                    : t("invoiceTemplates.EditInvoiceTemplate")
            }
            mainButton={{
                onClick: () => {
                    onSave({
                        uid: initialInvoiceTemplate.uid,
                        name: invoiceName,
                        template: currentTemplate,
                        shippers: shippers,
                    });
                },
                disabled: isCurrentTemplateEmpty || isInvoiceNameEmpty,
            }}
            minWidth={RIGHT_PANNEL_WIDTH * 3}
            onClose={() => {
                // @ts-ignore
                onClose();
            }}
        >
            <Flex flexDirection="column">
                <Flex flexDirection="row">
                    <Flex flexDirection={"column"} flexGrow={1} marginRight={5}>
                        <Text variant="h1" marginY={1}>
                            {t("invoiceTemplates.General")}
                        </Text>
                        <TextInput
                            label={t("invoiceTemplates.TemplateName")}
                            value={invoiceName}
                            onChange={(newValue: string) => {
                                setInvoiceName(newValue);
                            }}
                            data-testid="invoice-template-name-input"
                        />
                    </Flex>
                    <Card
                        width={RIGHT_PANNEL_WIDTH}
                        boxShadow={0}
                        backgroundColor="grey.ultralight"
                        padding={2}
                    >
                        <InvoiceTemplateClientsCardContent
                            shippers={shippers}
                            onChange={(shippers) => setShippers(shippers)}
                        />
                    </Card>
                </Flex>
                <Text variant="h1" marginY={3}>
                    {t("invoiceTemplates.InvoicedTransportDesciption")}
                </Text>
                <Flex flexDirection="row">
                    <Flex flexDirection={"column"} flexGrow={1} marginRight={5}>
                        {currentTemplate.length === 0 && (
                            <Text mb={2} color="grey.dark">
                                {t("invoiceTemplates.DesciptionAreaPlaceholder")}
                            </Text>
                        )}
                        <TemplateArea
                            // @ts-ignore
                            ref={templateAreaRef}
                            key={initialInvoiceTemplate.uid ? initialInvoiceTemplate.uid : "new"}
                            variableList={ungroupVariableList(variablesList)}
                            initialTemplate={initialInvoiceTemplate.template}
                            displayBuiltInVariablePicker={false}
                            onChange={(newValue: string) => {
                                setCurrentTemplate(newValue);
                            }}
                            data-testid="invoice-template-description-input"
                        />
                        {isOpenPreview ? (
                            <Card
                                boxShadow={0}
                                borderStyle={"solid"}
                                borderWidth={"1px"}
                                borderColor="grey.light"
                                padding={2}
                                marginTop={4}
                            >
                                <IconButton
                                    name="eye"
                                    label={t("invoiceTemplates.HidePreview")}
                                    onClick={() => {
                                        setIsOpenPreview(false);
                                    }}
                                />
                                <Text>
                                    {applyTemplate(currentTemplate, getMockMapping(variablesList))}
                                </Text>
                            </Card>
                        ) : (
                            <IconButton
                                name="eye"
                                label={t("invoiceTemplates.ShowPreview")}
                                onClick={() => {
                                    setIsOpenPreview(true);
                                }}
                            />
                        )}
                    </Flex>
                    <VariableListCard
                        variableList={variablesList}
                        width={RIGHT_PANNEL_WIDTH}
                        minWidth={RIGHT_PANNEL_WIDTH}
                        onClick={(id) => {
                            // @ts-ignore
                            templateAreaRef.current.addVariable?.(id);
                        }}
                    />
                </Flex>
                <Flex flexDirection={"row"} justifyContent={"flex-end"} marginTop={3}>
                    {(isCurrentTemplateEmpty || isInvoiceNameEmpty) && (
                        <Text color={"red.default"}>
                            {t("invoiceTemplates.MissingRequiredFields")}
                        </Text>
                    )}
                </Flex>
            </Flex>
        </Modal>
    );
};

export default InvoiceTemplateModal;
