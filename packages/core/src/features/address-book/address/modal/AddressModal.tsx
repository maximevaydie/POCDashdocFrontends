import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    ButtonProps,
    Coordinates,
    Flex,
    LoadingWheel,
    Modal,
    Text,
    toast,
    useConfirmLeaving,
} from "@dashdoc/web-ui";
import {Address, AddressPayload, Company, SecurityProtocol, useToggle} from "dashdoc-utils";
import {Form, FormikHelpers, FormikProvider, useFormik} from "formik";
import isEmpty from "lodash.isempty";
import React, {ReactNode, useEffect, useState} from "react";
import {useSelector} from "react-redux";
import cloneDeep from "rfdc/default";

import {useDispatch} from "../../../../hooks/useDispatch";
import {useFeatureFlag} from "../../../../hooks/useFeatureFlag";
import {getConnectedCompany} from "../../../../../../../react/Redux/accountSelector";
import {fetchAddAddress} from "../../../../redux/actions/fetchAddAddress";
import {fetchRetrieveAddress} from "../../../../redux/actions/fetchAddress";
import {fetchCompany} from "../../../../redux/actions/fetchCompany";
import {fetchUpdateAddress} from "../../../../redux/actions/fetchUpdateAddress";
import {getFullAddress} from "../../../../../../../react/Redux/reducers/entitiesReducer";
import {apiService} from "../../../../services/api.service";
import {getErrorMessagesFromServerError} from "../../../../services/errors.service";
import {urlService} from "../../../../services/url.service";
import {HasNotFeatureFlag} from "../../../misc/FeatureFlag";
import {NO_COMPANY_VALUE} from "../../company/constants";
import {PartnerLink} from "../../partner/PartnerLink";
import {getAllAddressTypes, type AddressType} from "../types";

import {addressFormService} from "./addressForm.service";
import {DeleteAddressAction} from "./components/DeleteAddressAction";
import {ConfirmAddressNoCompanyModal} from "./ConfirmAddressNoCompanyModal";
import {ConfirmAddressWithoutGPSModal} from "./ConfirmAddressWithoutGPSModal";
import {CompanySection} from "./form-sections/CompanySection";
import {FlowSiteSection} from "./form-sections/FlowSiteSection";
import {InstructionAndSecuritySection} from "./form-sections/InstructionAndSecuritySection";
import {LocationSection} from "./form-sections/LocationSection";
import {OnSiteDurationSection} from "./form-sections/OnSiteDurationSection";
import {AddressForm} from "./types";
import {ValidateCoordinatesModal} from "./validate-coordinates-modal";

import type {CompanyCategory} from "../../company/CompanySelect";

type Props = {
    address?: Address | Partial<Omit<Address, "pk">>;
    addressCategory?: AddressType;
    company?: Company;
    companyBrowsable?: boolean;
    /** States wether we allow or not creating an address with no company. Defaults to `true` */
    noCompanyOption?: boolean;
    onSave: (values: Address) => void;
    onClose: () => void;
    /**
     * @deprecated to remove with the feature flag `logisticPointsHaveNoRole`
     */
    onDelete?: () => void;
};

