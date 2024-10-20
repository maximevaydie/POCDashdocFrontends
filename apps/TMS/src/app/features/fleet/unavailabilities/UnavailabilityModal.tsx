import {apiService, useTimezone} from "@dashdoc/web-common";
import {TranslationKeys, t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    DatePicker,
    Flex,
    Modal,
    Select,
    SelectOption,
    Text,
    TextArea,
} from "@dashdoc/web-ui";
import {
    APIVersion,
    HALF_DAY,
    HalfDay,
    Unavailability,
    TruckerUnavailabilityTypes,
    UNAVAILABILITY_TRUCKER_TYPES,
    UNAVAILABILITY_VEHICLE_TYPES,
    VehicleUnavailabilityTypes,
    formatDate,
    parseAndZoneDate,
    yup,
    zoneDateToISO,
} from "dashdoc-utils";
import {isSameDay} from "date-fns";
import {FormikProvider, useFormik} from "formik";
import capitalize from "lodash.capitalize";
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from "react";

import {getFleetUnavailabilityFunctionsByType} from "app/features/fleet/unavailabilities/unavailability.service";
import {useDispatch, useSelector} from "app/redux/hooks";
import {loadRequestAbsenceManagerConnector} from "app/redux/reducers/connectors";
import {getMiddayTimeFormatted} from "app/redux/selectors/connector";

type UnavailabilityModalProps = {
    fleetItemPk: number;
    fleetItemName: string;
    type: "trucker" | "trailer" | "vehicle";
    unavailability?: Unavailability;
    onClose: () => void;
    onSave?: (unavailability: Unavailability[]) => void;
    defaultDate?: Date;
};

type UnavailabilityModalFormProps = {
    unavailabilityType: TruckerUnavailabilityTypes | VehicleUnavailabilityTypes;
    startDate: Date;
    endDate: Date;
    startHalfDay: HalfDay;
    endHalfDay: HalfDay;
    unavailabilityNote: string;
};

