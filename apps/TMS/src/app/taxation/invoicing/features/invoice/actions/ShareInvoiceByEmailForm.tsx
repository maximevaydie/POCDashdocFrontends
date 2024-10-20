import {
    AnalyticsEvent,
    analyticsService,
    getConnectedCompany,
    getConnectedManager,
    utilsService,
} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Button, Checkbox, Flex, Icon, LoadingWheel, Text, toast} from "@dashdoc/web-ui";
import {MessageDocumentType, formatNumber, useToggle, yup} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React, {useEffect, useState} from "react";

import {fetchInvoiceDocumentsMetadata, fetchShareInvoice} from "app/redux/actions/invoices";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getDocumentTypeOptions} from "app/services/transport/documentTypes.service";
import {
    ContactSelectOption,
    ShareToContactsSelect,
} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/share/ShareToContactSelect";

import type {
    InvoiceAttachment,
    InvoiceStatus,
    ShareInvoicePayload,
} from "app/taxation/invoicing/types/invoice.types";

type DocumentsMetadataResponse = {
    type: MessageDocumentType | "invoice_file";
    count: number;
    total_size: number | null;
};
type TransportDocumentOption = {
    type: MessageDocumentType;
    count: number;
    total_size: number | null;
    label: string;
};

type ShareInvoiceByEmailFormProps = {
    itemUid: string;
    status: InvoiceStatus;
    isDashdoc: boolean;
    debtorCompanyId: number;
    onClose: () => void;
    attachments: InvoiceAttachment[];
};

