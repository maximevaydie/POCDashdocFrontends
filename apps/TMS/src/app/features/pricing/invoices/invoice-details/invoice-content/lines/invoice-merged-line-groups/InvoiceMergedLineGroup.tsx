import {Logger, t} from "@dashdoc/web-core";
import {Box, Button, Card, Flex, IconButton, Modal, Text, TextArea, theme} from "@dashdoc/web-ui";
import {useToggle, yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React, {FunctionComponent, useCallback, useContext} from "react";

import {InvoiceOrCreditNoteContext} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/InvoiceOrCreditNoteContext";
import {
    LineContext,
    LineContextProvider,
} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/LineContext";
import {InvoiceMergedLineGroupTransportModal} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/invoice-merged-line-groups/InvoiceMergedLineGroupTransportModal";
import {Line} from "app/features/pricing/invoices/invoice-details/invoice-content/lines/Line";
import {fetchUpdateMergeLineGroups} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import type {InvoiceLineGroup} from "app/taxation/invoicing/types/invoice.types";
import type {InvoiceMergedLineGroups} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

type InvoiceMergedLineGroupProps = {
    mergedLineGroup: InvoiceMergedLineGroups;
    onRemoveTransportFromInvoice?: (transportUid: string) => void;
    index: number;
};

export const InvoiceMergedLineGroup = ({
    mergedLineGroup,
    onRemoveTransportFromInvoice,
    index,
}: InvoiceMergedLineGroupProps) => {
    const {invoiceOrCreditNote} = useContext(InvoiceOrCreditNoteContext);
    const dispatch = useDispatch();

    const lineGroups =
        mergedLineGroup?.line_groups?.filter(
            (lineGroup: InvoiceLineGroup) => !!lineGroup.transport
        ) ?? [];

    if (lineGroups.length === 0) {
        return null;
    }

    async function onUpdateDescription(description: string) {
        try {
            await dispatch(fetchUpdateMergeLineGroups(mergedLineGroup.uid, {description}));
        } catch (e) {
            Logger.log("Failed to update merged line groups description", e);
        }
    }

    return (
        <Flex flexDirection="column">
            <Box>
                <Box borderBottom="1px solid" borderBottomColor="grey.light">
                    <LineContextProvider lineId={mergedLineGroup.id}>
                        <Line
                            lineId={mergedLineGroup.id}
                            content={
                                <Content
                                    index={index}
                                    lineGroups={lineGroups}
                                    onRemoveTransportFromInvoice={onRemoveTransportFromInvoice}
                                    description={mergedLineGroup.description}
                                    totalPriceWithoutTax={mergedLineGroup.total_price_without_tax}
                                    onUpdateDescription={onUpdateDescription}
                                />
                            }
                            grossPrice={Number(mergedLineGroup.total_price_without_tax)}
                            currency={invoiceOrCreditNote?.currency || "EUR"}
                            data-testid={`invoice-merged-line-group-${index}-line`}
                        />
                    </LineContextProvider>
                </Box>
            </Box>
        </Flex>
    );
};

const Content = ({
    lineGroups,
    description,
    totalPriceWithoutTax,
    onRemoveTransportFromInvoice,
    onUpdateDescription,
    index,
}: {
    lineGroups: InvoiceLineGroup[];
    description: string;
    totalPriceWithoutTax: string;
    index: number;
    onRemoveTransportFromInvoice?: (transportUid: string) => void;
    onUpdateDescription: (description: string) => void;
}) => {
    const {mouseOnLine} = useContext(LineContext);
    const {invoiceOrCreditNote, readOnly} = useContext(InvoiceOrCreditNoteContext);

    const [isTransportsModalOpen, openTransportsModal, closeTransportsModal] = useToggle();
    const [isModalOpen, openModal, closeModal] = useToggle();

    return (
        <Flex flex={1} justifyContent="space-between" alignItems="center">
            <Text data-testid={`merged-line-group-description-${index}`}>{description}</Text>
            <Card
                p="2"
                display="flex"
                alignItems="center"
                css={{
                    columnGap: "2px",
                    visibility: mouseOnLine ? "inherit" : "hidden",
                }}
            >
                <Button
                    variant="plain"
                    onClick={openTransportsModal}
                    css={{
                        padding: "0",
                    }}
                    data-testid={"open-merged-line-group-transport-modal"}
                >
                    <Text
                        px="1"
                        color="blue.default"
                        css={{
                            "&:hover": {
                                backgroundColor: theme.colors.grey.light,
                                borderRadius: "2px",
                            },
                        }}
                    >
                        {t("components.invoice.showTransports", {smart_count: lineGroups.length})}
                    </Text>
                </Button>
                {!readOnly && (
                    <>
                        <Box borderLeft="1px solid" borderColor="grey.light" height="25px" />
                        <IconButton
                            name="edit"
                            color="blue.default"
                            scale={[1.33, 1.33]}
                            disabled={readOnly}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal();
                            }}
                            data-testid={"edit-merged-line-group-description"}
                        />
                    </>
                )}
            </Card>

            {isTransportsModalOpen && (
                <InvoiceMergedLineGroupTransportModal
                    lineGroups={lineGroups}
                    title={description}
                    onRemoveTransportFromInvoice={onRemoveTransportFromInvoice}
                    totalPriceWithoutTax={totalPriceWithoutTax}
                    onClose={closeTransportsModal}
                    currency={invoiceOrCreditNote?.currency ?? "EUR"}
                />
            )}
            {isModalOpen && (
                <EditDescriptionModal
                    initialDescription={description}
                    onSubmit={async (description) => {
                        onUpdateDescription(description);
                        closeModal();
                    }}
                    onClose={closeModal}
                />
            )}
        </Flex>
    );
};