const UnavailabilityModal: FunctionComponent<UnavailabilityModalProps> = ({
    onClose,
    fleetItemPk,
    fleetItemName,
    type,
    unavailability,
    onSave,
    defaultDate,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [hasAvailabilityConflict, setAvailabilityConflict] = useState(false);
    const dispatch = useDispatch();
    const timezone = useTimezone();
    dispatch(loadRequestAbsenceManagerConnector());
    const middayTime = useSelector(getMiddayTimeFormatted);

    const unavailabilityOptions = useMemo(() => {
        switch (type) {
            case "trucker":
                return UNAVAILABILITY_TRUCKER_TYPES.map((type) => {
                    // nosemgrep no_string_interpolation_in_translate
                    return {value: type, label: t(`unavailability.${type}` as TranslationKeys)};
                });
            default:
                return UNAVAILABILITY_VEHICLE_TYPES.map((type) => {
                    // nosemgrep no_string_interpolation_in_translate
                    return {value: type, label: t(`unavailability.${type}` as TranslationKeys)};
                });
        }
    }, [type]);
    const halfDayOptions = useMemo(
        () =>
            HALF_DAY.map((type) => {
                // nosemgrep no_string_interpolation_in_translate
                return {value: type, label: t(`unavailability.${type}` as TranslationKeys)};
            }),
        []
    );

    const getDates = useCallback(
        (
            values: Pick<
                UnavailabilityModalFormProps,
                "startDate" | "endDate" | "startHalfDay" | "endHalfDay"
            >
        ) => {
            const startDate = new Date(values.startDate.getTime()); // to clone date object
            if (values.startHalfDay === "afternoon") {
                startDate.setHours(12);
                startDate.setMinutes(0);
            } else {
                startDate.setHours(0);
                startDate.setMinutes(0);
            }
            const endDate = new Date(values.endDate.getTime()); // to clone date object
            const endHalfDay = isSameDay(startDate, endDate)
                ? values.startHalfDay
                : values.endHalfDay;
            if (endHalfDay === "morning") {
                endDate.setHours(12);
                endDate.setMinutes(0);
            } else {
                endDate.setHours(23);
                endDate.setMinutes(59);
            }
            startDate.setSeconds(0);
            startDate.setMilliseconds(0);
            endDate.setSeconds(0);
            endDate.setMilliseconds(0);
            return {
                startDate: zoneDateToISO(startDate, timezone),
                endDate: zoneDateToISO(endDate, timezone),
            };
        },
        []
    );

    const checkAvailabilityConflict = (values: Partial<UnavailabilityModalFormProps>) => {
        if (values.startDate && values.endDate && values.startHalfDay && values.endHalfDay) {
            const {startDate, endDate} = getDates({
                startDate: values.startDate,
                endDate: values.endDate,
                startHalfDay: values.startHalfDay,
                endHalfDay: values.endHalfDay,
            });
            let baseUrl;
            let apiVersion: APIVersion = "v4";
            switch (type) {
                case "trucker":
                    baseUrl = "manager-truckers";
                    apiVersion = "web";
                    break;
                case "vehicle":
                    baseUrl = "vehicles";
                    break;
                case "trailer":
                    baseUrl = "trailers";
                    break;
            }
            apiService
                .post(
                    `/${baseUrl}/${fleetItemPk}/has-trip-assigned/`,
                    {
                        start_date: startDate,
                        end_date: endDate,
                    },
                    {apiVersion}
                )
                .then((res) => {
                    setAvailabilityConflict(res.conflict);
                })
                .catch(() => {
                    setAvailabilityConflict(false);
                });
        } else {
            setAvailabilityConflict(false);
        }
    };

    const handleStartDateUpdate = (value: Date, preventConflictCheck?: boolean) => {
        formik.setFieldValue("startDate", value);
        // @ts-ignore
        if (formik.values.endDate < value) {
            handleEndDateUpdate(value, true);
            checkAvailabilityConflict({...formik.values, startDate: value, endDate: value});
        } else if (!preventConflictCheck) {
            // @ts-ignore
            checkAvailabilityConflict({...formik.values, startDate: value});
        }
    };
    const handleEndDateUpdate = (value: Date, preventConflictCheck?: boolean) => {
        formik.setFieldValue("endDate", value);
        // @ts-ignore
        if (value < formik.values.startDate) {
            handleStartDateUpdate(value, true);
            checkAvailabilityConflict({...formik.values, startDate: value, endDate: value});
        } else if (!preventConflictCheck) {
            // @ts-ignore
            checkAvailabilityConflict({...formik.values, endDate: value});
        }
    };

    const handleStartHalfDayUpdate = (option: SelectOption<HalfDay>) => {
        formik.setFieldValue("startHalfDay", option.value);
        // @ts-ignore
        checkAvailabilityConflict({...formik.values, startHalfDay: option.value});
    };
    const handleEndHalfDayUpdate = (option: SelectOption<HalfDay>) => {
        formik.setFieldValue("endHalfDay", option.value);
        // @ts-ignore
        checkAvailabilityConflict({...formik.values, endHalfDay: option.value});
    };

    const handleSubmit = async (values: UnavailabilityModalFormProps) => {
        try {
            setIsLoading(true);
            const {startDate, endDate} = getDates(values);
            const {addUnavailability, editUnavailability} =
                getFleetUnavailabilityFunctionsByType(type);

            const result = unavailability
                ? await dispatch(
                      // @ts-ignore
                      editUnavailability(fleetItemPk, unavailability.id, {
                          start_date: startDate,
                          end_date: endDate,
                          unavailability_type: values.unavailabilityType,
                          unavailability_note: values.unavailabilityNote,
                      })
                  )
                : await dispatch(
                      addUnavailability(fleetItemPk, {
                          // @ts-ignore
                          start_date: startDate,
                          // @ts-ignore
                          end_date: endDate,
                          unavailability_type: values.unavailabilityType,
                          unavailability_note: values.unavailabilityNote,
                      })
                  );
            setIsLoading(false);
            onClose();
            let fleetResult;
            switch (type) {
                case "trucker":
                    fleetResult = result.entities[type + "s"][fleetItemPk];
                    break;
                case "vehicle":
                    fleetResult = result;
                    break;
                case "trailer":
                    fleetResult = result;
                    break;
            }
            onSave?.(fleetResult.unavailability);
        } catch (error) {
            setIsLoading(false);
        }
    };

    const initialStartHalfDay = useMemo((): HalfDay => {
        if (
            // @ts-ignore
            formatDate(parseAndZoneDate(unavailability?.start_date, timezone), "HH:mm") ===
            middayTime
        ) {
            return "afternoon";
        }
        if (
            isSameDay(
                // @ts-ignore
                parseAndZoneDate(unavailability?.start_date, timezone),
                // @ts-ignore
                parseAndZoneDate(unavailability?.end_date, timezone)
            ) &&
            // @ts-ignore
            formatDate(parseAndZoneDate(unavailability?.end_date, timezone), "HH:mm") ===
                middayTime
        ) {
            return "morning";
        }
        return "all_day";
    }, [unavailability]);

    const initialEndHalfDay = useMemo((): HalfDay => {
        // @ts-ignore
        return formatDate(parseAndZoneDate(unavailability?.end_date, timezone), "HH:mm") ===
            middayTime
            ? "morning"
            : "all_day";
    }, [unavailability]);

    const formik = useFormik({
        initialValues: {
            unavailabilityType: unavailability?.unavailability_type ?? undefined,
            startDate: unavailability
                ? parseAndZoneDate(unavailability?.start_date, timezone)
                : (defaultDate ?? new Date()),
            endDate: unavailability
                ? parseAndZoneDate(unavailability?.end_date, timezone)
                : (defaultDate ?? new Date()),
            startHalfDay: initialStartHalfDay,
            endHalfDay: initialEndHalfDay,
            unavailabilityNote: unavailability?.unavailability_note ?? "",
        },
        validationSchema: yup.object().shape({
            unavailabilityType: yup.string().required(t("errors.field_cannot_be_empty")),
            startDate: yup.string().required(t("errors.field_cannot_be_empty")),
            endDate: yup.string().required(t("errors.field_cannot_be_empty")),
        }),
        onSubmit: handleSubmit,
    });

    useEffect(() => {
        // initialize availability conflict
        checkAvailabilityConflict({
            // @ts-ignore
            startDate: unavailability
                ? parseAndZoneDate(unavailability?.start_date, timezone)
                : (defaultDate ?? new Date()),
            // @ts-ignore
            endDate: unavailability
                ? parseAndZoneDate(unavailability?.end_date, timezone)
                : (defaultDate ?? new Date()),
            startHalfDay: initialStartHalfDay,
            endHalfDay: initialEndHalfDay,
        });
    }, [unavailability]);

    const modalTitle = useMemo(() => {
        switch (type) {
            case "trucker":
                return unavailability
                    ? t(`unavailability.editTruckerAbsence`, {trucker: fleetItemName})
                    : t(`unavailability.addTruckerAbsence`, {trucker: fleetItemName});
            default:
                return unavailability
                    ? t(`unavailability.editFleetUnavailability`, {name: fleetItemName})
                    : t(`unavailability.addFleetUnavailability`, {name: fleetItemName});
        }
    }, [type, unavailability, fleetItemName]);

    const handleDeleteUnavailability = async () => {
        if (!unavailability?.id) {
            return;
        }
        const {deleteUnavailability, retrieveFleetItem} =
            getFleetUnavailabilityFunctionsByType(type);
        await dispatch(deleteUnavailability(fleetItemPk, unavailability.id));
        const result = await dispatch(retrieveFleetItem(fleetItemPk));
        onClose();
        let fleetResult;
        switch (type) {
            case "trucker":
                fleetResult = result.response.entities[type + "s"][fleetItemPk];
                break;
            case "vehicle":
                fleetResult = result.vehicle;
                break;
            case "trailer":
                fleetResult = result.trailer;
                break;
        }
        onSave?.(fleetResult.unavailability);
    };

    return (
        <Modal
            title={modalTitle}
            data-testid="unavailability-modal"
            onClose={onClose}
            mainButton={{
                children: t("common.save"),
                loading: isLoading,
                onClick: formik.submitForm,
                "data-testid": "unavailability-modal-save-button",
            }}
            secondaryButton={
                unavailability?.id
                    ? {
                          children: t("common.delete"),
                          severity: "danger",
                          withConfirmation: true,
                          confirmationMessage:
                              type === "trucker"
                                  ? t("unavailability.confirmDeleteAbsence")
                                  : t("unavailability.confirmDeleteUnavailability"),
                          modalProps: {
                              title:
                                  type === "trucker"
                                      ? t("unavailability.deleteAbsence")
                                      : t("unavailability.deleteUnavailability"),
                              mainButton: {
                                  children: t("common.delete"),
                                  "data-testid": "confirm-delete-unavailability",
                              },
                          },
                          onClick: handleDeleteUnavailability,
                          "data-testid": "unavailability-delete-button",
                      }
                    : null
            }
        >
            <FormikProvider value={formik}>
                <Select
                    data-testid="unavailability-type"
                    label={
                        type === "trucker"
                            ? t("unavailability.type")
                            : t("unavailability.unavailabilityType")
                    }
                    autoFocus={!formik.values.unavailabilityType}
                    options={unavailabilityOptions}
                    isSearchable={true}
                    isClearable={false}
                    required
                    value={
                        formik.values.unavailabilityType
                            ? {
                                  value: formik.values.unavailabilityType,
                                  // nosemgrep no_string_interpolation_in_translate
                                  label: t(
                                      `unavailability.${formik.values.unavailabilityType}` as TranslationKeys
                                  ),
                              }
                            : undefined
                    }
                    onChange={(value: SelectOption) =>
                        formik.setFieldValue("unavailabilityType", value.value)
                    }
                    error={
                        formik.touched.unavailabilityType &&
                        (formik.errors.unavailabilityType as string)
                    }
                />
                <Flex mt={2}>
                    <Box flex={1} mr={2}>
                        <DatePicker
                            // @ts-ignore
                            date={formik.values.startDate}
                            label={t("components.beginDate")}
                            onChange={handleStartDateUpdate}
                            data-testid="start-date-picker"
                            required
                            rootId="react-app-modal-root"
                            error={formik.touched.startDate && (formik.errors.startDate as string)}
                        />
                    </Box>
                    <DatePicker
                        // @ts-ignore
                        date={formik.values.endDate}
                        label={t("components.endDate")}
                        onChange={handleEndDateUpdate}
                        data-testid="end-date-picker"
                        required
                        rootId="react-app-modal-root"
                        error={formik.touched.endDate && (formik.errors.endDate as string)}
                    />
                </Flex>
                <Flex mt={2}>
                    <Box flex={1} mr={2}>
                        <Select
                            options={halfDayOptions}
                            isSearchable={true}
                            isClearable={false}
                            value={
                                formik.values.startHalfDay
                                    ? {
                                          value: formik.values.startHalfDay,
                                          // nosemgrep no_string_interpolation_in_translate
                                          label: t(
                                              `unavailability.${formik.values.startHalfDay}` as TranslationKeys
                                          ),
                                      }
                                    : undefined
                            }
                            onChange={handleStartHalfDayUpdate}
                        />
                    </Box>
                    <Box flex={1}>
                        {/*
// @ts-ignore */}
                        {!isSameDay(formik.values.startDate, formik.values.endDate) && (
                            <Select
                                options={halfDayOptions}
                                isSearchable={true}
                                isClearable={false}
                                value={
                                    formik.values.endHalfDay
                                        ? {
                                              value: formik.values.endHalfDay,
                                              // nosemgrep no_string_interpolation_in_translate
                                              label: t(
                                                  `unavailability.${formik.values.endHalfDay}` as TranslationKeys
                                              ),
                                          }
                                        : undefined
                                }
                                onChange={handleEndHalfDayUpdate}
                            />
                        )}
                    </Box>
                </Flex>
                <Box mt={2}>
                    <TextArea
                        height={100}
                        maxLength={1000}
                        name="unavailability-note"
                        aria-label={"Commentaires"}
                        label={t("common.comments")}
                        data-testid="unavailability-note"
                        value={formik.values.unavailabilityNote}
                        onChange={(value) => formik.setFieldValue("unavailabilityNote", value)}
                        error={formik.errors.unavailabilityNote}
                    />
                </Box>
            </FormikProvider>
            {hasAvailabilityConflict && (
                <Callout mt={2} variant="warning" data-testid="conflict-availability-creation">
                    <Text>
                        {
                            // nosemgrep no_string_interpolation_in_translate
                            t(`unavailability.conflict${capitalize(type)}Busy` as TranslationKeys)
                        }
                    </Text>
                </Callout>
            )}
        </Modal>
    );
};

export default UnavailabilityModal;
