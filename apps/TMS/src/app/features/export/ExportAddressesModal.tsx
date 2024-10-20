import {resolveMediaUrl} from "@dashdoc/core";
import {getConnectedManager, StaticImage} from "@dashdoc/web-common";
import {ExportMethod} from "@dashdoc/web-common/src/features/export/types";
import {queryService, t} from "@dashdoc/web-core";
import {Box, Flex, Link, Modal, Radio, RadioProps, Text, TextInput} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {FormikProvider, useFormik} from "formik";
import React, {useEffect, useRef, useState} from "react";

import {
    fetchExportLogisticPoints,
    fetchExportLogisticPointsFromCompanies,
} from "app/redux/actions/logisticPoints";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    getLastExportEvent,
    getLogisticPointsCurrentQuery,
    getPartnersCurrentQuery,
} from "app/redux/selectors";

type AddressesExportFormProps = {
    exportMethod: ExportMethod;
    exportName: string;
    email?: string;
};

type ExportAddressModalProps = {
    entities: "companies" | "addresses";
    allEntitiesSelected: boolean;
    isShipperExport?: boolean;
    allEntitiesCount: number;
    selectedEntities: Array<number | string>;
    onClose: () => void;
};

export function ExportAddressesModal({
    allEntitiesSelected,
    isShipperExport,
    allEntitiesCount,
    selectedEntities,
    entities,
    onClose,
}: ExportAddressModalProps) {
    const addressesExportRadioOptions: Record<ExportMethod, RadioProps> = {
        download: {label: t("common.download"), value: "download", name: "addressesExportMethod"},
        email: {label: t("common.sendViaEmail"), value: "email", name: "addressesExportMethod"},
    };

    const dispatch = useDispatch();
    const querySelectorFn =
        entities === "companies" ? getPartnersCurrentQuery : getLogisticPointsCurrentQuery;

    const query = useSelector(querySelectorFn);
    const lastExportEvent = useSelector(getLastExportEvent);
    const connectedManager = useSelector(getConnectedManager);
    const email = connectedManager?.user?.email;

    const [isLoading, setIsLoading] = useState(false);
    const [exportMethod, setSelectedExportMethod] = useState<ExportMethod>("download");
    const [downloadLink, setDownloadLink] = useState<string | undefined>(undefined);

    const entitiesCount = allEntitiesSelected ? allEntitiesCount : selectedEntities.length;

    const handleSubmit = async (values: AddressesExportFormProps) => {
        // @ts-ignore
        setIsLoading(true);
        const email = values.email;
        const exportMethod = values.exportMethod;
        const exportName = values.exportName;

        const filters = queryService.toQueryString(
            allEntitiesSelected ? query : {id__in: selectedEntities}
        );

        if (entities == "companies") {
            await dispatch(
                fetchExportLogisticPointsFromCompanies(
                    filters,
                    exportName,
                    exportMethod,
                    email,
                    isShipperExport
                )
            );
        } else {
            // entities == "addresses"
            await dispatch(
                // @ts-ignore
                fetchExportLogisticPoints(filters, exportName, exportMethod, email)
            );
        }

        if (exportMethod === "email") {
            // @ts-ignore
            setIsLoading(false);
            onClose();
        }
    };

    const formik = useFormik({
        initialValues: {
            exportName: "",
            exportMethod,
            email,
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
            if (data?.success && data?.export.data_type === "address_book") {
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
            title={t("components.addressBookExportModalTitle")}
            id="export-addresses-modal"
            onClose={onClose}
            data-testid="export-addresses-modal"
            secondaryButton={{
                children: isLoading ? t("common.close") : t("common.cancel"),
            }}
            mainButton={{
                type: "submit",
                children: t("common.export"),
                onClick: formik.submitForm,
                loading: isLoading,
                disabled: isLoading || allEntitiesCount === 0,
            }}
        >
            {isLoading && exportMethod === "download" ? (
                <>
                    <Text mb={2}>{t("components.waitForDownloadOrExportsTab")}</Text>
                    <StaticImage src="exports-addresses.gif" />
                </>
            ) : (
                <FormikProvider value={formik}>
                    <Flex flexDirection="column" mb={1}>
                        {Object.entries(addressesExportRadioOptions).map(
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
                        <Box mb={2}>
                            <TextInput
                                {...formik.getFieldProps("email")}
                                data-testid="input-email"
                                label={t("common.email")}
                                placeholder={t("common.email")}
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
                    <Text variant="h1" as="h4" textAlign="center" data-testid="export-count">
                        {t(
                            entities === "companies"
                                ? "components.exportCompaniesAddressesCount"
                                : "components.exportAddressesCount",
                            {
                                count: entitiesCount,
                                smart_count: entitiesCount,
                            }
                        )}
                    </Text>
                </FormikProvider>
            )}
            <Link display="none" ref={downloadLinkRef} href={downloadLink} />
        </Modal>
    );
}
