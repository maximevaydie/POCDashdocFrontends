import {SearchQuery, useDispatch} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Checkbox,
    Flex,
    HorizontalLine,
    Icon,
    Link,
    LoadingWheel,
    Modal,
    Radio,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {formatNumber, useToggle} from "dashdoc-utils";
import React, {useState} from "react";
import {Controller, FormProvider, useForm} from "react-hook-form";
import {z} from "zod";

import {fetchBulkShareInvoices} from "app/redux/actions";
import {getDocumentTypeOptions} from "app/services/transport";

type BulkShareInvoicesModalProps = {
    selectedInvoicesQuery: SearchQuery;
    selectedInvoicesCount?: number;
    onClose: () => void;
};

type InvoiceRepresentation = {
    uid: string;
    price: number;
    debtor_name: string;
    document_number: string | null;
};

type BulkShareInvoicesErrors = {
    no_billing_contacts_to_share: InvoiceRepresentation[];
};

// To keep in sync with BulkShareInvoicesOutputSerializer in the backend
type BulkShareInvoicesResponse = {
    invoices_sending_count: number;
    invoices_not_send_count: number;
    errors: BulkShareInvoicesErrors;
};

const bulkShareInvoicesSchema = z.object({
    invoicePdf: z.boolean(),
    includeInvoiceAttachments: z.boolean(),
    includeTransportDocuments: z.boolean(),
    sendingType: z.enum(["email_per_invoice", "email_per_debtor"]),
    transportDocumentTypes: z.object({
        cmr: z.boolean(),
        delivery_note: z.boolean(),
        confirmation: z.boolean(),
        weight_note: z.boolean(),
        invoice: z.boolean(),
        washing_note: z.boolean(),
        load_photo: z.boolean(),
        waste_manifest: z.boolean(),
        holders_swap_note: z.boolean(),
    }),
});
type BulkShareInvoicesFormType = z.infer<typeof bulkShareInvoicesSchema>;

