import {
    CompanyModal,
    HasFeatureFlag,
    HasNotFeatureFlag,
    LocalizedPhoneNumberInput,
    PartnerModal,
    getConnectedCompany,
    getErrorMessage,
    searchSelector,
    type PartnerDetailOutput,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    CreatableSelect,
    LoadingWheel,
    Modal,
    SelectInputActionMeta,
    SelectOption,
    SelectOptions,
    TextInput,
    toast,
} from "@dashdoc/web-ui";
import {Company, Trucker, useToggle, yup, type RealSimpleCompany} from "dashdoc-utils";
import {FormikProps, FormikProvider, useFormik} from "formik";
import pick from "lodash.pick";
import React, {useCallback, useEffect, useState} from "react";
import {Value} from "react-phone-number-input";

import {fetchAddTrucker, fetchDebouncedSearchCompanies} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";

const RentalTruckerFormValidationSchema = () =>
    yup.object().shape({
        carrier: yup
            .object()
            .nullable()
            .required(t("common.mandatoryField"))
            .shape({value: yup.string(), label: yup.string()}),
        first_name: yup.string().required(t("common.mandatoryField")),
        last_name: yup.string().required(t("common.mandatoryField")),
        phone_number: yup.string().phone(t("common.invalidPhoneNumber")).nullable(true),
    });

type RentalTruckerForm = {
    carrier?: SelectOption;
    first_name?: string;
    last_name?: string;
    phone_number: string;
};
const queryName = "add-rental-trucker-modal";

type AddRentalTruckerModalProps = {
    onSubmitTrucker?: (trucker: Trucker) => void;
    onClose: () => void;
    carrier?: RealSimpleCompany;
    truckerFirstName?: string;
};

