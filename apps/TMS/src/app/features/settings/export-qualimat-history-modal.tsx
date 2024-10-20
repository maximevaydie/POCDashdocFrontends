import {resolveMediaUrl} from "@dashdoc/core";
import {getConnectedManager, StaticImage} from "@dashdoc/web-common";
import {queryService, t} from "@dashdoc/web-core";
import {Box, Flex, Link, Modal, Radio, Text, TextInput, RadioProps} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React, {FunctionComponent, useEffect, useRef, useState} from "react";

import {
    fetchExportTrailersQualimatHistory,
    fetchExportVehiclesQualimatHistory,
} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getLastExportEvent, getPlatesCurrentQuery} from "app/redux/selectors";

type ExportQualimatHistoryMethod = "download" | "email";

type ExportQualimatHistoryFormProps = {
    exportMethod: ExportQualimatHistoryMethod;
    exportName: string;
    email?: string;
};

type ExportQualimatHistoryModalProps = {
    fleetType: "vehicles" | "trailers";
    selectedPlates: number[];
    allPlatesSelected: boolean;
    totalCount: number;
    onClose: () => void;
};

const ExportQualimatHistoryModal: FunctionComponent<ExportQualimatHistoryModalProps> = ({
    fleetType,
    selectedPlates,
    allPlatesSelected,
    totalCount,
    onClose,
}) => {
    const qualimatHistoryExportRadioOptions: Record<ExportQualimatHistoryMethod, RadioProps> = {
        download: {label: t("common.download"), value: "download", name: "qualimatExportMethod"},
        email: {label: t("common.sendViaEmail"), value: "email", name: "qualimatExportMethod"},
    };

    const dispatch = useDispatch();
    const query = useSelector(getPlatesCurrentQuery(fleetType));
    const connectedManager = useSelector(getConnectedManager);
    const lastExportEvent = useSelector(getLastExportEvent);

    const [isLoading, setIsLoading] = useState(false);
    const [downloadLink, setDownloadLink] = useState<string | undefined>(undefined);
    const [exportMethod, setSelectedExportMethod] =
        useState<ExportQualimatHistoryMethod>("download");

    const platesCount = allPlatesSelected ? totalCount : selectedPlates.length;

    const handleSubmit = async (values: ExportQualimatHistoryFormProps) => {
        setIsLoading(true);
        const fetchFunction =
            fleetType === "vehicles"
                ? fetchExportVehiclesQualimatHistory
                : fetchExportTrailersQualimatHistory;

        const email = values.email;
        const exportMethod = values.exportMethod;
        const exportName = values.exportName;
        const filters = queryService.toQueryString(
            allPlatesSelected
                ? query
                : {
                      ...query,
                      id__in: selectedPlates,
                  }
        );

        await dispatch(fetchFunction(filters, exportName, exportMethod, email));

        if (exportMethod === "email") {
            setIsLoading(false);
            onClose();
        }
    };

    const formik = useFormik({
        initialValues: {
            exportMethod,
            exportName: "",
            email: (exportMethod === "email" && connectedManager?.user?.email) || "",
        },
        enableReinitialize: true,
        validationSchema:
            exportMethod === "email" &&
            yup.object().shape({
                email: yup
                    .string()
                    .required(t("login.errors.email.empty"))
                    .email(t("errors.email.invalid")),
            }),
        onSubmit: handleSubmit,
    });

    const downloadLinkRef = useRef(null);
    // @ts-ignore
    const triggerDownload = () => downloadLinkRef.current.click();

    useEffect(() => {
        if (isLoading && exportMethod == "download") {
            const data = lastExportEvent?.data;
            if (data?.success && data?.export.data_type === "qualimat_history") {
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
            title={t("qualimatExportModal.exportQualimatHistoryTitle")}
            id="qualimat-history-export-modal"
            data-testid="qualimat-history-export-modal"
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
            {isLoading && exportMethod === "download" ? (
                <>
                    <Text mb={2}>{t("components.waitForDownloadOrExportsTabBootstrap")}</Text>
                    <StaticImage src="exports-qualimat.gif" />
                </>
            ) : (
                <FormikProvider value={formik}>
                    <Flex flexDirection="column" mb={1}>
                        {Object.entries(qualimatHistoryExportRadioOptions).map(
                            ([option, {label, value, name}]) => (
                                <Radio
                                    key={option}
                                    name={name}
                                    label={label}
                                    value={value}
                                    onChange={(option: ExportQualimatHistoryMethod) =>
                                        setSelectedExportMethod(option)
                                    }
                                    checked={exportMethod === option}
                                />
                            )
                        )}
                    </Flex>
                    {exportMethod === "email" && (
                        <Box mb={2}>
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
                    <Box mb={3}>
                        <TextInput
                            {...formik.getFieldProps("exportName")}
                            id="export-name"
                            label={t("components.pleaseEnterExportName")}
                            type="text"
                            placeholder={t("common.name")}
                            onChange={(_, e) => {
                                formik.handleChange(e);
                            }}
                        />
                    </Box>
                    <Link display="none" ref={downloadLinkRef} href={downloadLink} />
                    <Text textAlign="center" variant="h1">
                        {t(
                            fleetType === "vehicles"
                                ? "qualimatExportModal.exportVehiclesQualimatHistoryCount"
                                : "qualimatExportModal.exportTrailersQualimatHistoryCount",
                            {
                                count: platesCount,
                                smart_count: platesCount,
                            }
                        )}
                    </Text>
                </FormikProvider>
            )}
        </Modal>
    );
};

export default ExportQualimatHistoryModal;