export function BulkShareInvoicesModal({
    selectedInvoicesQuery,
    selectedInvoicesCount,
    onClose,
}: BulkShareInvoicesModalProps) {
    const dispatch = useDispatch();
    const transportDocumentOptions = getDocumentTypeOptions().slice(0, -1);

    const [isLoading, setIsLoading, setIsNotLoading] = useToggle();
    const [bulkShareInvoiceResponse, setBulkShareInvoiceResponse] =
        useState<BulkShareInvoicesResponse>({
            invoices_sending_count: 0,
            invoices_not_send_count: 0,
            errors: {
                no_billing_contacts_to_share: [],
            },
        });

    const [isDone, setDone] = useToggle();

    const form = useForm<BulkShareInvoicesFormType>({
        defaultValues: {
            invoicePdf: true,
            includeInvoiceAttachments: false,
            includeTransportDocuments: false,
            sendingType: "email_per_invoice",
            transportDocumentTypes: transportDocumentOptions.reduce(
                (documents: {[id: string]: boolean}, currentDocument) => {
                    documents[currentDocument.value] = false;
                    return documents;
                },
                {}
            ),
        },
    });
    const {
        handleSubmit,
        formState: {isSubmitting},
        watch,
    } = form;
    const isTransportDocumentsIncluded = watch("includeTransportDocuments");

    async function onSubmit(values: BulkShareInvoicesFormType) {
        setIsLoading();
        try {
            const transportDocumentTypes = Object.entries(values.transportDocumentTypes).reduce(
                (documentTypes: string[], [document, isSelected]) => {
                    if (isSelected) {
                        documentTypes.push(document);
                    }
                    return documentTypes;
                },
                []
            );
            const bulkShareInvoicesAction = await dispatch(
                fetchBulkShareInvoices(selectedInvoicesQuery, {
                    transport_document_types: transportDocumentTypes,
                    include_invoice_attachments: values.includeInvoiceAttachments,
                    sending_type: values.sendingType,
                })
            );
            setBulkShareInvoiceResponse(bulkShareInvoicesAction.response);
        } catch (error) {
            Logger.error("Error bulk share invoices", error);
            const errorJson = await error.json();
            if (errorJson.errors?.no_billing_contacts_to_share) {
                setBulkShareInvoiceResponse(errorJson);
            } else {
                setBulkShareInvoiceResponse({
                    invoices_sending_count: 0,
                    invoices_not_send_count: selectedInvoicesCount || 1,
                    errors: {
                        no_billing_contacts_to_share: [],
                    },
                });
            }
        } finally {
            setIsNotLoading();
            setDone();
        }
    }

    function _renderContent() {
        if (isLoading) {
            return <LoadingWheel />;
        }

        if (isDone) {
            const nonSendInvoicesLinks =
                bulkShareInvoiceResponse.errors.no_billing_contacts_to_share.map(
                    ({uid, document_number, debtor_name, price}, index) => (
                        <>
                            {index > 0 && ", "}
                            <Link
                                key={uid}
                                onClick={() => window.open(`/app/invoices/${uid}/`, "_blank")}
                            >
                                {document_number
                                    ? document_number
                                    : `${debtor_name} (${formatNumber(price, {
                                          style: "currency",
                                          currency: "EUR",
                                      })})`}
                            </Link>
                        </>
                    )
                );

            return (
                <Flex flexDirection="column" css={{gap: "8px"}}>
                    <Text variant="h1" fontWeight={700}>
                        {t("bulkShareInvoice.processing")}
                    </Text>
                    {bulkShareInvoiceResponse.invoices_sending_count > 0 && (
                        <Flex css={{gap: "8px"}}>
                            <Text>
                                {t("bulkShareInvoice.xInvoicesSending", {
                                    smart_count: bulkShareInvoiceResponse.invoices_sending_count,
                                })}
                            </Text>

                            <TooltipWrapper content={t("bulkShareInvoice.processTooltip")}>
                                <Icon name="questionCircle" color="blue.default" />
                            </TooltipWrapper>
                        </Flex>
                    )}
                    {bulkShareInvoiceResponse.invoices_not_send_count > 0 && (
                        <Flex
                            backgroundColor="grey.ultralight"
                            flexDirection="column"
                            css={{gap: "8px"}}
                            p={4}
                        >
                            <>
                                <Text variant="h2">{t("common.problemIdentify")}</Text>
                                <Flex css={{gap: "8px"}}>
                                    <Icon name="removeCircle" color="red.default" />
                                    <Text>
                                        {t("bulkShareInvoice.xInvoicesFailed", {
                                            smart_count:
                                                bulkShareInvoiceResponse.invoices_not_send_count,
                                        })}
                                    </Text>
                                </Flex>
                                <HorizontalLine />
                                <Flex flexWrap="wrap">
                                    <Text>{t("bulkShareInvoice.noBillingContacts")}</Text>
                                    <Text ml={1}>{nonSendInvoicesLinks}</Text>
                                </Flex>
                            </>
                        </Flex>
                    )}
                </Flex>
            );
        }

        return (
            <>
                <Box
                    ml={-5}
                    pl={5}
                    mr={-5}
                    pr={5}
                    mt={-3.5}
                    pt={3}
                    pb={3}
                    backgroundColor={"blue.ultralight"}
                >
                    <Text color="blue.dark" variant="h2">
                        {t("invoice.xSelectedInvoices", {
                            smart_count: selectedInvoicesCount || 0,
                        })}
                    </Text>
                </Box>

                <Flex flexDirection="column" css={{gap: "14px"}} my={4}>
                    <Text>{t("invoice.bulkShareInvoicesModalSubtext")}</Text>

                    <Flex flexDirection="column" css={{gap: "8px"}}>
                        <Text>{t("shareInvoice.emailAttachments")}</Text>
                        <FormProvider {...form}>
                            <Controller
                                name="invoicePdf"
                                render={({field}) => (
                                    <Checkbox
                                        {...field}
                                        checked
                                        label={t("shareInvoice.invoicePdf")}
                                        disabled
                                    />
                                )}
                            />
                            <Controller
                                name="includeInvoiceAttachments"
                                render={({field}) => (
                                    <Checkbox
                                        {...field}
                                        label={t("shareInvoice.invoiceAttachments")}
                                    />
                                )}
                            />
                            <Controller
                                name="includeTransportDocuments"
                                render={({field}) => (
                                    <Checkbox
                                        {...field}
                                        label={t("shareInvoice.transportAttachments")}
                                    />
                                )}
                            />
                            {isTransportDocumentsIncluded && (
                                <Flex flexDirection="column" pl={5} pr={0}>
                                    {transportDocumentOptions.map((option, index) => {
                                        return (
                                            <Flex key={index} justifyContent="space-between">
                                                <Controller
                                                    name={`transportDocumentTypes[${option.value}]`}
                                                    render={({field}) => (
                                                        <Checkbox
                                                            {...field}
                                                            id={`selected-transport-document-types-${index}`}
                                                            name={`selectedTransportDocumentTypes[${index}]`}
                                                            label={option.label}
                                                        />
                                                    )}
                                                />
                                            </Flex>
                                        );
                                    })}
                                </Flex>
                            )}
                            <Text variant="h1" mt={2}>
                                {t("shareInvoice.sendingOptions")}
                            </Text>
                            <Controller
                                name="sendingType"
                                render={({field: {value, onChange}}) => (
                                    <Flex flexDirection={"column"}>
                                        <Radio
                                            label={t("shareInvoice.emailPerInvoice")}
                                            value={"email_per_invoice"}
                                            onChange={() => onChange("email_per_invoice")}
                                            checked={value === "email_per_invoice"}
                                        />
                                        <Radio
                                            label={t("shareInvoice.emailPerDebtor")}
                                            value={"email_per_debtor"}
                                            onChange={() => onChange("email_per_debtor")}
                                            checked={value === "email_per_debtor"}
                                        />
                                    </Flex>
                                )}
                            />
                        </FormProvider>
                    </Flex>
                </Flex>
            </>
        );
    }

    return (
        <Modal
            data-testid="bulk-share-invoices-modal"
            title={t("invoice.bulkShareInvoicesModalTitle")}
            onClose={onClose}
            mainButton={
                isDone
                    ? {
                          disabled: false,
                          onClick: onClose,
                          children: t("common.confirmUnderstanding"),
                          "data-testid": "bulk-share-invoices-final-modal-confirm-button",
                      }
                    : {
                          onClick: handleSubmit(onSubmit),
                          disabled: isSubmitting,
                          children: t("invoice.bulkShareByEmail"),
                          "data-testid": "bulk-share-invoices-modal-submit-button",
                      }
            }
            secondaryButton={
                isDone
                    ? null
                    : {
                          onClick: () => onClose(),
                      }
            }
        >
            {_renderContent()}
        </Modal>
    );
}