export default function AddRentalTruckerModal({
    onSubmitTrucker,
    onClose,
    carrier,
    truckerFirstName,
}: AddRentalTruckerModalProps) {
    const [loading, setLoading] = useState(false);
    const [isAddCompanyModalOpen, openAddCompanyModal, closeAddCompanyModal] = useToggle();
    const [newCompanyName, setNewCompanyName] = useState("");
    const connectedCompany = useSelector(getConnectedCompany);

    const dispatch = useDispatch();
    const companyOptions: SelectOptions<number> = useSelector((state) => {
        const companies: Company[] = searchSelector(state.companies, queryName);
        return companies.map((company) => {
            return {value: company.pk, label: company.name};
        });
    });
    const searchingCompanies = useSelector((state) => state.loading.companiesSearch);

    useEffect(() => {
        dispatch(fetchDebouncedSearchCompanies(queryName, {text: ""}, 1, true));
    }, []);

    const submit = useCallback(
        (values: RentalTruckerForm) => {
            const errors: any = {};
            const mandatoryFields: Array<"carrier" | "first_name" | "last_name"> = [
                "carrier",
                "first_name",
                "last_name",
            ];
            for (let field of mandatoryFields) {
                if (!values[field]) {
                    errors[field] = t("common.mandatoryField");
                }
            }
            if (Object.keys(errors).length > 0) {
                return Promise.reject(errors);
            } else {
                setLoading(true);
                return new Promise<void>((resolve, reject) => {
                    const user = pick(values, ["first_name", "last_name"]);
                    const action = dispatch(
                        fetchAddTrucker({
                            phone_number: values.phone_number,
                            carrier: values?.carrier?.value,
                            user: user,
                        })
                    );
                    action.then(
                        (response: Trucker) => {
                            setLoading(false);
                            if (onSubmitTrucker) {
                                onSubmitTrucker(response);
                            }
                            onClose();
                            resolve();
                        },
                        (e: any) => {
                            // @ts-ignore
                            toast.error(getErrorMessage(e, undefined));
                            setLoading(false);
                            reject(e);
                        }
                    );
                });
            }
        },
        [onSubmitTrucker, onClose]
    );

    const searchCompanies = useCallback(
        (input: string, {action}: SelectInputActionMeta) => {
            if (action === "input-change") {
                dispatch(fetchDebouncedSearchCompanies(queryName, {text: input}, 1, true));
            }
        },
        [queryName]
    );

    const isValidNewCompany = useCallback(
        (label: string) => {
            if (!label) {
                return false;
            }
            return (
                // @ts-ignore
                companyOptions.filter((c) => c.label.toUpperCase() === label.toUpperCase())
                    .length === 0
            );
        },
        [companyOptions]
    );

    const handleUpdateCarrier = useCallback(
        (company: Company | PartnerDetailOutput, formikProps: FormikProps<RentalTruckerForm>) => {
            formikProps.setFieldValue("carrier", {
                value: company.pk,
                label: company.name,
            });
            closeAddCompanyModal();
        },
        []
    );

    const handleNewCarrierClick = useCallback((newCompanyName: string) => {
        openAddCompanyModal();
        setNewCompanyName(newCompanyName);
    }, []);

    const formik = useFormik({
        initialValues: {
            carrier: carrier
                ? {
                      value: carrier.pk,
                      label: carrier.name,
                  }
                : undefined,
            first_name: truckerFirstName || "",
            last_name: "",
            phone_number: "",
        },
        validationSchema: RentalTruckerFormValidationSchema(),
        validateOnBlur: false,
        validateOnChange: false,
        onSubmit: submit,
    });

    return (
        <div className={isAddCompanyModalOpen ? "hidden" : ""}>
            <Modal
                title={t("components.addRentalDriver")}
                id="add-rental-trucker-modal"
                onClose={onClose}
                data-testid="add-rental-trucker-modal"
                mainButton={{
                    type: "submit",
                    disabled: formik.isSubmitting,
                    onClick: formik.submitForm,
                    "data-testid": "add-rental-trucker-modal-company-save-button",
                    children: t("common.save"),
                }}
            >
                {loading ? (
                    <LoadingWheel />
                ) : (
                    <FormikProvider value={formik}>
                        <Box mb={2} data-testid="modal-select-company">
                            <CreatableSelect
                                required
                                label={t("common.company")}
                                error={formik.errors.carrier as unknown as string}
                                isDisabled={!!carrier}
                                isLoading={searchingCompanies}
                                value={formik.values.carrier || undefined}
                                onChange={(value: SelectOption) =>
                                    formik.setFieldValue("carrier", value)
                                }
                                options={companyOptions}
                                placeholder={t("components.enterCompanyPlaceholder")}
                                onInputChange={searchCompanies}
                                onCreateOption={handleNewCarrierClick}
                                isValidNewOption={isValidNewCompany}
                                formatCreateLabel={(company: string) =>
                                    t("components.addCompany", {company})
                                }
                            />
                        </Box>
                        <Box mb={2}>
                            <TextInput
                                required
                                {...formik.getFieldProps("first_name")}
                                placeholder={t("common.typeHere")}
                                data-testid="input-first-name"
                                label={t("settings.firstNameLabel")}
                                onChange={(_, e) => {
                                    formik.handleChange(e);
                                }}
                                error={formik.errors.first_name as string}
                            />
                        </Box>
                        <Box mb={2}>
                            <TextInput
                                required
                                placeholder={t("common.typeHere")}
                                {...formik.getFieldProps("last_name")}
                                data-testid="input-last-name"
                                label={t("settings.lastNameLabel")}
                                onChange={(_, e) => {
                                    formik.handleChange(e);
                                }}
                                error={formik.errors.last_name as string}
                            />
                        </Box>
                        <Box>
                            <LocalizedPhoneNumberInput
                                label={t("common.phoneNumber")}
                                data-testid="input-phone-number"
                                value={formik.values.phone_number as Value}
                                onChange={(phoneNumber?: Value) =>
                                    formik.setFieldValue("phone_number", phoneNumber)
                                }
                                error={formik.errors.phone_number}
                                country={carrier?.country || connectedCompany?.country}
                            />
                        </Box>

                        {isAddCompanyModalOpen && (
                            <>
                                <HasFeatureFlag flagName="betterCompanyRoles">
                                    <PartnerModal
                                        onClose={closeAddCompanyModal}
                                        onSaved={(partner) => handleUpdateCarrier(partner, formik)}
                                        partner={{name: newCompanyName}}
                                    />
                                </HasFeatureFlag>
                                <HasNotFeatureFlag flagName="betterCompanyRoles">
                                    <CompanyModal
                                        onClose={closeAddCompanyModal}
                                        onSave={(company) => handleUpdateCarrier(company, formik)}
                                        company={{name: newCompanyName}}
                                    />
                                </HasNotFeatureFlag>
                            </>
                        )}
                    </FormikProvider>
                )}
            </Modal>
        </div>
    );
}
