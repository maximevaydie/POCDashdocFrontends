import {CompanySelect, CommonModalProps, useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    FloatingPanelWithValidationButtons,
    Icon,
    Select,
    SwitchInput,
    SelectOption,
    Text,
    Circled,
    TextInput,
} from "@dashdoc/web-ui";
import {FormGroup} from "@dashdoc/web-ui";
import {CarrierAssignationRule, Company, RequestedVehicle} from "dashdoc-utils";
import {Field, Form, FormikProvider, useFormik} from "formik";
import React, {useState} from "react";

import {CompanyAndContactPicker} from "app/features/company/contact/contacts-picker/CompanyAndContactPicker";
import {
    NewRequestedVehicle,
    RequestedVehicleSelect,
} from "app/features/fleet/requested-vehicle/RequestedVehicleSelect";

import {AreaMenu} from "./AreaMenu";

export type CarrierAssignationRuleModalProps = CommonModalProps<CarrierAssignationRule> & {
    entity?: CarrierAssignationRule;
};

const validate = (values: CarrierAssignationRule) => {
    let errors: any = {};
    if (!values.name) {
        errors.name = t("errors.field_cannot_be_empty");
    }
    if (!values.origin_area || values.origin_area.places.length === 0) {
        errors.origin_area = t("errors.field_cannot_be_empty");
    }
    if (!values.destination_area || values.destination_area.places.length === 0) {
        errors.destination_area = t("errors.field_cannot_be_empty");
    }
    if (!values.requested_vehicle) {
        errors.requested_vehicle = t("errors.field_cannot_be_empty");
    }
    if (!values.carrier) {
        errors.carrier = t("errors.field_cannot_be_empty");
    }
    return errors;
};

type FormValues = Partial<CarrierAssignationRule> & {
    requested_vehicle?: RequestedVehicle | NewRequestedVehicle | null;
};

