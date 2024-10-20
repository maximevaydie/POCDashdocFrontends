import {resolveMediaUrl} from "@dashdoc/core";
import {getConnectedManager} from "@dashdoc/web-common";
import {ExportMethod} from "@dashdoc/web-common/src/features/export/types";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Link, Modal, Radio, Text, TextInput, RadioProps} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React, {useEffect, useRef, useState} from "react";

import {useSelector} from "app/redux/hooks";
import {getLastExportEvent} from "app/redux/selectors";

export type ExportFileType = "xlsx" | "csv";

type ExportDataType =
    | "deliveries"
    | "custom_deliveries"
    | "address_book"
    | "invoices"
    | "truckers"
    | "trucker_stats"
    | "qualimat_history";

type ExportFormProps = {
    exportMethod: ExportMethod;
    fileType: ExportFileType;
    email?: string;
};

type ExportModalProps = {
    allowedFileTypes: ExportFileType[];
    fileTypeLabel?: string;
    allowedExportMethods: ExportMethod[];
    exportMethodLabel?: string;
    dataType: ExportDataType;
    objectsSelectedText?: string;
    onExport: (fileType: ExportFileType, exportMethod: ExportMethod, email?: string) => void;
    onClose: () => void;
};

export function ExportModal({
    dataType,
    onClose,
    onExport,
    allowedFileTypes,
    fileTypeLabel,
    allowedExportMethods,
    exportMethodLabel,
    objectsSelectedText,
}: ExportModalProps) {
    const exportMethodRadioOptions: Record<ExportMethod, RadioProps> = {
        download: {
            label: t("common.download"),
            value: "download",
        },
        email: {
            label: t("common.sendViaEmail"),
            value: "email",
        },
    };

    const fileTypeRadioOptions: Record<ExportFileType, RadioProps> = {
        xlsx: {
            label: t("common.excelFormat"),
            value: "xlsx",
        },
        csv: {
            label: t("common.csvFormat"),
            value: "csv",
        },
    };

    const connectedManager = useSelector(getConnectedManager);
    const lastExportEvent = useSelector(getLastExportEvent);

    const [isLoading, setIsLoading] = useState(false);
    const [downloadLink, setDownloadLink] = useState<string | undefined>(undefined);

    const handleSubmit = async (values: ExportFormProps) => {
        setIsLoading(true);
        const fileType = values.fileType;
        const exportMethod = values.exportMethod;
        const email = values.email;

        onExport(fileType, exportMethod, email);

        if (exportMethod === "email") {
            onClose();
        }
    };

    const formik = useFormik({
        initialValues: {
            exportMethod: allowedExportMethods[0],
            fileType: allowedFileTypes[0],
            email: (allowedExportMethods[0] === "email" && connectedManager?.user?.email) || "",
        },
        enableReinitialize: true,
        validationSchema: yup.object().shape({
            email: yup.string().when("exportMethod", {
                is: (exportMethod: ExportMethod) => exportMethod === "email",
                then: yup
                    .string()
                    .required(t("login.errors.email.empty"))
                    .email(t("errors.email.invalid")),
            }),
        }),
        onSubmit: handleSubmit,
    });

    const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);
    const triggerDownload = () => downloadLinkRef.current?.click();

    useEffect(() => {
        if (isLoading && formik.values.exportMethod == "download") {
            const data = lastExportEvent?.data;
            if (data?.success && data?.export.data_type === dataType) {
                const exportUrl = resolveMediaUrl(data.export.url);
                setDownloadLink(exportUrl);
                setIsLoading(false);
            }
        }
    }, [lastExportEvent]);

    useEffect(() => {
        if (downloadLink) {
            triggerDownload();
            onClose();
        }
    }, [downloadLink]);

    return (
        <Modal
            title={t("common.export")}
            id="export-modal"
            data-testid="export-modal"
            onClose={onClose}
            mainButton={{
                children: t("common.export"),
                onClick: formik.submitForm,
                loading: isLoading,
            }}
            secondaryButton={{
                children: isLoading ? t("common.close") : t("common.cancel"),
            }}
        >
            {isLoading && formik.values.exportMethod === "download" ? (
                <>
                    <Text mb={2} variant="h1">
                        {t("components.waitForDownloadOrExportsTabBootstrap")}
                    </Text>
                </>
            ) : (
                <Box>
                    <FormikProvider value={formik}>
                        {allowedFileTypes.length > 1 && (
                            <>
                                <Text mb={4}>
                                    {fileTypeLabel || t("exportModal.exportFormat")}
                                </Text>
                                <Flex flexDirection="column">
                                    {Object.entries(fileTypeRadioOptions).map(
                                        ([option, {label, value, name}]) => (
                                            <Radio
                                                key={option}
                                                name={name}
                                                label={label}
                                                value={value}
                                                onChange={(option: ExportFileType) =>
                                                    formik.setFieldValue("fileType", option)
                                                }
                                                checked={formik.values.fileType === option}
                                            />
                                        )
                                    )}
                                </Flex>

                                {objectsSelectedText && (
                                    <Text textAlign="center">{objectsSelectedText}</Text>
                                )}
                            </>
                        )}
                        {allowedExportMethods.length > 1 && (
                            <>
                                <Text mt={1} variant="captionBold">
                                    {exportMethodLabel || t("exportModal.exportMethod")}
                                </Text>
                                <Flex flexDirection="column">
                                    {Object.entries(exportMethodRadioOptions).map(
                                        ([option, {label, value, name}]) => (
                                            <Radio
                                                key={option}
                                                name={name}
                                                label={label}
                                                value={value}
                                                onChange={(option: ExportMethod) =>
                                                    formik.setFieldValue("exportMethod", option)
                                                }
                                                checked={formik.values.exportMethod === option}
                                            />
                                        )
                                    )}
                                </Flex>
                                {formik.values.exportMethod === "email" && (
                                    <Box mb={3}>
                                        <TextInput
                                            {...formik.getFieldProps("email")}
                                            data-testid="input-email"
                                            label={t("common.email")}
                                            placeholder={t("common.typeHere")}
                                            onChange={(_, e) => {
                                                formik.handleChange(e);
                                            }}
                                            error={formik.errors.email}
                                            required
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                        <Link display="none" ref={downloadLinkRef} href={downloadLink} />
                    </FormikProvider>
                </Box>
            )}
        </Modal>
    );
}
