import {useTimezone} from "@dashdoc/web-common";
import {getLoadCategoryLabel, Logger, SelectOption, t} from "@dashdoc/web-core";
import {
    BadgeList,
    Box,
    Callout,
    ConfirmationModal,
    DatePicker,
    Flex,
    Icon,
    Modal,
    Text,
    toast,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {
    formatDate,
    parseAndZoneDate,
    parseDate,
    PricingMetricKey,
    useToggle,
    yup,
} from "dashdoc-utils";
import {isSameDay} from "date-fns";
import {useFormik} from "formik";
import isEqual from "lodash.isequal";
import React, {FC, useMemo} from "react";

import {MultipleZonesBanner} from "app/features/pricing/tariff-grids/components/MultipleZonesBanner";
import {TariffGridBuildingGuide} from "app/features/pricing/tariff-grids/components/TariffGridBuildingGuide";
import {UpdateOrDeleteTariffGridConfirmationMessage} from "app/features/pricing/tariff-grids/components/UpdateOrDeleteTariffGridConfirmationMessage";
import {ActionButton} from "app/features/pricing/tariff-grids/modals/tariff-grid-version-modal/ActionButton";
import {ApplicationDateTypeSelect} from "app/features/pricing/tariff-grids/modals/tariff-grid-version-modal/ApplicationDateTypeSelect";
import {IncreaseOrDecreaseActionButton} from "app/features/pricing/tariff-grids/modals/tariff-grid-version-modal/IncreaseOrDecreaseActionButton";
import {TariffGridDisabledCallout} from "app/features/pricing/tariff-grids/modals/tariff-grid-version-modal/TariffGridDisabledCallout";
import {tableService} from "app/features/pricing/tariff-grids/table/table.service";
import {TariffGridTable} from "app/features/pricing/tariff-grids/table/TariffGridTable";
import {tariffGridService} from "app/features/pricing/tariff-grids/tariffGrid.service";
import {hasVersionMultipleZones} from "app/features/pricing/tariff-grids/tariffGridVersion.service";
import {
    ApplicationDateType,
    TariffGrid,
    TariffGridOwnerType,
    TariffGridVersion,
    TariffGridVersionCreationRequest,
    TariffGridVersionError,
    TariffGridVersionUpdateRequest,
} from "app/features/pricing/tariff-grids/types";
import {getLineHeadersUpdatePayload} from "app/features/pricing/tariff-grids/upsert.service";
import {getMetricLabel} from "app/services/invoicing";
import {tariffGridVersionsApiService} from "app/services/tariffs/tariffGridVersionsApi.service";

type TariffGridVersionForm = {
    startDate: Date | null;
    applicationDateType: SelectOption<ApplicationDateType> | null;
    tariffGridVersion: TariffGridVersion;
};

type TariffGridVersionModalProps = {
    rootId: string;
    tariffGrid: TariffGrid;
    tariffGridVersion?: TariffGridVersion;
    onClose: () => unknown;
    onSubmit: () => unknown;
    onDelete: () => unknown;
};

/**
 * This component is used to create , edit or delete a tariff grid version.
 *
 * If a `tariffGridVersion` is given in props we're editing an existing version otherwise we're creating a new one.
 */
export const TariffGridVersionModal: FC<TariffGridVersionModalProps> = ({
    rootId,
    tariffGrid,
    tariffGridVersion,
    onClose,
    onSubmit,
    onDelete,
}) => {
    const mode = useMemo(
        () => (tariffGridVersion === undefined ? "create" : "edit"),
        [tariffGridVersion?.uid]
    );

    const timezone = useTimezone();
    const today = parseAndZoneDate(new Date(), timezone) as Date;

    const [showConfirmationModal, openConfirmationModal, closeConfirmationModal] =
        useToggle(false);

    const handleCreateTariffGridVersion = async (values: TariffGridVersionForm) => {
        const lineHeadersCreationRequest = getLineHeadersUpdatePayload(
            values.tariffGridVersion.line_headers
        );
        const tariffGridVersionCreationRequest: TariffGridVersionCreationRequest = {
            tariff_grid_uid: tariffGrid.uid,
            start_date: formatDate(values.startDate, "yyyy-MM-dd"),
            application_date_type:
                tariffGrid.application_date_type === null
                    ? (values.applicationDateType?.value as ApplicationDateType)
                    : undefined,
            metric_steps: values.tariffGridVersion.metric_steps,
            table: values.tariffGridVersion.table,
            line_headers: lineHeadersCreationRequest,
        };

        try {
            await tariffGridVersionsApiService.post({data: tariffGridVersionCreationRequest});
            toast.success(t("tariffGridVersion.successfullyCreated"));
            onSubmit();
        } catch (error) {
            await handleError(error);
        }
    };

    const handleUpdateTariffGridVersion = async (values: TariffGridVersionForm) => {
        if (tariffGridVersion === undefined) {
            return;
        }

        const tariffGridVersionStartDate = parseDate(tariffGridVersion.start_date) as Date;
        const tariffGridVersionUpdateRequest: TariffGridVersionUpdateRequest = {
            start_date: !isSameDay(values.startDate as Date, tariffGridVersionStartDate)
                ? formatDate(values.startDate, "yyyy-MM-dd")
                : undefined,
            metric_steps: !isEqual(
                values.tariffGridVersion.metric_steps,
                tariffGridVersion.metric_steps
            )
                ? values.tariffGridVersion.metric_steps
                : undefined,
            line_headers: !isEqual(
                values.tariffGridVersion.line_headers,
                tariffGridVersion.line_headers
            )
                ? getLineHeadersUpdatePayload(values.tariffGridVersion.line_headers)
                : undefined,
            table: !isEqual(values.tariffGridVersion.table, tariffGridVersion.table)
                ? values.tariffGridVersion.table
                : undefined,
        };

        try {
            await tariffGridVersionsApiService.patch(tariffGridVersion.uid, {
                data: tariffGridVersionUpdateRequest,
            });
            toast.success(t("tariffGridVersion.successfullyUpdated"));
            onSubmit();
        } catch (error) {
            await handleError(error);
        }
    };

    const handleDeleteTariffGridVersion = async () => {
        if (tariffGridVersion === undefined) {
            return;
        }

        try {
            await tariffGridVersionsApiService.delete(tariffGridVersion.uid);
            toast.success(t("tariffGridVersion.successfullyDeleted"));
            onDelete();
        } catch (error) {
            await handleError(error);
        }
    };

    const handleError = async (error: any) => {
        Logger.error(error);

        const errorJson = await error.json();
        const errorCode: TariffGridVersionError | undefined =
            errorJson["non_field_errors"]?.code[0];

        switch (errorCode) {
            case "application_date_type_already_defined":
                formik.setFieldError(
                    "applicationDateType",
                    t("tariffGridVersion.applicationDateTypeAlreadyDefined")
                );
                break;
            case "duplicate_tariff_grid_version_start_date":
                formik.setFieldError(
                    "startDate",
                    t("tariffGridVersion.duplicateTariffGridVersionStartDate")
                );
                break;
            case "missing_application_date_type":
                formik.setFieldError("applicationDateType", t("common.mandatoryField"));
                break;
            case "start_date_before_today":
                formik.setFieldError(
                    "startDate",
                    t("tariffGridVersion.startDateBeforeToday", {
                        date: formatDate(today, "P"),
                    })
                );
                break;
            case "cannot_delete_current_tariff_grid_version":
                toast.error(t("tariffGridVersion.cannotDeleteCurrentTariffGridVersion"));
                break;
            case "cannot_delete_past_tariff_grid_version":
                toast.error(t("tariffGridVersion.cannotDeletePastTariffGridVersion"));
                break;
            default:
                toast.error(t("common.error"));
                break;
        }
    };

    const formik = useFormik<TariffGridVersionForm>({
        initialValues: {
            startDate: parseDate(tariffGridVersion?.start_date),
            applicationDateType:
                tariffGridService
                    .getApplicationDateTypeOptions()
                    .find((option) => option.value === tariffGrid.application_date_type) ?? null,
            tariffGridVersion: tariffGridVersion ?? tariffGrid.current_version,
        },
        validationSchema: yup.object().shape({
            startDate: yup.date().nullable().required(t("common.mandatoryField")),
            applicationDateType: yup.mixed().nullable().required(t("common.mandatoryField")),
            tariffGridVersion: yup.object().shape({
                metric_steps: yup.array().of(yup.number()).required(),
                line_headers: yup.object().required(),
                table: yup
                    .array()
                    .of(yup.array())
                    .test(
                        "tableWithoutEmptyCell",
                        t("tariffGrids.GridCannotHaveEmptyCell"),
                        (table: number[][]) =>
                            table.every(
                                (line) => line.length > 0 && line.every((cell) => !isNaN(cell))
                            )
                    )
                    .required(t("common.mandatoryField")),
            }),
        }),
        onSubmit: (values) => {
            if (tariffGridVersion !== undefined) {
                handleUpdateTariffGridVersion(values);
            } else {
                handleCreateTariffGridVersion(values);
            }
        },
        validateOnChange: false,
    });

    const isPurchaseTariffGrid = tariffGrid.owner_type === TariffGridOwnerType.SHIPPER;
    const hasMultipleZones = hasVersionMultipleZones(formik.values.tariffGridVersion);

    const [
        displayTariffGridBuildingGuide,
        showTariffGridBuildingGuide,
        hideTariffGridBuildingGuide,
    ] = useToggle();

    return (
        <>
            <Modal
                rootId={rootId}
                size={"xlarge"}
                title={
                    mode === "create"
                        ? t("tariffGrid.createNewVersionTitle")
                        : t("tariffGridVersion.editVersion")
                }
                mainButton={{
                    disabled: !formik.isValid,
                    children: t("common.save"),
                    onClick: async () => {
                        if (isSameDay(formik.values.startDate as Date, today)) {
                            openConfirmationModal();
                        } else {
                            await formik.submitForm();
                        }
                    },
                    withConfirmation: mode === "edit",
                    modalProps: {
                        title: t("tariffGrids.applyChanges"),
                        mainButton: {
                            severity: "warning",
                            children: t("tariffGrids.applyChanges"),
                        },
                        "data-testid":
                            "tariff-grid-version-modal-apply-changes-confirmation-modal",
                    },
                    confirmationMessage: (
                        <UpdateOrDeleteTariffGridConfirmationMessage
                            isPurchaseTariffGrid={isPurchaseTariffGrid}
                        />
                    ),
                }}
                secondaryButton={{children: t("common.cancel"), onClick: onClose}}
                onClose={onClose}
                additionalFooterContent={
                    !formik.errors.tariffGridVersion?.table ? undefined : (
                        <Text variant="caption" color="red.default" mt={2}>
                            {formik.errors.tariffGridVersion?.table}
                        </Text>
                    )
                }
                data-testid="tariff-grid-version-modal"
            >
                <Flex flexDirection="column">
                    <TariffGridDisabledCallout tariffGridStatus={tariffGrid.status} />
                    {hasMultipleZones && (
                        <MultipleZonesBanner
                            dataTestId="tariff-grid-version-modal-multiple-zones-banner"
                            onClick={showTariffGridBuildingGuide}
                        />
                    )}
                    <Flex flexDirection="row">
                        <Flex flexDirection="column" flex="1 1 0%" minHeight="0">
                            <Text variant="h1" mb={4}>
                                {tariffGrid.is_origin_or_destination === "destination"
                                    ? t("tariffGrids.OriginZonesAndTariff")
                                    : t("tariffGrids.DestinationZonesAndTariff")}
                            </Text>
                            <Flex flexDirection="row" alignItems={"center"}>
                                <BadgeList
                                    values={[
                                        `${getLoadCategoryLabel(
                                            tariffGrid.load_category
                                        )} – ${getMetricLabel(
                                            tariffGrid.pricing_metric as PricingMetricKey
                                        )}`,
                                    ]}
                                />
                            </Flex>
                            <Flex
                                flexDirection={"column"}
                                maxWidth={"unset"}
                                flexGrow="1"
                                flexShrink="1"
                                alignContent="start"
                                overflow="auto"
                                mt={2}
                                maxHeight="60vh"
                            >
                                <Box>
                                    <TariffGridTable
                                        dataTestId="tariff-grid-version-modal-table"
                                        tariffGrid={tariffGrid}
                                        tariffGridVersion={formik.values.tariffGridVersion}
                                        onChange={async (newTariffGridVersion) => {
                                            await formik.setFieldValue(
                                                "tariffGridVersion",
                                                newTariffGridVersion
                                            );
                                            await formik.validateField("tariffGridVersion");
                                        }}
                                    />
                                </Box>
                            </Flex>
                        </Flex>
                        <Flex
                            flexDirection={"column"}
                            backgroundColor="grey.light"
                            p={5}
                            maxWidth={[200, 300]}
                        >
                            <Flex flexDirection="column">
                                <Flex mb={2}>
                                    <Text variant="h1">{t("tariffGrid.applicationDate")}</Text>
                                    <TooltipWrapper
                                        content={
                                            <Box maxWidth={500}>
                                                <Text>
                                                    {t(
                                                        "tariffGridVersion.applicationDateExplanation"
                                                    )}{" "}
                                                    {t(
                                                        "tariffGridVersion.gridWillBecomeTheCurrentVersion"
                                                    )}
                                                </Text>
                                                <Text mt={2}>
                                                    {t(
                                                        "tariffGridVersion.pricesWillBeUpdatedAccordingToApplicationDate"
                                                    )}
                                                </Text>
                                            </Box>
                                        }
                                    >
                                        <Icon name="info" ml={2} verticalAlign="middle" />
                                    </TooltipWrapper>
                                </Flex>
                                <ApplicationDateTypeSelect
                                    tariffGridApplicationDateType={
                                        tariffGrid.application_date_type
                                    }
                                    value={formik.values.applicationDateType}
                                    error={formik.errors.applicationDateType}
                                    onChange={(
                                        applicationDateTypeOption: SelectOption<ApplicationDateType>
                                    ) => {
                                        formik.setFieldError("applicationDateType", undefined);
                                        formik.setFieldValue(
                                            "applicationDateType",
                                            applicationDateTypeOption
                                        );
                                    }}
                                />
                                <Box mt={2}>
                                    <DatePicker
                                        data-testid="tariff-grid-version-modal-start-date-input"
                                        label={t("common.from", undefined, {capitalize: true})}
                                        minDate={today}
                                        date={formik.values.startDate}
                                        shortcutDates={[]}
                                        onChange={(date) => {
                                            formik.setFieldError("startDate", undefined);
                                            formik.setFieldValue("startDate", date);
                                        }}
                                        error={formik.errors.startDate as string}
                                    />
                                </Box>
                            </Flex>
                            <Flex mt={4}>
                                <Text variant="h1">{t("common.actions")}</Text>
                                <TooltipWrapper
                                    content={
                                        <Box maxWidth={300}>
                                            <Text>{t("tariffGridVersion.actionsTooltip")}</Text>
                                            <Text mt={2}>
                                                {t("tariffGridVersion.actionsTooltip2")}
                                            </Text>
                                        </Box>
                                    }
                                >
                                    <Icon name="info" ml={2} verticalAlign="middle" />
                                </TooltipWrapper>
                            </Flex>
                            <IncreaseOrDecreaseActionButton
                                dataTestId="tariff-grid-version-modal-increase-button"
                                mode="increase"
                                onSubmit={({percentage, decimals}) => {
                                    const newTariffGridVersion =
                                        tableService.applyPercentageOnAllCells(
                                            formik.values.tariffGridVersion,
                                            percentage,
                                            decimals
                                        );
                                    formik.setFieldValue(
                                        "tariffGridVersion",
                                        newTariffGridVersion
                                    );
                                }}
                            />
                            <IncreaseOrDecreaseActionButton
                                dataTestId="tariff-grid-version-modal-decrease-button"
                                mode="decrease"
                                onSubmit={({percentage, decimals}) => {
                                    const newTariffGridVersion =
                                        tableService.applyPercentageOnAllCells(
                                            formik.values.tariffGridVersion,
                                            -percentage,
                                            decimals
                                        );
                                    formik.setFieldValue(
                                        "tariffGridVersion",
                                        newTariffGridVersion
                                    );
                                }}
                            />
                            <ActionButton
                                dataTestId="tariff-grid-version-modal-undo-button"
                                iconName="undo"
                                label={t("tariffGrid.resetCellValues")}
                                onClick={() => {
                                    formik.setFieldError("tariffGridVersion", undefined);
                                    formik.setFieldValue(
                                        "tariffGridVersion",
                                        tariffGridVersion ?? tariffGrid.current_version
                                    );
                                    toast.success(
                                        t("tariffGridVersion.successfullyResetCellValues")
                                    );
                                }}
                            />
                            {mode === "edit" && (
                                <ActionButton
                                    dataTestId="tariff-grid-version-modal-delete-button"
                                    severity="danger"
                                    iconName="bin"
                                    label={t("tariffGridVersion.deleteVersion")}
                                    onClick={handleDeleteTariffGridVersion}
                                    withConfirmation
                                    modalProps={{
                                        title: t("tariffGridVersion.deleteVersion"),
                                        mainButton: {
                                            severity: "warning",
                                            children: t("tariffGridVersion.deleteVersion"),
                                        },
                                    }}
                                    confirmationMessage={
                                        <UpdateOrDeleteTariffGridConfirmationMessage
                                            isPurchaseTariffGrid={isPurchaseTariffGrid}
                                        />
                                    }
                                />
                            )}
                            <Flex flex={1} mt={4} alignItems={"flex-end"}>
                                <Callout backgroundColor="grey.light">
                                    <Text variant="caption" color="grey.dark">
                                        {t("tariffGrid.copyPasteFromExcelValueTip")}
                                    </Text>
                                </Callout>
                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>
                {displayTariffGridBuildingGuide && (
                    <TariffGridBuildingGuide
                        dataTestId="tariff-grid-version-modal-building-guide"
                        onClose={hideTariffGridBuildingGuide}
                    />
                )}
            </Modal>
            {showConfirmationModal && (
                <ConfirmationModal
                    data-testid="tariff-grid-version-modal-confirmation-modal"
                    title={t("tariffGridVersion.confirmApplicationDate")}
                    confirmationMessage={
                        <Box>
                            <Text mb={2}>
                                {t("tariffGridVersion.warningApplicationDateIsToday")}
                            </Text>
                            <Text>{t("tariffGridVersion.gridWillBeReplacedByTheVersion")}</Text>
                        </Box>
                    }
                    onClose={closeConfirmationModal}
                    secondaryButton={{children: t("common.cancel")}}
                    mainButton={{
                        children: t("tariffGridVersion.confirmApplicationDate"),
                        severity: "warning",
                        onClick: async () => {
                            await formik.submitForm();
                            closeConfirmationModal();
                        },
                    }}
                />
            )}
        </>
    );
};
