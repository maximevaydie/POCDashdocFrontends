import {resolveMediaUrl} from "@dashdoc/core";
import {
    AnalyticsEvent,
    analyticsService,
    getConnectedCompany,
    getConnectedManager,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Checkbox,
    Flex,
    Link,
    LoadingWheel,
    Modal,
    RejectedSVG,
    RepliedSVG,
    ButtonProps,
    Text,
    TextInput,
    theme,
} from "@dashdoc/web-ui";
import {Form, FormikProvider, useFormik} from "formik";
import {Channel} from "pusher-js";
import React, {useCallback, useEffect, useRef, useState} from "react";

import {
    fetchExportInvoiceDocuments,
    fetchExportInvoiceDocumentsPublic,
} from "app/redux/actions/invoices";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getLastExportEvent} from "app/redux/selectors/realtime";
import {realtimeService} from "app/services/realtime/realtime.service";
import {getDocumentTypeOptions} from "app/services/transport/documentTypes.service";

type InvoiceDocumentsExportModalProps = {
    invoiceUid: string;
    fromSharing: boolean;
    onClose: () => void;
};

type InvoiceDocumentsExportSteps = "form" | "exportInProgress" | "exportSuccess" | "exportFailed";

export const ExportDocumentsModal = ({
    invoiceUid,
    fromSharing,
    onClose,
}: InvoiceDocumentsExportModalProps) => {
    const dispatch = useDispatch();
    const [currentStep, setCurrentStep] = useState<InvoiceDocumentsExportSteps>("form");

    const connectedManager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);

    //#region Download management
    const isExportGenerationInProgress = currentStep === "exportInProgress";
    const [isExportGenerationStale, setIsExportGenerationStale] = useState(false);
    const [modalOpenTimestamp] = useState(Date.now());
    const [downloadLink, setDownloadLink] = useState<string | undefined>(undefined);
    const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);
    const lastExportEvent = useSelector(getLastExportEvent);
    let publicExportChannel: Channel | null = null;

    const triggerDownload = useCallback(() => {
        downloadLinkRef.current?.click();
        setDownloadLink(undefined);
    }, [downloadLinkRef]);

    /**
     * Update download link when receiving an export event from pusher.
     */
    useEffect(() => {
        if (
            !isExportGenerationInProgress ||
            !lastExportEvent ||
            lastExportEvent.timestamp < modalOpenTimestamp /* Possible old event in Redux */ ||
            lastExportEvent.data.export.data_type !== "invoices_documents"
        ) {
            return;
        }

        if (!lastExportEvent.data.success) {
            setCurrentStep("exportFailed");
            return;
        }

        const exportUrl = resolveMediaUrl(lastExportEvent.data.export.url);
        setDownloadLink(exportUrl);
        setCurrentStep("exportSuccess");
    }, [lastExportEvent, modalOpenTimestamp, isExportGenerationInProgress]);

    /**
     * Automatically trigger the download when the link is available, except from the sharing screen
     */
    useEffect(() => {
        if (downloadLink && !fromSharing) {
            triggerDownload();
        }
    }, [downloadLink, triggerDownload, fromSharing]);

    /**
     * Mark the export as stale if it has been a long time.
     */
    useEffect(() => {
        if (!fromSharing || !isExportGenerationInProgress) {
            return;
        }

        const timer = setTimeout(() => {
            if (isExportGenerationInProgress) {
                setIsExportGenerationStale(true);
            }
        }, 30_000);

        return () => clearTimeout(timer);
    }, [fromSharing, isExportGenerationInProgress]);
    //#endregion Download management

    //#region Formik
    const documentTypeOptions = getDocumentTypeOptions().sort((option) =>
        option.value === "invoice" ? -1 : 1
    );

    const formik = useFormik({
        initialValues: {
            filename: "",
            selectedDocumentTypes: new Array(documentTypeOptions.length).fill(true) as boolean[],
            includeTransportDocuments: true,
            includeInvoiceDocuments: true,
        },
        onSubmit: (values) => {
            const selectedDocumentTypes = documentTypeOptions
                .filter((_, index) => {
                    if (index === 0) {
                        return true;
                    }
                    return (
                        values.includeTransportDocuments &&
                        values.selectedDocumentTypes[index] === true
                    );
                })
                .map((option) => option.value);

            setCurrentStep("exportInProgress");

            if (fromSharing) {
                dispatch(
                    fetchExportInvoiceDocumentsPublic(
                        invoiceUid,
                        values.filename,
                        selectedDocumentTypes,
                        values.includeInvoiceDocuments
                    )
                ).then(
                    (result: {response: {task: {id: string; status: "scheduled"}}}) => {
                        const taskId = result.response.task.id;
                        publicExportChannel?.unsubscribe();
                        publicExportChannel = realtimeService.subscribeToExportChannel(
                            taskId,
                            dispatch
                        );
                    },
                    () => {
                        setCurrentStep("exportFailed");
                        publicExportChannel?.unsubscribe();
                    }
                );
            } else {
                dispatch(
                    fetchExportInvoiceDocuments(
                        invoiceUid,
                        values.filename,
                        selectedDocumentTypes,
                        values.includeInvoiceDocuments
                    )
                );
            }

            analyticsService.sendEvent(AnalyticsEvent.invoiceDocumentsExported, {
                "is staff": connectedManager?.user.is_staff,
                "company id": connectedCompany?.pk,
                "invoice uid": invoiceUid,
            });
        },
    });
    //#endregion Formik

    const canCloseModal =
        !fromSharing || isExportGenerationStale || currentStep !== "exportInProgress";

    //#region Render functions
    const renderForm = () => {
        return (
            <FormikProvider value={formik}>
                <Form id="export-invoice-documents" onSubmit={formik.handleSubmit}>
                    <Text variant="h1" color="grey.dark" mb={3}>
                        {t("components.fileName")}
                    </Text>
                    <Box mb={5}>
                        <TextInput
                            id="export-name"
                            label={t("components.pleaseEnterExportName")}
                            type="text"
                            placeholder={t("common.name")}
                            onChange={(filename: string) =>
                                formik.setFieldValue("filename", filename)
                            }
                            value={formik.values.filename as string}
                            error={formik.errors.filename as string}
                        />
                    </Box>
                    <Text variant="h1" color="grey.dark" mb={3}>
                        {t("invoiceDocumentsExportModal.documentsToExport")}
                    </Text>
                    <Flex flexDirection="column">
                        <Checkbox
                            key={documentTypeOptions[0].value}
                            id={`selected-document-types-${0}`}
                            name={`selectedDocumentTypes[${0}]`}
                            label={documentTypeOptions[0].label}
                            checked={formik.values.selectedDocumentTypes[0]}
                            disabled={true}
                            onChange={(_, event) => formik.handleChange(event)}
                        />
                        <Checkbox
                            label={t("shareInvoice.transportAttachments")}
                            checked={formik.values.includeTransportDocuments}
                            onChange={(value) => {
                                formik.setFieldValue("includeTransportDocuments", value);
                            }}
                        />
                        {formik.values.includeTransportDocuments && (
                            <Flex flexDirection="column" pl={5} pr={0}>
                                {documentTypeOptions.slice(1).map((option, index) => (
                                    <Checkbox
                                        key={option.value}
                                        id={`selected-document-types-${index + 1}`}
                                        name={`selectedDocumentTypes[${index + 1}]`}
                                        label={option.label}
                                        checked={formik.values.selectedDocumentTypes[index + 1]}
                                        onChange={(_, event) => formik.handleChange(event)}
                                    />
                                ))}
                            </Flex>
                        )}
                        <Checkbox
                            label={t("shareInvoice.invoiceAttachments")}
                            checked={formik.values.includeInvoiceDocuments}
                            onChange={(value) => {
                                formik.setFieldValue("includeInvoiceDocuments", value);
                            }}
                        />
                    </Flex>
                </Form>
            </FormikProvider>
        );
    };

    const renderTutorial = () => {
        return (
            <Flex alignItems="center" style={{gap: "48px"}}>
                <Text>{t("invoiceDocumentsExportModal.exportsLocationHelpMessage")}</Text>
                <TutorialHelpImage myExportsButtonText={t("common.exports")} />
            </Flex>
        );
    };

    const renderExportInProgress = () => {
        return (
            <Flex flexDirection="column" alignItems="center" pb={6}>
                <Text mt={4} mb={6}>
                    {t("invoiceDocumentsExportModal.inProgress")}
                </Text>
                <LoadingWheel noMargin={true} />
            </Flex>
        );
    };

    const renderExportSucceeded = () => {
        return (
            <Flex flexDirection="column" alignItems="center">
                <RepliedSVG />
                <Text mt={4}>{t("invoiceDocumentsExportModal.success")}</Text>
            </Flex>
        );
    };

    const renderExportFailed = () => {
        return (
            <Flex flexDirection="column" alignItems="center">
                <RejectedSVG />
                <Text mt={4}>{t("invoiceDocumentsExportModal.failed")}</Text>
            </Flex>
        );
    };

    const renderBody = (currentStep: InvoiceDocumentsExportSteps) => {
        switch (currentStep) {
            case "form":
                return renderForm();
            case "exportInProgress":
                return fromSharing ? renderExportInProgress() : renderTutorial();
            case "exportSuccess":
                return fromSharing ? renderExportSucceeded() : renderTutorial();
            case "exportFailed":
                return renderExportFailed();
        }
    };

    const renderMainButton = (currentStep: InvoiceDocumentsExportSteps): ButtonProps | null => {
        switch (currentStep) {
            case "form":
                return {
                    children: t("common.export"),
                    type: "submit",
                    form: "export-invoice-documents",
                };
            case "exportInProgress":
                if (fromSharing) {
                    return canCloseModal ? {children: t("common.close"), onClick: onClose} : null;
                }
                return {children: t("common.confirmUnderstanding"), onClick: onClose};

            case "exportSuccess":
                return fromSharing
                    ? {
                          children: t("common.download"),
                          onClick: () => {
                              triggerDownload();
                              onClose();
                          },
                      }
                    : {children: t("common.confirmUnderstanding"), onClick: onClose};
            case "exportFailed":
                return {children: t("common.close"), onClick: onClose};
        }
    };
    //#endregion Render functions

    return (
        <Modal
            title={t("invoiceDocumentsExportModal.title")}
            id="export-invoice-documents-modal"
            onClose={canCloseModal ? onClose : undefined}
            mainButton={renderMainButton(currentStep)}
            secondaryButton={currentStep === "form" ? {onClick: onClose} : null}
        >
            {renderBody(currentStep)}
            <Link display="none" ref={downloadLinkRef} href={downloadLink} />
        </Modal>
    );
};

