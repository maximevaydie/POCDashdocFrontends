import {getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {Logger, t, TranslationKeys} from "@dashdoc/web-core";
import {
    AsyncSelect,
    Box,
    Button,
    Flex,
    Icon,
    IconButton,
    Link,
    LoadingWheel,
    Select,
    Text,
    TextInput,
    toast,
} from "@dashdoc/web-ui";
import {
    TruckerUnavailabilityTypes,
    UNAVAILABILITY_TRUCKER_TYPES,
    useToggle,
    yup,
} from "dashdoc-utils";
import {Form, Formik, FormikErrors, FormikProps} from "formik";
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from "react";
import {OptionTypeBase} from "react-select";

import {
    fetchGetAbsenceManagerConnector,
    fetchListAbsenceType,
    fetchPatchAbsenceManagerConnector,
    fetchSynchronizeAbsenceTypeAndTrucker,
} from "app/services/misc/absence-manager.service";

interface ConnectorParameters {
    environment?: string;
    mapping_absence_type?: AbsencesMapped[];
}
interface Props {
    connectorUid: string | null;
    platformName: string;
    connectorParameters: ConnectorParameters;
    dataSource: string;
}
interface AbsenceType {
    label: string;
    value: string;
}
type Absence = {
    absence_remote_id: string;
    absence_dashdoc: TruckerUnavailabilityTypes | undefined;
    absence_type: string;
};
type AbsenceList = {absenceList: Absence[]};
interface AbsencesMapped {
    type_dashdoc: string;
    remote_id: string;
    absence_manager_type: string;
}
interface AbsencesMappedProps {
    absencesMapped: AbsencesMapped[];
    deleteAbsence: (absencesMapped: AbsencesMapped) => void;
    platformName: string;
}
const Absences = ({absencesMapped, deleteAbsence, platformName}: AbsencesMappedProps) => {
    return (
        <>
            {absencesMapped.map((absenceMapped, index) => (
                <Flex flexDirection="row" mb={2} key={index}>
                    <Box width={"100%"} pr={3}>
                        <TextInput
                            disabled={true}
                            containerProps={{flex: 1}}
                            type="text"
                            label={t("common.absenceManager.absenceCode", {
                                platform_name: platformName,
                            })}
                            value={absenceMapped.absence_manager_type ?? ""}
                            onChange={() => {}}
                            autoFocus={true}
                            data-testid={`absence-type-absence-manager-${index}`}
                        />
                    </Box>
                    <Icon name={"thickArrowRight"} pr={3} color="grey.dark" fontSize="3em" />
                    <Box width={"100%"} pr={3}>
                        <TextInput
                            disabled={true}
                            containerProps={{flex: 1}}
                            type="text"
                            label={t("unavailability.type")}
                            value={t(
                                `unavailability.${absenceMapped.type_dashdoc}` as TranslationKeys
                            )}
                            onChange={() => {}}
                            autoFocus={true}
                            data-testid={`absence-type-dashdoc-${index}`}
                        />
                    </Box>
                    <Box width={"10%"} pr={3}>
                        <IconButton
                            type="button"
                            name="delete"
                            height={50}
                            ml={1}
                            onClick={() => {
                                deleteAbsence(absenceMapped);
                            }}
                            data-testid={`mapping-absence-type-remove-${index}`}
                            fontSize={5}
                            color="grey.dark"
                        />
                    </Box>
                </Flex>
            ))}
        </>
    );
};

const MappingAbsence = ({
    values,
    errors,
    setFieldValue,
    absencesTypeOptions,
    absencesType,
    unavailabilityOptions,
    platformName,
}: {
    values: AbsenceList;
    errors: FormikErrors<AbsenceList>;
    setFieldValue: (field: string, value: Absence | Absence[], shouldValidate?: boolean) => void;
    absencesTypeOptions: any;
    absencesType: AbsenceType[];
    unavailabilityOptions: any;
    platformName: string;
}) => {
    let absencesToExclude = values.absenceList.map((absence) => absence.absence_remote_id);

    return (
        <>
            {values.absenceList.map((absence, index) => (
                <React.Fragment key={index}>
                    <Flex flexDirection="row" mb={2}>
                        <Box width={"100%"} pr={3}>
                            <AsyncSelect
                                key={`${JSON.stringify(absencesType)}${JSON.stringify(values)}`} // hack to refresh options
                                label={t("common.absenceManager.absenceCode", {
                                    platform_name: platformName,
                                })}
                                isSearchable={false}
                                isClearable={false}
                                defaultOptions={true}
                                required
                                value={{
                                    value: absence.absence_remote_id,
                                    label: absence.absence_type,
                                }}
                                onMenuOpen={() => absencesTypeOptions(absencesToExclude)}
                                loadOptions={() => absencesTypeOptions(absencesToExclude)}
                                onChange={(value: OptionTypeBase) => {
                                    setFieldValue(`absenceList.${index}`, {
                                        absence_type: value.label,
                                        absence_remote_id: value.value,
                                        absence_dashdoc: absence.absence_dashdoc,
                                    });
                                }}
                                error={
                                    errors.absenceList && errors.absenceList[index]
                                        ? // @ts-ignore
                                          errors.absenceList[index].absence_dashdoc
                                        : undefined
                                }
                                data-testid={`absence-manager-unavailability-input-${index}`}
                            />
                        </Box>
                        <Icon name={"thickArrowRight"} pr={3} color="grey.dark" fontSize="3em" />
                        <Box width={"100%"} pr={3}>
                            <Select
                                data-testid="unavailability-type"
                                label={t("unavailability.type")}
                                options={unavailabilityOptions}
                                isSearchable={true}
                                isClearable={true}
                                required
                                value={{
                                    value: absence.absence_dashdoc,
                                    label: absence.absence_dashdoc
                                        ? t(
                                              `unavailability.${absence.absence_dashdoc}` as TranslationKeys
                                          )
                                        : "",
                                }}
                                onChange={(value: {
                                    label?: string;
                                    value?: TruckerUnavailabilityTypes | undefined;
                                }) => {
                                    setFieldValue(`absenceList.${index}`, {
                                        absence_type: absence.absence_type,
                                        absence_remote_id: absence.absence_remote_id,
                                        absence_dashdoc: value.value,
                                    });
                                }}
                            />
                        </Box>
                        {values["absenceList"].length > 1 && (
                            <Box width={"10%"} pr={3}>
                                <IconButton
                                    type="button"
                                    name="delete"
                                    height={50}
                                    ml={1}
                                    onClick={() => {
                                        values.absenceList.splice(index, 1);
                                        setFieldValue("absenceList", values.absenceList);
                                    }}
                                    fontSize={5}
                                    color="grey.dark"
                                />
                            </Box>
                        )}
                        {values["absenceList"].length == 1 && <Box width={"10%"} pr={3} />}
                        <Box padding={1} />
                    </Flex>
                </React.Fragment>
            ))}
        </>
    );
};

const AbsencesMapper: FunctionComponent<Props> = ({
    connectorParameters,
    connectorUid,
    platformName,
    dataSource,
}) => {
    const [lastSynchronization, setLastSynchronization] = useState<string>();
    const [absencesMapped, setAbsencesMapped] = useState<AbsencesMapped[]>([]);
    const [absencesType, setAbsencesType] = useState<AbsenceType[]>([]);
    const [fetchingAbsences] = useToggle(false);
    const [hasMoreabsencesTypeOptions, setHasMoreabsencesTypeOptions] = useState<boolean>(true);
    const initialValues: AbsenceList = {
        // @ts-ignore
        absenceList: [{absence_remote_id: "", absence_dashdoc: undefined, absence_type: ""}],
    };

    const validationSchema = yup.object().shape({
        AbsenceList: yup.array(
            yup.object().shape({
                absence_type: yup.string().required(t("common.mandatoryField")),
                absence_remote_id: yup.string().required(t("common.mandatoryField")),
            })
        ),
    });
    const fetchConnectivityState = useCallback(async () => {
        try {
            const response = await fetchGetAbsenceManagerConnector(dataSource);
            if (response?.uid && response?.parameters?.last_catalog_synchronization) {
                connectorParameters = response?.parameters;
                setLastSynchronization(response?.parameters?.last_catalog_synchronization);
            }
            toast.success(t("settings.absenceLink.added"));
        } catch (error) {
            // FIXME: @elisabethboncler nothing to do here ?
        }
    }, []);

    const fetchMappingAbsenceType = () => {
        if (connectorParameters["mapping_absence_type"]) {
            setAbsencesMapped(connectorParameters["mapping_absence_type"]);
        }
        if (absencesType.length == 0) {
            setHasMoreabsencesTypeOptions(false);
        }
    };

    const synchronizeWithAbsenceManager = async (connectorUid: string | null) => {
        if (connectorUid) {
            try {
                await fetchSynchronizeAbsenceTypeAndTrucker(connectorUid);
            } catch (error) {
                toast.error(t("settings.absenceLink.addedError"));
            }
        }
        fetchConnectivityState();
    };

    const addAbsence = async (values: AbsenceList, formikHelpers: FormikProps<AbsenceList>) => {
        values.absenceList.map((value: any) => {
            if (value.absence_dashdoc && value.absence_type !== "") {
                absencesMapped.push({
                    type_dashdoc: value.absence_dashdoc,
                    remote_id: value.absence_remote_id,
                    absence_manager_type: value.absence_type,
                });
            }
        });

        setAbsencesMapped([...absencesMapped]);

        connectorParameters["mapping_absence_type"] = absencesMapped;

        try {
            await fetchPatchAbsenceManagerConnector(
                // @ts-ignore
                connectorUid,
                connectorParameters
            );
            toast.success(t("settings.absenceLink.added"));

            formikHelpers.resetForm();
        } catch (error) {
            getErrorMessagesFromServerError(error).then((error?: any) => {
                if (error) {
                    formikHelpers.setSubmitting(false);
                    formikHelpers.setErrors(error);
                }
            });
            toast.error(t("settings.absenceLink.addedError"));
        }
    };

    const deleteAbsence = async (absenceMapped: AbsencesMapped) => {
        let editedMappingParameters: AbsencesMapped[] = [];

        if (connectorParameters["mapping_absence_type"]) {
            editedMappingParameters = connectorParameters["mapping_absence_type"].filter(
                (absence) => absence != absenceMapped
            );
        }

        connectorParameters["mapping_absence_type"] = editedMappingParameters;

        try {
            await fetchPatchAbsenceManagerConnector(
                // @ts-ignore
                connectorUid,
                connectorParameters
            );
            toast.success(t("settings.absenceLink.added"));
            let newAbsenceMapped = [...absencesMapped];
            newAbsenceMapped.splice(
                newAbsenceMapped.findIndex((e: AbsencesMapped) => e == absenceMapped)
            );
            setAbsencesMapped(newAbsenceMapped);
        } catch (error) {
            toast.error(t("settings.absenceLink.addedError"));
            throw error;
        }
    };

    const absencesTypeOptions = async (absencesToExclude: string[]) => {
        fetchMappingAbsenceType();

        let listOption: {label: string; value: string}[] = [];
        let absencesMappedToExclude = absencesMapped.map((absence: AbsencesMapped) => {
            return absence.remote_id;
        });

        try {
            const response = await fetchListAbsenceType(
                // @ts-ignore
                connectorUid
            );
            listOption = response["absences_type"]
                .filter(
                    (absenceType: {id: string; type: string}) =>
                        !absencesMappedToExclude.includes(absenceType.id)
                )
                .map((value: {type: string; id: string}) => {
                    return {
                        label: value.type,
                        value: value.id,
                    };
                });

            // Exclude absence already mapped but not submit
            listOption = listOption.filter((option) => !absencesToExclude.includes(option.value));

            if (listOption.length == 0) {
                setHasMoreabsencesTypeOptions(false);
            } else {
                setHasMoreabsencesTypeOptions(true);
            }

            setAbsencesType(listOption);

            return absencesType;
        } catch (error) {
            Logger.error(error);
            return [];
        }
    };

    const unavailabilityOptions = useMemo(() => {
        return UNAVAILABILITY_TRUCKER_TYPES.map((type) => {
            return {value: type, label: t(`unavailability.${type}` as TranslationKeys)};
        });
    }, []);

    useEffect(() => {
        fetchConnectivityState();
        fetchMappingAbsenceType();
    }, []);

    return (
        <>
            <Box padding={4} />
            <Text variant="captionBold" my={2}>
                {t("settings.absenceManager.absenceBinding")}
            </Text>
            <p>{t("settings.absenceManager.absencesMapping")}</p>
            <p>{t("settings.absenceManager.mappingProvidedBy", {platform_name: platformName})}</p>
            <Box padding={1} />
            {lastSynchronization && (
                <Text mt={4} data-testid="invoicing-last-catalog-synchronization-date">
                    {t("settings.absenceManager.lastSynchronization", {
                        synchronizationDate: lastSynchronization,
                    })}
                </Text>
            )}
            <Button
                variant="primary"
                onClick={() => {
                    synchronizeWithAbsenceManager(connectorUid);
                }}
                type="button"
                maxWidth="fit-content"
                mt={4}
                data-testid="synchronize-with-absence-manager"
            >
                {t("settings.absenceManager.synchronizeTruckersAndAbsences")}
            </Button>
            <Box padding={2} />
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                validateOnBlur={false}
                validateOnChange={false}
                enableReinitialize={true}
                onSubmit={addAbsence}
            >
                {({values, errors, isSubmitting, setFieldValue}: FormikProps<AbsenceList>) => (
                    <Form>
                        {fetchingAbsences && (
                            <Box mt={2} mb={2}>
                                <LoadingWheel noMargin />
                            </Box>
                        )}
                        <Absences
                            absencesMapped={absencesMapped}
                            deleteAbsence={deleteAbsence}
                            platformName={platformName}
                        />
                        <MappingAbsence
                            values={values}
                            errors={errors}
                            setFieldValue={setFieldValue}
                            absencesTypeOptions={absencesTypeOptions}
                            absencesType={absencesType}
                            unavailabilityOptions={unavailabilityOptions}
                            platformName={platformName}
                        />

                        <Flex alignItems="flex-start" flexDirection="column">
                            <Box mt={3}>
                                <Flex mb={1}>
                                    <Box flex={1}>
                                        {hasMoreabsencesTypeOptions && (
                                            <Link
                                                onClick={() => {
                                                    setFieldValue(
                                                        `absenceList.${values.absenceList.length}`,
                                                        {
                                                            absence_remote_id: undefined,
                                                            absence_dashdoc: undefined,
                                                            absence_type: undefined,
                                                        }
                                                    );
                                                }}
                                                data-testid={`add-more-mapping-absence-button`}
                                            >
                                                <Icon name="add" mr={2} />{" "}
                                                {t("settings.absenceManager.addBinding")}
                                            </Link>
                                        )}
                                    </Box>
                                </Flex>
                            </Box>
                        </Flex>
                        <Flex alignItems="flex-end" flexDirection="column" mr={3}>
                            <Button
                                type="submit"
                                justifySelf="flex-end"
                                disabled={isSubmitting}
                                data-testid="add-mapping-absence-type-button"
                                mt={2}
                            >
                                {t("common.save")}
                            </Button>
                        </Flex>
                    </Form>
                )}
            </Formik>
        </>
    );
};

export default AbsencesMapper;