export function CarrierAssignationRuleModal({
    entity,
    onSubmit,
    isReadOnly,
    isSubmitting,
    onClose,
}: CarrierAssignationRuleModalProps) {
    const recipientsOrderEnabled = useFeatureFlag("recipientsOrder");
    const isDisabled = isReadOnly || isSubmitting;
    const [{showOrigin, showDestination}, setState] = useState<{
        showOrigin: boolean;
        showDestination: boolean;
    }>({showOrigin: false, showDestination: false});
    let initialValues: FormValues = {};
    if (entity) {
        initialValues = {...entity, requested_vehicle: entity.requested_vehicle};
    } else {
        initialValues = {name: undefined, type: "simple", active: true};
    }

    const formik = useFormik({
        initialValues,
        onSubmit,
        validate,
        validateOnBlur: false,
        validateOnChange: false,
    });
    const {values, setFieldValue} = formik;
    return (
        <FloatingPanelWithValidationButtons
            data-testid="create-assignation-rule-modal-panel"
            mainButton={{
                onClick: () => {
                    formik.submitForm();
                },
                "data-testid": "create-assignation-rule-modal-button",
                disabled: isDisabled,
            }}
            onClose={() => {
                if (!isSubmitting) {
                    onClose();
                }
            }}
            title={
                entity
                    ? t("shipper.assignationRule.editTitle")
                    : t("shipper.assignationRule.createTitle")
            }
        >
            {isReadOnly && (
                <Flex mt={2} borderRadius="4px" p={3} backgroundColor="yellow.ultralight">
                    <Icon mr={2} name="warning" color="yellow.dark" />
                    <Box>
                        <Text mb={1} variant="caption">
                            {t("sidebar.role-readonly")}
                        </Text>
                    </Box>
                </Flex>
            )}
            <FormikProvider value={formik}>
                <Form id="create-assignation-rule-modal">
                    <Text variant="h1" color="grey.dark" fontWeight={600} mt={4} mb={3}>
                        {t("common.general")}
                    </Text>
                    <FormGroup>
                        <TextInput
                            label={t("shipper.assignationRule.nameLabel")}
                            value={values.name ?? ""}
                            disabled={isDisabled}
                            onChange={(value) => setFieldValue("name", value)}
                            required
                            data-testid="assignation-rule-form-name"
                            error={formik.errors.name as string}
                        />
                    </FormGroup>
                    <Flex justifyContent="space-between">
                        <Text variant="h1" color="grey.dark" fontWeight={600} mt={4} mb={3}>
                            {t("common.rules")}
                        </Text>
                        <SwitchInput
                            labelRight={t("common.enable")}
                            onChange={(value) => setFieldValue("active", value)}
                            disabled={isDisabled}
                            value={values?.active ?? false}
                            data-testid={"assignation-rule-form-active"}
                        />
                    </Flex>

                    <Flex mt={4} mb={3} alignItems="baseline">
                        <Circled>1</Circled>
                        <Text
                            variant="h1"
                            fontWeight={400}
                            fontSize={4}
                            color="grey.ultradark"
                            ml={2}
                        >
                            {t("shipper.assignationRule.orderToAssign")}
                        </Text>
                    </Flex>
                    <FormGroup>
                        <Text
                            variant="h1"
                            color="grey.ultradark"
                            fontWeight={600}
                            fontSize={2}
                            mt={4}
                            mb={3}
                        >
                            {t("common.when")}
                        </Text>
                        <Select
                            data-testid={"assignation-rule-form-origin"}
                            label={t("shipper.assignationRule.origin")}
                            options={[]}
                            value={
                                values.origin_area
                                    ? {
                                          label: values.origin_area.name,
                                          value: values.origin_area.name,
                                      }
                                    : null
                            }
                            isSearchable={false}
                            menuIsOpen={false}
                            isDisabled={isDisabled}
                            components={{ClearIndicator: () => null}}
                            onMenuOpen={() => {
                                setState((prev) => {
                                    if (isDisabled || prev.showOrigin) {
                                        return prev;
                                    } else {
                                        return {...prev, showOrigin: true};
                                    }
                                });
                            }}
                            required
                            error={formik.errors.origin_area as string}
                        />
                        {showOrigin && (
                            <AreaMenu
                                defaultArea={values.origin_area}
                                onChange={(origin) => {
                                    setFieldValue("origin_area", origin);
                                    setState((prev) => ({...prev, showOrigin: false}));
                                }}
                            />
                        )}
                    </FormGroup>
                    <FormGroup>
                        <Select
                            data-testid={"assignation-rule-form-destination"}
                            label={t("shipper.assignationRule.destination")}
                            options={[]}
                            value={
                                values.destination_area
                                    ? {
                                          label: values.destination_area.name,
                                          value: values.destination_area.name,
                                      }
                                    : null
                            }
                            isSearchable={false}
                            menuIsOpen={false}
                            isDisabled={isDisabled}
                            components={{ClearIndicator: () => null}}
                            onMenuOpen={() => {
                                setState((prev) => {
                                    if (isDisabled || prev.showDestination) {
                                        return prev;
                                    } else {
                                        return {...prev, showDestination: true};
                                    }
                                });
                            }}
                            required
                            error={formik.errors.destination_area as string}
                        />
                        {showDestination && (
                            <AreaMenu
                                defaultArea={values.destination_area}
                                onChange={(destination) => {
                                    setFieldValue("destination_area", destination);
                                    setState((prev) => ({...prev, showDestination: false}));
                                }}
                            />
                        )}
                    </FormGroup>

                    <FormGroup>
                        <RequestedVehicleSelect
                            requestedVehicle={values.requested_vehicle}
                            onChange={(requestedVehicle) =>
                                setFieldValue("requested_vehicle", requestedVehicle)
                            }
                            error={formik.errors.requested_vehicle as string}
                            required
                            data-testid={"assignation-rule-form-requested-vehicle"}
                            isDisabled={isDisabled}
                        />
                    </FormGroup>

                    <Flex mt={4} mb={3} alignItems="baseline">
                        <Circled>2</Circled>
                        <Text
                            variant="h1"
                            fontWeight={400}
                            fontSize={4}
                            color="grey.ultradark"
                            ml={2}
                        >
                            {t("shipper.assignationRule.carrierToSelect")}
                        </Text>
                    </Flex>
                    {recipientsOrderEnabled ? (
                        <CompanyAndContactPicker
                            companyError={formik.errors.carrier as string}
                            flexDirection="column"
                            initialSelection={{
                                company: formik.values.carrier ?? null,
                                contacts: formik.values.carrier_contacts || [],
                                key: "_" /* We don't use the key in this use case */,
                            }}
                            initialSendToCarrier="disabled"
                            onUpdate={(newReceiver) => {
                                formik.setFieldValue("carrier", newReceiver.company);
                                formik.setFieldValue("carrier_contacts", newReceiver.contacts);
                            }}
                            multipleContacts
                            displayTooltip
                        />
                    ) : (
                        <Field
                            name="carrier"
                            component={CompanySelect}
                            onChange={(company: SelectOption<string> & Company) => {
                                formik.setFieldValue("carrier", company);
                            }}
                            value={formik.values.carrier}
                            label={t("common.carrier")}
                            error={formik.errors.carrier as string}
                            required
                            isClearable={false}
                            isDisabled={isDisabled}
                        />
                    )}
                </Form>
            </FormikProvider>
        </FloatingPanelWithValidationButtons>
    );
}
