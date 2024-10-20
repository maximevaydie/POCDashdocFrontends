import {getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    AsyncPaginatedSelect,
    Box,
    Button,
    Flex,
    Icon,
    IconButton,
    Link,
    LoadingWheel,
    Text,
    TextInput,
    toast,
} from "@dashdoc/web-ui";
import {useToggle, yup} from "dashdoc-utils";
import {Form, Formik, FormikErrors, FormikProps} from "formik";
import React, {FunctionComponent, useEffect, useState} from "react";
import {OptionTypeBase} from "react-select";

import {
    fetchCreateExternalCompany,
    fetchDeleteExternalCompany,
    fetchListExternalCompany,
    fetchShipperNotExternalCompanyList,
} from "app/services/misc/shippersPlatform.service";

interface Props {
    connectorUid: string | null;
    platformName: string;
}
type Shipper = {shipper_name: string; shipper_pk: number; shipper_remote_id: string};
type ShipperList = {shipperList: Shipper[]};

interface ExternalCompany {
    label: string;
    value: string;
    company: string;
    pk: string;
    remote_id: string;
}
interface ExternalCompaniesProps {
    companies: ExternalCompany[];
    deleteExternalCompany: (pk: string) => void;
}

const ExternalCompanies = ({companies, deleteExternalCompany}: ExternalCompaniesProps) => {
    return (
        <>
            {companies.map((company, index) => (
                <Flex flexDirection="row" mb={2} key={index}>
                    <Box width={"100%"} pr={3}>
                        <TextInput
                            disabled={true}
                            containerProps={{flex: 1}}
                            type="text"
                            label={t("common.shipper")}
                            value={company.value ?? ""}
                            onChange={() => {}}
                            autoFocus={true}
                            data-testid={`external-tms-shipper-${index}`}
                        />
                    </Box>
                    <Icon name={"thickArrowRight"} pr={3} color="grey.default" fontSize="3em" />
                    <Box width={"100%"} pr={3}>
                        <TextInput
                            disabled={true}
                            containerProps={{flex: 1}}
                            type="text"
                            label={t("settings.shippersPlatforms.shipperCode")}
                            value={company.remote_id}
                            onChange={() => {}}
                            autoFocus={true}
                            data-testid={`external-tms-shipper-code-${index}`}
                        />
                    </Box>
                    <Box width={"10%"} pr={3}>
                        <IconButton
                            type="button"
                            name="delete"
                            height={50}
                            ml={1}
                            onClick={() => {
                                deleteExternalCompany(company.pk);
                            }}
                            data-testid={`external-tms-shipper-remove-${index}`}
                            fontSize={5}
                            color="grey.dark"
                        />
                    </Box>
                </Flex>
            ))}
        </>
    );
};

const MappingExternalCompaniesFields = ({
    values,
    errors,
    setFieldValue,
    loadNotMappedCompanies,
    externalCompanies,
}: {
    values: ShipperList;
    errors: FormikErrors<ShipperList>;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
    loadNotMappedCompanies: (
        searchText: string,
        additional: {page: number},
        companiesToExclude: number[]
    ) => Promise<{
        options: {label: string; value: number}[];
        hasMore: boolean;
        additional: {
            page: number;
        };
    }>;
    externalCompanies: ExternalCompany[];
}) => {
    const companiesToExclude = values.shipperList.map((shipper) => shipper.shipper_pk);

    return (
        <>
            {values.shipperList.map((shipper, index) => (
                <React.Fragment key={index}>
                    <Flex flexDirection="row">
                        <Box width={"100%"} pr={3}>
                            <AsyncPaginatedSelect
                                key={`${JSON.stringify(externalCompanies)}${JSON.stringify(
                                    values
                                )}`} // hack to refresh options
                                isClearable
                                isSearchable
                                label={t("common.shipper")}
                                placeholder={t("common.shipper")}
                                className={`select-big`}
                                value={{
                                    value: shipper.shipper_pk,
                                    label: shipper.shipper_name,
                                }}
                                defaultOptions
                                loadOptions={(input, _options, additional) =>
                                    // @ts-ignore
                                    loadNotMappedCompanies(input, additional, companiesToExclude)
                                }
                                onChange={(value: OptionTypeBase) => {
                                    setFieldValue(`shipperList.${index}`, {
                                        shipper_name: value?.label,
                                        shipper_pk: value?.value,
                                        shipper_remote_id: shipper?.shipper_remote_id,
                                    });
                                }}
                                error={
                                    errors.shipperList && errors.shipperList[index]
                                        ? // @ts-ignore
                                          errors.shipperList[index].shipper_pk
                                        : undefined
                                }
                                data-testid={`external-tms-shipper-input-${index}`}
                            />
                        </Box>
                        <Icon
                            name={"thickArrowRight"}
                            pr={3}
                            color="grey.default"
                            fontSize="3em"
                        />
                        <Box width={"100%"} pr={3}>
                            <TextInput
                                containerProps={{flex: 1}}
                                type="text"
                                label={t("settings.shippersPlatforms.shipperCode")}
                                value={shipper.shipper_remote_id}
                                onChange={(value) => {
                                    setFieldValue(`shipperList.${index}`, {
                                        shipper_name: shipper.shipper_name,
                                        shipper_pk: shipper.shipper_pk,
                                        shipper_remote_id: value,
                                    });
                                }}
                                error={
                                    errors.shipperList && errors.shipperList[index]
                                        ? // @ts-ignore
                                          errors.shipperList[index].shipper_remote_id
                                        : undefined
                                }
                                data-testid={`external-tms-shipper-code-input-${index}`}
                            />
                        </Box>
                        {values["shipperList"].length > 1 && (
                            <Box width={"10%"} pr={3}>
                                <IconButton
                                    type="button"
                                    name="delete"
                                    height={50}
                                    ml={1}
                                    onClick={() => {
                                        values.shipperList.splice(index, 1);
                                        setFieldValue("shipperList", values.shipperList);
                                    }}
                                    fontSize={5}
                                    color="grey.dark"
                                />
                            </Box>
                        )}
                        {values["shipperList"].length == 1 && <Box width={"10%"} pr={3} />}
                    </Flex>
                    <Box padding={1} />
                </React.Fragment>
            ))}
        </>
    );
};

