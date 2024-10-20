import {resolveMediaUrl} from "@dashdoc/core";
import {StaticImage, getConnectedManager} from "@dashdoc/web-common";
import {ExportMethod} from "@dashdoc/web-common/src/features/export/types";
import {queryService, t} from "@dashdoc/web-core";
import {Box, Flex, Link, Modal, Radio, RadioProps, Text, TextInput} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React, {useEffect, useRef, useState} from "react";

import {fetchExportTruckerStats} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getLastExportEvent, getTruckerStatsCurrentQuery} from "app/redux/selectors";

type TruckerStatsExportFormProps = {
    exportMethod: ExportMethod;
    email?: string;
};

type Props = {
    onClose: () => void;
};

export function TruckerStatsExportModal({onClose}: Props) {
    const truckerStatsExportRadioOptions: Record<ExportMethod, RadioProps> = {
        download: {
            label: t("common.download"),
            value: "download",
            name: "truckerStatsExportMethod",
        },
        email: {
            label: t("common.sendViaEmail"),
            value: "email",
            name: "truckerStatsExportMethod",
        },
    };

    const dispatch = useDispatch();
    const query = useSelector(getTruckerStatsCurrentQuery);
    const connectedManager = useSelector(getConnectedManager);
    const lastExportEvent = useSelector(getLastExportEvent);

    const [isLoading, setIsLoading] = useState(false);
    const [downloadLink, setDownloadLink] = useState<string | undefined>(undefined);
    const [exportMethod, setSelectedExportMethod] = useState<ExportMethod>("download");

    const handleSubmit = async (values: TruckerStatsExportFormProps) => {
        setIsLoading(true);
        const exportMethod = values.exportMethod;
        const email = values.email;

        const filters = queryService.toQueryString(query);
        // @ts-ignore
        await dispatch(fetchExportTruckerStats(filters, exportMethod, email));

        if (exportMethod === "email") {
            onClose();
        }
    };

    const formik = useFormik({
        initialValues: {
            exportMethod,
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
            if (data?.success && data?.export.data_type === "truckers_stats") {
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
            title={t("components.exportTruckerStats")}
            id="export-trucker-stats-modal"
            data-testid="trucker-stats-export-modal"
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
                    <StaticImage src="exports-truckers-stats.gif" />
                </>
            ) : (
                <Box>
                    <FormikProvider value={formik}>
                        <Flex flexDirection="column" mb={1}>
                            {Object.entries(truckerStatsExportRadioOptions).map(
                                ([option, {label, value, name}]) => (
                                    <Radio
                                        key={option}
                                        name={name}
                                        label={label}
                                        value={value}
                                        onChange={(option: ExportMethod) =>
                                            setSelectedExportMethod(option)
                                        }
                                        checked={exportMethod === option}
                                    />
                                )
                            )}
                        </Flex>
                        {exportMethod === "email" && (
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
                        <Link display="none" ref={downloadLinkRef} href={downloadLink} />
                    </FormikProvider>
                </Box>
            )}
        </Modal>
    );
}