type EditDescriptionModalProps = {
    initialDescription: string;
    onSubmit: (newDescription: string) => Promise<void>;
    onClose: () => void;
};

interface Values {
    description: string;
}

const getValidationSchema = () =>
    yup.object().shape({
        description: yup.string().required(t("common.mandatoryField")),
    });

const EditDescriptionModal: FunctionComponent<EditDescriptionModalProps> = ({
    initialDescription,
    onSubmit,
    onClose,
}) => {
    const handleSubmit = useCallback(
        async (values: Partial<Values>) => {
            // @ts-ignore
            await onSubmit(values.description);
            onClose();
        },
        [onSubmit, onClose]
    );

    const formik = useFormik({
        initialValues: {description: initialDescription},
        validateOnBlur: false,
        validateOnChange: false,
        enableReinitialize: true,
        validationSchema: getValidationSchema(),
        onSubmit: handleSubmit,
    });

    return (
        <Modal
            title={t("invoice.editInvoiceLine")}
            mainButton={{
                onClick: formik.submitForm,
                disabled: formik.isSubmitting,
                "data-testid": "edit-invoice-merged-line-group-description-modal-save",
                children: t("common.save"),
            }}
            secondaryButton={{
                onClick: onClose,
                "data-testid": "edit-invoice-merged-line-group-description-modal-cancel",
            }}
            onClose={onClose}
            data-testid="edit-invoice-line-group-description-modal"
        >
            <FormikProvider value={formik}>
                <Flex>
                    <Box mb={2} flexGrow={2}>
                        <TextArea
                            height={200}
                            {...formik.getFieldProps("description")}
                            label={t("common.description")}
                            // @ts-ignore
                            value={formik.values.description}
                            data-testid="edit-invoice-merged-line-group-description-modal-description"
                            onChange={(_, e) => {
                                formik.handleChange(e);
                            }}
                            error={formik.errors.description}
                        />
                    </Box>
                </Flex>
            </FormikProvider>
        </Modal>
    );
};