// this component has been duplicated into frontend/src/waste/features/CreateOrEditAddressModal/CreateOrEditAddressModal.tsx and sanitized to fit WAM needs
// The common part covering needs for both TMS and WAM should be extracted into a @dashdoc/web-common component
// We should keep here only the specific TMS business part
// In the meantime, if you change something here, please change it also in CreateOrEditAddressModal.tsx
export function AddressModal({
    address: originalAddress,
    addressCategory,
    company,
    companyBrowsable,
    noCompanyOption = true,
    onSave,
    onDelete,
    onClose,
}: Props) {
    const connectedCompany = useSelector(getConnectedCompany);
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");
    const hasLogisticPointsHaveNoRoleEnabled = useFeatureFlag("logisticPointsHaveNoRole");

    const daySimulationEnabled = useFeatureFlag("daySimulation");

    const [securityProtocol, setSecurityProtocol] = useState<SecurityProtocol | undefined>(
        undefined
    );
    const [companyFromAddress, setCompanyFromAddress] = useState<Company | undefined>(undefined);
    const dispatch = useDispatch();

    const [confirmNoCompanyModalCallback, setConfirmNoCompanyModalCallback] =
        useState<Function | null>(null);

    const [isLoading, setIsLoading, setIsLoaded] = useToggle(true);
    const [
        isValidateCoordinatesModalOpen,
        showValidateCoordinatesModal,
        hideValidateCoordinatesModal,
    ] = useToggle(false);
    const [
        isConfirmAddressWithoutGPSModalOpen,
        showConfirmAddressWithoutGPSModal,
        hideConfirmAddressWithoutGPSModal,
    ] = useToggle(false);

    const formik = useFormik({
        initialValues: addressFormService.fillAddress(
            originalAddress,
            addressCategory,
            company,
            connectedCompany,
            hasBetterCompanyRolesEnabled,
            hasLogisticPointsHaveNoRoleEnabled
        ),
        onSubmit: handleSubmit,
        validate: (values: AddressForm) => addressFormService.validateValues(values),
        validateOnBlur: false,
        validateOnChange: false,
    });

    let addressPk: number | undefined = undefined;
    if (originalAddress && "pk" in originalAddress) {
        addressPk = originalAddress.pk;
    }
    const companyPk = originalAddress?.company?.pk;

    let securityProtocolPayload: number | undefined = undefined;
    if (originalAddress) {
        if (originalAddress.original) {
            securityProtocolPayload = originalAddress.original;
        } else if ("pk" in originalAddress) {
            securityProtocolPayload = originalAddress.pk;
        }
    }

    const {onConfirm, confirmModal} = useConfirmLeaving(formik.dirty, onClose);

    useEffect(() => {
        fetchPotentialSecurityProtocol(securityProtocolPayload);
        // We assume that the fetchPotentialSecurityProtocol will not change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [securityProtocolPayload]);

    useEffect(() => {
        async function fetchPotentialAddress(
            addressPk: number | undefined,
            companyPk: number | undefined
        ) {
            try {
                setIsLoading();
                let companyPromize: Promise<Company> | undefined;
                if (companyPk) {
                    companyPromize = dispatch(fetchCompany("" + companyPk));
                }
                if (addressPk) {
                    try {
                        const {type, response} = await dispatch(
                            fetchRetrieveAddress("" + addressPk)
                        );
                        if (type !== "RETRIEVE_ENTITIES_SUCCESS") {
                            Logger.error("Error while fetching address", response);
                            return;
                        }
                        const address = getFullAddress(response, response.result);
                        const company = companyPromize ? await companyPromize : undefined;
                        setCompanyFromAddress(company);
                        const values = addressFormService.fillAddress(
                            address,
                            addressCategory,
                            company,
                            connectedCompany,
                            hasBetterCompanyRolesEnabled,
                            hasLogisticPointsHaveNoRoleEnabled
                        );
                        formik.resetForm({values});
                    } catch (error) {
                        Logger.error(error);
                    }
                }
            } finally {
                setIsLoaded();
            }
        }
        fetchPotentialAddress(addressPk, companyPk);
        // We assume to not set formik as a dependency because it changes at each render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addressPk, companyPk, dispatch]);

    const disabled = formik.isSubmitting || isLoading;

    let companyCategory: CompanyCategory | undefined;
    if (addressCategory === "is_carrier") {
        companyCategory = "carrier";
    } else if (addressCategory === "is_shipper") {
        companyCategory = "shipper";
    } else if (addressCategory === "is_origin") {
        companyCategory = "origin";
    } else if (addressCategory === "is_destination") {
        companyCategory = "destination";
    }

    return (
        <>
            <Modal
                size="large"
                title={
                    originalAddress && addressPk
                        ? t("components.editAddress", {address: originalAddress.name})
                        : t("components.addLogisticPoint")
                }
                id="address-modal"
                data-testid="address-modal"
                onClose={onConfirm}
                mainButton={getMainButton()}
                secondaryButton={getSecondaryButton()}
                additionalFooterContent={
                    <Box>
                        <HasNotFeatureFlag flagName="logisticPointsHaveNoRole">
                            <DeleteAddressAction
                                originalAddress={originalAddress}
                                companyFromAddress={companyFromAddress}
                                onDelete={onDelete}
                            />
                        </HasNotFeatureFlag>
                    </Box>
                }
            >
                {isLoading ? (
                    <LoadingWheel />
                ) : (
                    <FormikProvider value={formik}>
                        <Form>
                            <Flex mb={4} justifyContent="space-between">
                                <Text variant="h1">{t("common.general")}</Text>
                                {companyBrowsable && formik.values.company?.pk && (
                                    <PartnerLink pk={formik.values.company.pk} />
                                )}
                            </Flex>
                            <CompanySection
                                formik={formik}
                                noCompanyOption={noCompanyOption}
                                disabled={disabled}
                                companyCategory={companyCategory}
                            />
                            <LocationSection
                                formik={formik}
                                originalAddress={originalAddress}
                                connectedCompany={connectedCompany}
                                disabled={disabled}
                            />
                            <InstructionAndSecuritySection
                                formik={formik}
                                securityProtocol={securityProtocol}
                                disabled={disabled}
                            />
                            {daySimulationEnabled &&
                                addressFormService.isOriginOrDestination(formik) && (
                                    <OnSiteDurationSection
                                        formik={formik}
                                        addressPk={addressPk}
                                        disabled={disabled}
                                    />
                                )}
                            <FlowSiteSection formik={formik} disabled={disabled} />
                        </Form>
                    </FormikProvider>
                )}
            </Modal>
            {confirmNoCompanyModalCallback && (
                <ConfirmAddressNoCompanyModal
                    onConfirm={() => {
                        confirmNoCompanyModalCallback();
                        setConfirmNoCompanyModalCallback(null);
                    }}
                    onClose={() => {
                        setConfirmNoCompanyModalCallback(null);
                        formik.setSubmitting(false);
                    }}
                />
            )}
            {isConfirmAddressWithoutGPSModalOpen && (
                <ConfirmAddressWithoutGPSModal
                    address={formik.values as Address}
                    onSaveAddress={() => {
                        hideConfirmAddressWithoutGPSModal();
                        hideValidateCoordinatesModal();
                        formik.setFieldValue("coords_validated", false);
                        formik.submitForm();
                    }}
                    onClose={hideConfirmAddressWithoutGPSModal}
                />
            )}
            {isValidateCoordinatesModalOpen && (
                <ValidateCoordinatesModal
                    address={formik.values as Address}
                    saveWithoutGPS={showConfirmAddressWithoutGPSModal}
                    saveWithGPS={handleSaveAddressWithCoordinates}
                    onClose={hideValidateCoordinatesModal}
                />
            )}
            {confirmModal}
        </>
    );

    function getMainButton(): ButtonProps | null {
        if (addressFormService.shouldShowGPSCoordsBlock(formik, originalAddress)) {
            const content: ReactNode = t(
                "addressModal.verifyGPSCoordinates",
                {},
                {
                    capitalize: true,
                }
            );
            return {
                children: content,
                type: "button",
                onClick: handleVerifyGPSCoordinates,
                "data-testid": "address-modal-verify-gps",
            };
        }
        return {
            children: t("common.save"),
            type: "button",
            disabled,
            onClick: handleSave,
            "data-testid": "address-modal-save",
        };
    }

    function getSecondaryButton(): ButtonProps | null {
        if (addressFormService.shouldShowGPSCoordsBlock(formik, originalAddress)) {
            return {
                children: t("addressModal.saveWithoutGPSCoordinates"),
                type: "button",
                onClick: handleSaveWithoutGPSCoordinates,
                variant: "plain",
                "data-testid": "address-modal-save-without-gps",
            };
        }
        if (addressPk) {
            return {
                children: t(
                    "addressModal.verifyGPSCoordinates",
                    {},
                    {
                        capitalize: true,
                    }
                ),
                type: "button",
                variant: "plain",
                onClick: handleVerifyGPSCoordinates,
                "data-testid": "address-modal-verify-gps",
            };
        }
        return {
            disabled: formik.isSubmitting,
            onClick: onClose,
            "data-testid": "address-modal-cancel-button",
        };
    }

    async function handleVerifyGPSCoordinates() {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length === 0) {
            if (formik.values.company?.pk === NO_COMPANY_VALUE) {
                setConfirmNoCompanyModalCallback(showValidateCoordinatesModal);
            } else {
                showValidateCoordinatesModal();
            }
        }
    }

    async function handleSave() {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length === 0) {
            if (
                // Only ask if not editing
                !originalAddress &&
                formik.values.company?.pk === NO_COMPANY_VALUE
            ) {
                setConfirmNoCompanyModalCallback(formik.submitForm);
                return;
            } else {
                formik.submitForm();
            }
        }
    }

    async function handleSaveWithoutGPSCoordinates() {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length === 0) {
            if (formik.values.company?.pk === NO_COMPANY_VALUE) {
                setConfirmNoCompanyModalCallback(showConfirmAddressWithoutGPSModal);
            } else {
                showConfirmAddressWithoutGPSModal();
            }
        }
    }

    async function handlePatchSecurityProtocol({pk}: SecurityProtocol, document: File) {
        const formData = new FormData();
        formData.append("document", document);
        formData.append("document_title", document.name);
        const securityProtocolUpdated: SecurityProtocol = await apiService.SecurityProtocols.patch(
            pk,
            {
                data: formData as Partial<SecurityProtocol>,
            }
        );
        return securityProtocolUpdated;
    }

    async function handleDeleteSecurityProtocol({pk}: SecurityProtocol) {
        try {
            await apiService.SecurityProtocols.delete(pk);
            toast.success(t("addressModal.securityProtocolDeleted"));
        } catch (error) {
            Logger.error(error);
            toast.error(t("addressModal.securityProtocolDeleted.error"));
        }
    }

    async function handleSubmitSecurityProtocol(
        securityProtocolFile: File | null,
        address: Address
    ) {
        if (securityProtocolFile === null) {
            if (securityProtocol) {
                await handleDeleteSecurityProtocol(securityProtocol);
            } else {
                Logger.error("No security protocol to delete");
            }
            return;
        }

        if (securityProtocol) {
            await handlePatchSecurityProtocol(securityProtocol, securityProtocolFile);
            return;
        }
        const securityProtocolPayload = {
            address: (address.original ?? address.pk).toString(),
            document: securityProtocolFile,
            document_title: securityProtocolFile.name,
        };
        await addressFormService.createSecurityProtocol(securityProtocolPayload);
    }

    async function handleSubmit(values: AddressForm, props: FormikHelpers<AddressForm>) {
        const {securityProtocolFile, addressTypes, flowUrl, ...addressValues} = values;
        let address: AddressPayload = cloneDeep(addressValues);

        if (!originalAddress || !addressPk) {
            // @ts-ignore
            delete address.pk;
        }

        if (address.company.pk === NO_COMPANY_VALUE) {
            // TODO: clean this by fixing the BaseAddress type
            // @ts-ignore
            address.company = null;
        }
        address.flow_site_slug = null;
        if (flowUrl !== undefined && urlService.isValidFlowSiteUrl(flowUrl)) {
            // get the slug from the URL
            const slug = urlService.extractFlowSlug(flowUrl);
            address.flow_site_slug = slug;
        }

        if (address.company?.pk) {
            // The endpoint rejects a payload which has both
            // company.pk AND company.remote_id. BUG-2796
            address.company.remote_id = undefined;
        }

        // Set address types in address before submitting
        getAllAddressTypes(hasBetterCompanyRolesEnabled).forEach(
            (addressType: AddressType) =>
                (address[addressType] = addressTypes.some(
                    (selectedAddressType) => selectedAddressType.value === addressType
                ))
        );

        try {
            let response:
                | Address
                | {
                      flow_site_slug: {
                          code: string[];
                          detail: string[];
                      };
                  };
            if ("pk" in address) {
                response = await dispatch(fetchUpdateAddress(address.pk, address));
            } else {
                response = await dispatch(fetchAddAddress(address));
            }
            if ("pk" in response) {
                if (securityProtocolFile !== undefined) {
                    await handleSubmitSecurityProtocol(securityProtocolFile, response);
                }
                onSave?.(response);
                props.setSubmitting(false);
                onClose();
            } else {
                // something goes wrong
                if ("flow_site_slug" in response) {
                    props.setFieldError(
                        "flowUrl",
                        t("tmsIntegration.flowBookingLink.invalidLink")
                    );
                } else {
                    const errorMessages = await getErrorMessagesFromServerError(response);
                    setErrors(errorMessages, props);
                }
            }
        } catch (error) {
            const errorMessages = await getErrorMessagesFromServerError(error);
            setErrors(errorMessages, props);
        }
    }

    function setErrors(errors: {[key: string]: string}, props: FormikHelpers<AddressForm>) {
        Object.keys(errors).forEach((key) => {
            props.setFieldError(key, errors[key]);
        });
        props.setSubmitting(false);
    }

    function handleSaveAddressWithCoordinates({
        latitude,
        longitude,
        radius,
    }: Coordinates & {radius: number}) {
        hideValidateCoordinatesModal();
        formik.setFieldValue("latitude", latitude);
        formik.setFieldValue("longitude", longitude);
        formik.setFieldValue("radius", radius);
        formik.setFieldValue("coords_validated", !!(latitude !== null && longitude !== null));
        formik.submitForm();
    }

    async function fetchPotentialSecurityProtocol(securityProtocolPayload: number | undefined) {
        if (securityProtocolPayload) {
            try {
                const result =
                    await apiService.Addresses.getSecurityProtocol(securityProtocolPayload);
                // An address may have a security protocol
                if (!isEmpty(result)) {
                    setSecurityProtocol(result);
                }
            } catch (error) {
                // We don't have to raise an error if no security protocol is linked to this address
                if (error.status !== 404) {
                    Logger.error(error);
                    toast.error(t("securityProtocol.error.couldNotFetch"));
                }
            }
        }
    }
}
