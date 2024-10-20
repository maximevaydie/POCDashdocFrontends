import {resolveMediaUrl} from "@dashdoc/core";
import {apiService, StaticImage} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    DateRangePicker,
    dateRangePickerStaticRanges,
    Link,
    Modal,
    ModeTypeSelector,
    DateRangePickerRange,
    toast,
    Text,
    Callout,
} from "@dashdoc/web-ui";
import {APIVersion, formatDate, yup} from "dashdoc-utils";
import {endOfMonth, startOfMonth} from "date-fns";
import {useFormik} from "formik";
import React, {useState, useRef, useEffect} from "react";

import {
    exportService,
    FleetType,
} from "app/features/fleet/unavailabilities/export/exportUnavailabilities.service";
import {useSelector} from "app/redux/hooks";
import {getLastExportEvent} from "app/redux/selectors/realtime";

type ExportMode = "list" | "planning";

type FormValues = {range: DateRangePickerRange; exportMode: ExportMode};

export const ExportUnavailabilityModal = ({
    type,
    onClose,
}: {
    type: FleetType;
    onClose: () => void;
}) => {
    const lastExportEvent = useSelector(getLastExportEvent);
    const [isLoading, setIsLoading] = useState(false);
    const [downloadLink, setDownloadLink] = useState<string | undefined>(undefined);
    const downloadLinkRef = useRef(null);
    // @ts-ignore
    const triggerDownload = () => downloadLinkRef.current.click();

    // When we receive the export data, we update the link to download the file,
    // and trigger the callback
    useEffect(() => {
        if (
            isLoading &&
            lastExportEvent?.data.success &&
            [
                "truckers_unavailabilities",
                "truckers_planning",
                "fleet_unavailabilities",
                "fleet_planning",
            ].includes(lastExportEvent.data.export.data_type)
        ) {
            const exportUrl = resolveMediaUrl(lastExportEvent.data.export.url);
            setDownloadLink(exportUrl);
            setIsLoading(false);
        }
    }, [lastExportEvent]);

    // When the download link is updated, we trigger the download
    useEffect(() => {
        if (downloadLink) {
            triggerDownload();
            onClose();
        }
    }, [downloadLink]);

    const formik = useFormik<FormValues>({
        initialValues: {
            range: {
                startDate: startOfMonth(new Date()),
                endDate: endOfMonth(new Date()),
            },
            exportMode: "list",
        },
        validationSchema: yup.object({
            range: yup.object({
                startDate: yup.string().required(t("common.mandatoryField")),
                endDate: yup.string().required(t("common.mandatoryField")),
            }),
            exportMode: yup
                .string()
                .oneOf(["list", "planning"])
                .required(t("common.mandatoryField")),
        }),
        onSubmit: handleSubmit,
    });

    return (
        <Modal
            title={t(exportService.getLabelKey(type))}
            data-testid="export-unavailability-modal"
            onClose={onClose}
            mainButton={{
                children: t("common.export"),
                loading: formik.isSubmitting,
                onClick: formik.submitForm,
            }}
            secondaryButton={{}}
        >
            {isLoading ? (
                <>
                    <Text mb={2}>{t("components.waitForDownloadOrExportsTabBootstrap")}</Text>
                    <StaticImage src="exports-truckers-stats.gif" />
                </>
            ) : (
                <>
                    <Text variant="h2" mb={2}>
                        {t("unavailabilities.export.mode")}
                    </Text>
                    <ModeTypeSelector<ExportMode>
                        modeList={[
                            {
                                value: "list",
                                label:
                                    type === "truckers"
                                        ? t("absences.export.list")
                                        : t("unavailabilities.export.list"),
                                icon: "list",
                            },
                            {
                                value: "planning",
                                label:
                                    type === "truckers"
                                        ? t("absences.export.planning")
                                        : t("unavailabilities.export.planning"),
                                icon: "calendar",
                            },
                        ]}
                        currentMode={formik.values.exportMode}
                        setCurrentMode={(value) => formik.setFieldValue("exportMode", value)}
                    />
                    <Callout variant="informative" mt={3}>
                        {formik.values.exportMode === "list"
                            ? type === "truckers"
                                ? t("absences.export.list.details")
                                : t("unavailabilities.export.list.details")
                            : type === "truckers"
                              ? t("absences.export.planning.details")
                              : t("unavailabilities.export.planning.details")}
                    </Callout>
                    <Box mt={3}>
                        <DateRangePicker
                            range={formik.values.range}
                            onChange={(value) => formik.setFieldValue("range", value)}
                            rootId="react-app-modal-root"
                            label={t("common.fromDateToDate", {
                                start: formatDate(formik.values.range.startDate, "P"),
                                end: formatDate(formik.values.range.endDate, "P"),
                            })}
                            staticRanges={{
                                month: dateRangePickerStaticRanges["month"],
                                last_month: dateRangePickerStaticRanges["last_month"],
                                last_year: dateRangePickerStaticRanges["year"],
                            }}
                        />
                    </Box>
                    <Link display="none" ref={downloadLinkRef} href={downloadLink} />
                </>
            )}
        </Modal>
    );

    async function handleSubmit(values: FormValues) {
        setIsLoading(true);

        // default type == "truckers"
        let apiVersion = "web" as APIVersion;
        let url =
            values.exportMode === "list"
                ? "/manager-truckers/export-unavailabilities/"
                : "/manager-truckers/export-planning/";
        if (type == "plates") {
            apiVersion = "v4";
            url =
                values.exportMode === "list"
                    ? "/vehicles/export-unavailabilities/"
                    : "/vehicles/export-planning/";
        }

        try {
            const result = await apiService.post(
                url,
                {
                    period_start: values.range.startDate,
                    period_end: values.range.endDate,
                    export_type: "xlsx",
                },
                {apiVersion}
            );
            if (result.file_url) {
                toast.success(t("export.fleet_unavailabilities.success"));
            } else {
                toast.error(t("export.fleet_unavailabilities.error"));
            }
        } catch (error) {
            toast.error(t("common.error"));
        }
    }
};