export function ShareInvoiceByEmailForm({
    itemUid,
    status,
    isDashdoc,
    debtorCompanyId,
    onClose,
    attachments,
}: ShareInvoiceByEmailFormProps) {
    const connectedManager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);

    // @guidedtour[epic=redux, seq=3] useDispatch and useSelector
    // The equivalent of `mapDispatchToProps` and `mapStateToProps` in functional components
    // are `useDispatch` and `useSelector` respectively.
    const dispatch = useDispatch();

    //#region Formik
    const [isSubmittingForm, setIsSubmittingForm, setIsNotSubmittingForm] = useToggle();
    const formik = useFormik({
        initialValues: {
            emails: [],
            includeTransportDocuments: false,
            includeInvoiceDocuments: false,
            selectedTransportDocumentTypes: [] as boolean[],
        },
        validationSchema: yup.object().shape({
            emails: yup
                .array()
                // Here we don't use `yup.string().email()` to ensure that all values are emails
                // because we don't want to block submission if there are bad/missing emails.
                // However, validate that we have at least 1 valid email (with `transform().min()`).
                .of(yup.object({label: yup.string(), value: yup.string()}))
                .transform((options: ContactSelectOption[]) =>
                    options.filter((option) =>
                        utilsService.validateEmail(option.value?.trim() ?? "")
                    )
                )
                .min(1, t("common.mandatoryField")),
            includeTransportDocuments: yup.boolean(),
            includeInvoiceDocuments: yup.boolean(),
            selectedTransportDocumentTypes: yup.array().of(yup.boolean()),
        }),
        onSubmit: async (values) => {
            setIsSubmittingForm();

            const validEmails = values.emails
                .map((option: ContactSelectOption): string => option.value?.trim() ?? "")
                .filter(utilsService.validateEmail);

            let selectedTransportDocumentTypes: MessageDocumentType[] = [];
            if (values.includeTransportDocuments) {
                selectedTransportDocumentTypes = values.selectedTransportDocumentTypes
                    .map((isSelected, index) =>
                        isSelected ? transportDocumentOptions?.[index].type : undefined
                    )
                    .filter((value) => value !== undefined) as MessageDocumentType[];
            }

            const payload: ShareInvoicePayload = {
                emails: validEmails,
                transport_document_types: selectedTransportDocumentTypes,
                include_invoice_attachments: values.includeInvoiceDocuments,
            };

            try {
                await dispatch(fetchShareInvoice(itemUid, payload));

                analyticsService.sendEvent(AnalyticsEvent.invoiceShared, {
                    "is staff": connectedManager?.user.is_staff,
                    "company id": connectedCompany?.pk,
                    "invoice uid": itemUid,
                    "is dashdoc invoicing": isDashdoc,
                    "sharing method": "email",
                    "invoice status": status,
                    "added documents":
                        selectedTransportDocumentTypes.length === 0 &&
                        !values.includeInvoiceDocuments
                            ? "invoice only"
                            : "invoice + docs",
                    "is reminder": false,
                });
                setIsNotSubmittingForm();
                onClose();
            } catch (error) {
                setIsNotSubmittingForm();
                toast.error(t("common.error"));
            }
        },
    });
    //#endregion Formik

    //#region Documents
    const [transportDocumentOptions, setTransportDocumentOptions] = useState<
        TransportDocumentOption[] | undefined
    >(undefined);
    const [invoiceFileSize, setInvoiceFileSize] = useState<number | null>(null);

    useEffect(() => {
        if (transportDocumentOptions) {
            return;
        }

        const fetchOptions = async () => {
            const baseOptions = getDocumentTypeOptions();
            try {
                const result: {response: DocumentsMetadataResponse[]} = await dispatch(
                    fetchInvoiceDocumentsMetadata(itemUid)
                );
                const fullOptions = baseOptions.map((option) => {
                    const metadata = result.response.find((entry) => entry.type === option.value);
                    return {
                        type: option.value,
                        label: option.label,
                        count: metadata?.count || 0,
                        total_size: metadata?.total_size || null,
                    };
                });
                setTransportDocumentOptions(fullOptions);

                const invoiceFileTotalSize = result.response.find(
                    (entry) => entry.type === "invoice_file"
                )?.total_size;
                setInvoiceFileSize(invoiceFileTotalSize || null);

                // Do not update the form if we don't have documents options yet,
                // or if formik already has some values (i.e. this effect already ran).
                if (fullOptions && formik.values.selectedTransportDocumentTypes.length === 0) {
                    const newSelectedDocumentTypes = fullOptions.map(
                        (option) =>
                            // Only documents with size can be selected
                            !!option.total_size
                    );
                    formik.setFieldValue(
                        "selectedTransportDocumentTypes",
                        newSelectedDocumentTypes
                    );
                }
            } catch (error) {
                Logger.error(error);
                toast.error(t("shareInvoice.unableToFetchTransportDocumentsInformation"));
            }
        };
        fetchOptions();
    }, []);
    //#endregion Documents

    const invoiceAttachmentsTotalSize =
        attachments.length > 0
            ? attachments.reduce((totalSize: number, document: InvoiceAttachment) => {
                  return totalSize + document.file_size;
              }, 0)
            : 0;
    const hasSelectedDocumentsWithUnknownSize = formik.values.selectedTransportDocumentTypes.some(
        (isSelected, index) => {
            const metadata = transportDocumentOptions?.[index];
            return isSelected && metadata && !metadata.total_size;
        }
    );
    const selectedDocumentsTotalSize = hasSelectedDocumentsWithUnknownSize
        ? null
        : formik.values.selectedTransportDocumentTypes.reduce((acc, isSelected, index) => {
              if (formik.values.includeTransportDocuments && isSelected) {
                  const documentSize = transportDocumentOptions?.[index].total_size ?? 0;
                  return acc + documentSize;
              } else {
                  return acc;
              }
          }, 0) +
          (formik.values.includeInvoiceDocuments ? invoiceAttachmentsTotalSize : 0) +
          (invoiceFileSize ?? 0);

    const selectedDocumentsTotalSizeExceedLimit =
        getSizeInMegaByte(selectedDocumentsTotalSize || 0) >= 5;

    const isTransportDocument = transportDocumentOptions?.find((option) => option.count > 0);

    const displayFileSizes =
        (formik.values.includeTransportDocuments && transportDocumentOptions) ||
        (attachments.length > 0 && formik.values.includeInvoiceDocuments);

    return (
        <>
            <Text mb={2}>{t("shareInvoice.withDocs.emailText")}</Text>
            <FormikProvider value={formik}>
                <Form>
                    <Flex flexDirection="column" flex={1} style={{gap: "16px"}}>
                        <ShareToContactsSelect
                            emailType="share"
                            debtorCompanyId={debtorCompanyId}
                            onChange={(emails) => {
                                formik.setFieldValue("emails", emails);
                            }}
                            emails={formik.values.emails}
                            error={
                                formik.touched.emails
                                    ? (formik.errors.emails as unknown as string)
                                    : null
                            }
                        />
                        <Flex flexDirection="column" style={{gap: "4px"}}>
                            <Text mb={1} mt={2}>
                                {t("shareInvoice.emailAttachments")}
                            </Text>
                            <Flex justifyContent="space-between">
                                <Checkbox
                                    id={`invoice_file`}
                                    name={`invoice_file`}
                                    label={t("shareInvoice.invoicePdf")}
                                    disabled={true}
                                    checked={true}
                                />
                                {invoiceFileSize && (
                                    <Text>{humanReadableDocumentSize(invoiceFileSize)}</Text>
                                )}
                            </Flex>
                            {isTransportDocument && (
                                <Checkbox
                                    label={t("shareInvoice.transportAttachments")}
                                    checked={formik.values.includeTransportDocuments}
                                    onChange={(value) => {
                                        formik.setFieldValue("includeTransportDocuments", value);
                                    }}
                                />
                            )}
                            {formik.values.includeTransportDocuments &&
                                !transportDocumentOptions && <LoadingWheel />}
                            {formik.values.includeTransportDocuments &&
                                transportDocumentOptions && (
                                    <>
                                        <Flex flexDirection="column" pl={5} pr={0}>
                                            {transportDocumentOptions.map((option, index) => {
                                                return option.count ? (
                                                    <Flex
                                                        key={option.type}
                                                        justifyContent="space-between"
                                                    >
                                                        <Checkbox
                                                            id={`selected-transport-document-types-${index}`}
                                                            name={`selectedTransportDocumentTypes[${index}]`}
                                                            label={option.label}
                                                            checked={
                                                                formik.values
                                                                    .selectedTransportDocumentTypes[
                                                                    index
                                                                ] ?? false
                                                            }
                                                            onChange={(_, event) =>
                                                                formik.handleChange(event)
                                                            }
                                                        />
                                                        <Text>
                                                            {humanReadableDocumentSize(
                                                                option.total_size
                                                            )}
                                                        </Text>
                                                    </Flex>
                                                ) : null;
                                            })}
                                        </Flex>
                                    </>
                                )}
                            {attachments.length > 0 && (
                                <Flex justifyContent="space-between">
                                    <Checkbox
                                        label={t("shareInvoice.invoiceAttachments")}
                                        checked={formik.values.includeInvoiceDocuments}
                                        onChange={(value) => {
                                            formik.setFieldValue("includeInvoiceDocuments", value);
                                        }}
                                    />
                                    {displayFileSizes && (
                                        <Text>
                                            {humanReadableDocumentSize(
                                                invoiceAttachmentsTotalSize
                                            )}
                                        </Text>
                                    )}
                                </Flex>
                            )}
                        </Flex>
                        {displayFileSizes && (
                            <>
                                <Flex
                                    justifyContent={"flex-end"}
                                    borderTop="1px solid"
                                    borderTopColor="grey.light"
                                    pt={2}
                                >
                                    <Text variant="h2">
                                        {t("shareInvoice.totalTransportDocumentsSize")}
                                        {t("common.colon")}
                                        {humanReadableDocumentSize(selectedDocumentsTotalSize)}
                                    </Text>
                                </Flex>
                                {hasSelectedDocumentsWithUnknownSize ||
                                selectedDocumentsTotalSizeExceedLimit ? (
                                    <Flex
                                        p={3}
                                        backgroundColor="yellow.ultralight"
                                        style={{gap: "12px"}}
                                    >
                                        <Icon name="info" color="yellow.default" />
                                        <Text>
                                            {t("shareInvoice.totalTransportDocumentsAboveLimit", {
                                                sizeLimit: t("common.megaByte", {
                                                    size: 5,
                                                }),
                                            })}
                                        </Text>
                                    </Flex>
                                ) : (
                                    <Text variant="caption" mt={2}>
                                        {t("shareInvoice.totalTransportDocumentsBelowLimit", {
                                            sizeLimit: t("common.megaByte", {size: 5}),
                                        })}
                                    </Text>
                                )}
                            </>
                        )}
                    </Flex>
                    <Flex justifyContent="flex-end" mt={5}>
                        <Button
                            type="button"
                            height={40}
                            ml={2}
                            variant="secondary"
                            onClick={onClose}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button type="submit" height={40} ml={2} disabled={isSubmittingForm}>
                            {t("common.sendViaEmail")}
                        </Button>
                    </Flex>
                </Form>
            </FormikProvider>
        </>
    );

    function getSizeInMegaByte(sizeInBytes: number) {
        return sizeInBytes / 1048576;
    }

    function humanReadableDocumentSize(sizeInBytes: number | null) {
        if (!sizeInBytes) {
            return t("common.unknown");
        }

        const rounded = formatNumber(getSizeInMegaByte(sizeInBytes), {
            maximumFractionDigits: 3,
        });
        return t("common.megaByte", {size: rounded});
    }
}