const TutorialHelpImage = ({myExportsButtonText}: {myExportsButtonText: string}) => (
    <svg
        width="300"
        height="250"
        style={{marginRight: "-24px"}}
        viewBox="0 0 200 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g clipPath="url(#clip0_560_7237)">
            <path
                d="M0 8C0 3.58172 3.58172 0 8 0H200V250H8C3.58173 250 0 246.418 0 242V8Z"
                fill="#F9FAFB"
            />
            <rect x="136.942" y="-1" width="306.334" height="674.948" fill="white" />
            <rect x="148.352" y="18.8667" width="149.446" height="16.97" fill="#DFE3E8" />
            <rect
                x="137.304"
                y="81.9202"
                width="306.334"
                height="75.3161"
                fill="white"
                stroke="#DFE3E8"
                strokeWidth="0.724194"
            />
            <circle cx="168.444" cy="128.268" r="3.25887" stroke="#DFE3E8" strokeWidth="1.44839" />
            <circle cx="168.444" cy="144.201" r="3.25887" stroke="#DFE3E8" strokeWidth="1.44839" />
            <line
                x1="168.444"
                y1="130.803"
                x2="168.444"
                y2="141.666"
                stroke="#DFE3E8"
                strokeWidth="0.724194"
            />
            <circle
                cx="150.702"
                cy="119.94"
                r="6.15565"
                fill="white"
                stroke="#919EAB"
                strokeWidth="0.724194"
            />
            <rect
                x="137.304"
                y="157.96"
                width="306.334"
                height="75.3161"
                fill="white"
                stroke="#DFE3E8"
                strokeWidth="0.724194"
            />
            <circle cx="168.444" cy="204.309" r="3.25887" stroke="#DFE3E8" strokeWidth="1.44839" />
            <circle cx="168.444" cy="220.241" r="3.25887" stroke="#DFE3E8" strokeWidth="1.44839" />
            <line
                x1="168.444"
                y1="206.844"
                x2="168.444"
                y2="217.706"
                stroke="#DFE3E8"
                strokeWidth="0.724194"
            />
            <circle
                cx="150.702"
                cy="195.981"
                r="6.15565"
                fill="white"
                stroke="#919EAB"
                strokeWidth="0.724194"
            />
            <rect
                x="137.304"
                y="234.001"
                width="306.334"
                height="75.3161"
                fill="white"
                stroke="#DFE3E8"
                strokeWidth="0.724194"
            />
            <rect x="165.352" y="89.8667" width="149.446" height="16.97" fill="#E8EDF2" />
            <rect x="165.352" y="166" width="149.446" height="16.97" fill="#E8EDF2" />
            <rect x="165" y="244" width="149.446" height="16.97" fill="#E8EDF2" />
            <rect x="165" y="110.837" width="149" height="6" fill="#E8EDF2" />
            <rect x="165" y="186.97" width="149" height="6" fill="#E8EDF2" />
            <rect x="177" y="125" width="149" height="6" fill="#F4F6F8" />
            <rect x="177" y="201.133" width="149" height="6" fill="#F4F6F8" />
            <rect x="177" y="141" width="149" height="6" fill="#F4F6F8" />
            <rect x="177" y="217.133" width="149" height="6" fill="#F4F6F8" />
            <path
                d="M81.0548 48.9823L88.4477 66.8306C88.5029 66.9636 88.5954 67.075 88.7125 67.1495C88.8296 67.224 88.9655 67.2578 89.1014 67.2463C89.2373 67.2348 89.3665 67.1785 89.4711 67.0853C89.5757 66.992 89.6506 66.8664 89.6854 66.7258L91.338 60.0271C91.3972 59.7868 91.5151 59.5676 91.6797 59.3918C91.8443 59.2161 92.0497 59.0901 92.2748 59.0267L98.5537 57.2636C98.6855 57.2265 98.8034 57.1467 98.8909 57.0352C98.9783 56.9236 99.0312 56.7858 99.0421 56.6408C99.0529 56.4958 99.0213 56.3508 98.9516 56.2258C98.8819 56.1008 98.7775 56.002 98.6528 55.9431L81.9232 48.0596C81.8021 48.0026 81.6676 47.986 81.5374 48.0119C81.4073 48.0377 81.2874 48.1049 81.1936 48.2046C81.0998 48.3043 81.0364 48.4318 81.0116 48.5706C80.9868 48.7093 81.0019 48.8529 81.0548 48.9823Z"
                fill="#B3C4FF"
                stroke={theme.colors.blue.default}
                strokeWidth="1.875"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M179.667 67.8224C180.659 66.5798 180.956 64.8462 180.29 63.28C179.324 61.0075 176.699 59.9482 174.426 60.914C172.154 61.8798 171.095 64.5049 172.06 66.7775C173.026 69.05 175.651 70.1093 177.924 69.1435C178.308 68.9801 178.658 68.7693 178.969 68.5207L181.723 71.2749C181.916 71.4677 182.228 71.4677 182.421 71.275C182.614 71.0822 182.614 70.7696 182.421 70.5768L179.667 67.8224ZM178.664 67.4674C179.619 66.492 179.949 65.001 179.381 63.6662C178.629 61.8956 176.583 61.0702 174.813 61.8227C173.042 62.5752 172.217 64.6207 172.969 66.3913C173.722 68.1619 175.767 68.9873 177.538 68.2348C177.951 68.0594 178.312 67.8138 178.614 67.5179C178.622 67.5089 178.63 67.5002 178.638 67.4916C178.647 67.4832 178.655 67.4751 178.664 67.4674Z"
                fill="#919EAB"
            />
            <line
                x1="164.823"
                y1="51.1421"
                x2="164.823"
                y2="81.5582"
                stroke="#DFE3E8"
                strokeWidth="0.724194"
            />
            <line
                x1="136.942"
                y1="50.78"
                x2="444"
                y2="50.78"
                stroke="#DFE3E8"
                strokeWidth="0.724194"
            />
            <circle
                cx="150.702"
                cy="66.35"
                r="6.15565"
                fill="white"
                stroke="#919EAB"
                strokeWidth="0.724194"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M154.397 63.5594C154.539 63.7008 154.539 63.9301 154.397 64.0715L149.509 68.9598C149.368 69.1012 149.138 69.1012 148.997 68.9598L146.824 66.7872C146.683 66.6458 146.683 66.4166 146.824 66.2752C146.966 66.1337 147.195 66.1337 147.336 66.2752L149.253 68.1917L153.885 63.5594C154.027 63.418 154.256 63.418 154.397 63.5594Z"
                fill="#919EAB"
            />
            <g clipPath="url(#clip1_560_7237)">
                <path
                    d="M19.9902 34.8777H29.9479"
                    stroke="#212B36"
                    strokeWidth="0.905242"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M19.9902 32.6145H29.9479"
                    stroke="#212B36"
                    strokeWidth="0.905242"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M19.9902 30.3516H29.9479"
                    stroke="#212B36"
                    strokeWidth="0.905242"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M31.3057 37.1409H26.7795C26.7795 37.621 26.5887 38.0815 26.2492 38.4211C25.9097 38.7606 25.4492 38.9514 24.969 38.9514C24.4888 38.9514 24.0283 38.7606 23.6888 38.4211C23.3493 38.0815 23.1585 37.621 23.1585 37.1409H18.6323C18.5128 37.1424 18.3985 37.1906 18.314 37.2752C18.2294 37.3597 18.1813 37.4739 18.1797 37.5935V40.611C18.1797 40.851 18.2751 41.0813 18.4448 41.2511C18.6146 41.4208 18.8448 41.5162 19.0849 41.5162H30.8531C31.0932 41.5162 31.3234 41.4208 31.4932 41.2511C31.6629 41.0813 31.7583 40.851 31.7583 40.611V37.5935C31.7568 37.4739 31.7086 37.3597 31.624 37.2752C31.5395 37.1906 31.4253 37.1424 31.3057 37.1409Z"
                    stroke="#212B36"
                    strokeWidth="0.905242"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
            <foreignObject x="40" y="24" width="225" height="200">
                <Text fontSize={3} color="grey.dark" fontWeight="300">
                    {myExportsButtonText}
                </Text>
            </foreignObject>
            <g filter="url(#filter0_d_560_7237)">
                <rect
                    x="-567.113"
                    y="111.293"
                    width="687.141"
                    height="418.603"
                    rx="3.94908"
                    fill="white"
                />
            </g>
            <rect x="-23.3323" y="111.293" width="55.2776" height="27.7505" fill="#F4F6F8" />
            <rect x="31.9414" y="111.293" width="47.5644" height="27.7505" fill="#F4F6F8" />
            <rect x="79.5059" y="111.293" width="40.494" height="27.7505" fill="#F4F6F8" />
            <rect
                x="13.6688"
                y="78.1471"
                width="105.575"
                height="22.5312"
                rx="1.60937"
                fill="#F6F6F6"
                stroke="#DFE3E8"
                strokeWidth="0.643747"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M106.244 90.8852C106.37 91.0109 106.574 91.0109 106.7 90.8852L108.497 89.0873C108.7 88.8845 108.557 88.5378 108.27 88.5378H104.674C104.387 88.5378 104.244 88.8845 104.446 89.0873L106.244 90.8852Z"
                fill="#212B36"
            />
            <rect
                x="-101.678"
                y="78.0494"
                width="105.575"
                height="22.5312"
                rx="1.60937"
                fill="#F6F6F6"
                stroke="#DFE3E8"
                strokeWidth="0.643747"
            />
            <rect y="163" width="120" height="24" fill="#F9FAFB" />
            <rect y="211" width="120" height="24" fill="#F9FAFB" />
            <rect x="48" y="120" width="64" height="8" fill="#E8EDF2" />
            <rect x="-34" y="120" width="64" height="8" fill="#E8EDF2" />
        </g>
        <defs>
            <filter
                id="filter0_d_560_7237"
                x="-576.14"
                y="103.395"
                width="705.194"
                height="436.656"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
            >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="1.12831" />
                <feGaussianBlur stdDeviation="4.51324" />
                <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0.129412 0 0 0 0 0.168627 0 0 0 0 0.211765 0 0 0 0.08 0"
                />
                <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_560_7237"
                />
                <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_560_7237"
                    result="shape"
                />
            </filter>
            <clipPath id="clip0_560_7237">
                <path
                    d="M0 8C0 3.58172 3.58172 0 8 0H200V250H8C3.58173 250 0 246.418 0 242V8Z"
                    fill="white"
                />
            </clipPath>
            <clipPath id="clip1_560_7237">
                <rect
                    width="14.4839"
                    height="14.4839"
                    fill="white"
                    transform="translate(17.7275 28.6919)"
                />
            </clipPath>
        </defs>
    </svg>
);