const ShippersMapper: FunctionComponent<Props> = ({connectorUid, platformName}) => {
    const [externalCompanies, setExternalCompanies] = useState<ExternalCompany[]>([]);
    const [notMappedCompanies, setNotMappedCompanies] = useState<{
        [index: string]: {
            [index: number]: {options: {label: string; value: number}[]; hasMore: boolean};
        };
    }>({});
    const [fetchingExternalCompanies, setFetchingExternalCompanies, setExternalCompaniesFetched] =
        useToggle(false);

    const loadNotMappedCompanies = (
        searchText: string,
        additional: {
            page: number;
        },
        companiesToExclude: number[]
    ): Promise<{
        options: {label: string; value: number}[];
        hasMore: boolean;
        additional: {
            page: number;
        };
    }> =>
        new Promise(async (resolve, reject) => {
            try {
                let optionPage = 1;

                if (additional && additional.page) {
                    optionPage = additional.page;
                }

                let listOption: {label: string; value: number}[] = [];
                let hasMore: boolean;
                if (
                    searchText in notMappedCompanies &&
                    optionPage in notMappedCompanies[searchText]
                ) {
                    listOption = notMappedCompanies[searchText][optionPage].options;
                    hasMore = notMappedCompanies[searchText][optionPage].hasMore;
                } else {
                    const response = await fetchShipperNotExternalCompanyList(
                        searchText,
                        // @ts-ignore
                        connectorUid,
                        optionPage
                    );
                    listOption = response.results.map((value: {name: string; pk: number}) => {
                        return {
                            label: value.name,
                            value: value.pk,
                        };
                    });
                    hasMore = !!response.next;
                    let newNotMappedCompanies = {...notMappedCompanies};
                    if (!(searchText in newNotMappedCompanies)) {
                        newNotMappedCompanies[searchText] = {};
                    }

                    newNotMappedCompanies[searchText][optionPage] = {
                        hasMore: hasMore,
                        options: listOption,
                    };
                    setNotMappedCompanies(newNotMappedCompanies);
                }

                listOption = listOption.filter(
                    (option) => !companiesToExclude.includes(option.value)
                );
                resolve({
                    options: listOption,
                    hasMore: hasMore,
                    additional: {
                        page: optionPage + 1,
                    },
                });
            } catch (error) {
                Logger.error(error);
                toast.error(t("filter.error.couldNotFetchShippers"));
                reject(error);
            }
        });

    const fetchAllExternalCompaniesByPk = async () => {
        // Get all external companies pk
        const externalCompanies: {
            label: any;
            value: any;
            company: any;
            pk: any;
            remote_id: any;
        }[] = [];
        try {
            setFetchingExternalCompanies();
            // @ts-ignore
            fetchListExternalCompany(connectorUid).then((response_external) => {
                response_external.map((itemExternal: any) => {
                    externalCompanies.push({
                        label: itemExternal.company.name,
                        value: itemExternal.company.name,
                        company: itemExternal.company.pk,
                        pk: itemExternal.pk,
                        remote_id: itemExternal.remote_id,
                    });
                });

                const sortExternalCompanies = [...externalCompanies].sort(
                    (a, b) => a.value - b.value
                );
                setExternalCompanies(sortExternalCompanies);

                setExternalCompaniesFetched();
            });
        } catch (error) {
            setExternalCompaniesFetched();
            throw error;
        }
    };

    const addExternalCompany = async (
        values: ShipperList,
        formikHelpers: FormikProps<ShipperList>
    ) => {
        let payload = values.shipperList.map((value) => {
            if (value.shipper_pk != null && value.shipper_remote_id !== "") {
                return {
                    company: {pk: value.shipper_pk},
                    remote_id: value.shipper_remote_id,
                };
            } else {
                return null;
            }
        });
        // Send all external companies without null values
        payload = payload.filter(function (e) {
            return e != null;
        });
        try {
            // @ts-ignore
            await fetchCreateExternalCompany(connectorUid, payload);
            toast.success(t("settings.externalCompany.added"));
            await fetchAllExternalCompaniesByPk();
            formikHelpers.resetForm();
            setNotMappedCompanies({});
        } catch (error) {
            getErrorMessagesFromServerError(error).then((error?: any) => {
                if (error) {
                    formikHelpers.setSubmitting(false);
                    formikHelpers.setErrors(error);
                }
            });
            toast.error(t("settings.externalCompany.addedError"));
        }
    };

    const deleteExternalCompany = async (pk: string) => {
        try {
            // @ts-ignore
            await fetchDeleteExternalCompany(connectorUid, pk);
            toast.success(t("settings.externalCompany.deleted"));
            let newExternalCompanies = [...externalCompanies];
            newExternalCompanies.splice(
                newExternalCompanies.findIndex((e: {pk: string}) => e.pk == pk),
                1
            );
            setExternalCompanies(newExternalCompanies);
            setNotMappedCompanies({});
        } catch (error) {
            toast.error(t("settings.externalCompany.deletedError"));
            throw error;
        }
    };

    const validationSchema = yup.object().shape({
        shipperList: yup.array(
            yup.object().shape({
                shipper_name: yup.string().required(t("common.mandatoryField")),
                shipper_remote_id: yup.string().required(t("common.mandatoryField")),
            })
        ),
    });

    const initialValues: ShipperList = {
        // @ts-ignore
        shipperList: [{shipper_remote_id: "", shipper_pk: undefined, shipper_name: undefined}],
    };

    useEffect(() => {
        fetchAllExternalCompaniesByPk();
    }, []);

    return (
        <>
            <Box padding={4} />
            <Text variant="captionBold" my={2}>
                {t("settings.shippersPlatforms.shipperBinding")}
            </Text>
            <p>{t("settings.shippersPlatforms.shippersMapping")}</p>
            <p>
                {t("settings.shippersPlatforms.mappingProvidedBy", {platform_name: platformName})}
            </p>
            <Box padding={2} />
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                validateOnBlur={false}
                validateOnChange={false}
                enableReinitialize={true}
                onSubmit={addExternalCompany}
            >
                {({values, errors, isSubmitting, setFieldValue}: FormikProps<ShipperList>) => (
                    <Form>
                        {fetchingExternalCompanies && (
                            <Box mt={2} mb={2}>
                                <LoadingWheel noMargin />
                            </Box>
                        )}
                        <ExternalCompanies
                            companies={externalCompanies}
                            deleteExternalCompany={deleteExternalCompany}
                        />
                        <MappingExternalCompaniesFields
                            values={values}
                            errors={errors}
                            setFieldValue={setFieldValue}
                            loadNotMappedCompanies={loadNotMappedCompanies}
                            externalCompanies={externalCompanies}
                        />
                        <Flex alignItems="flex-start" flexDirection="column">
                            <Box mt={3}>
                                <Flex mb={1}>
                                    <Box flex={1}>
                                        <Link
                                            onClick={() => {
                                                setFieldValue(
                                                    `shipperList.${values.shipperList.length}`,
                                                    {
                                                        shipper_name: undefined,
                                                        shipper_pk: undefined,
                                                        shipper_remote_id: undefined,
                                                    }
                                                );
                                            }}
                                            data-testid={`add-more-shipper-button`}
                                        >
                                            <Icon name="add" mr={2} />{" "}
                                            {t("settings.shippersPlatforms.addBinding")}
                                        </Link>
                                    </Box>
                                </Flex>
                            </Box>
                        </Flex>
                        <Flex alignItems="flex-end" flexDirection="column" mr={3}>
                            <Button
                                type="submit"
                                justifySelf="flex-end"
                                disabled={isSubmitting}
                                data-testid="add-shipper-external-company-button"
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

export default ShippersMapper;
