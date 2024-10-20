import {
    CompanyModal,
    getConnectedCompanyId,
    HasFeatureFlag,
    HasNotFeatureFlag,
    PartnerModal,
    searchSelector,
    type PartnerDetailOutput,
} from "@dashdoc/web-common";
import {SelectOptions, t} from "@dashdoc/web-core";
import {
    Box,
    CreatableSelect,
    ErrorMessage,
    Flex,
    Select,
    SelectInputActionMeta,
    SwitchInput,
} from "@dashdoc/web-ui";
import {Company, Trucker, useToggle} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";
import {Controller, useFormContext} from "react-hook-form";
import {z} from "zod";

import {
    FieldSet,
    FieldSetLegend,
} from "app/features/fleet/trucker/trucker-modal/form-sections/generic";
import {fetchDebouncedSearchCompanies} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";

export const specificitiesFormValidationSchema = z.object({
    is_rented: z.boolean(),
    is_dedicated: z.boolean(),
    carrier: z.object({value: z.number(), label: z.string()}).nullable(),
    communication_preference: z.string().nullable(),
});

export function getSpecificitiesDefaultValues(trucker?: Trucker) {
    return trucker
        ? {
              is_rented: trucker.is_rented ?? false, // BUG-2111: if is_rented is null, it blocks the user from submitting the form
              is_dedicated: trucker.is_dedicated ?? false,
              carrier: trucker.carrier
                  ? {value: trucker.carrier.pk, label: trucker.carrier.name}
                  : null,
              communication_preference: trucker.communication_preference ?? "app",
          }
        : {
              is_rented: false,
              is_dedicated: false,
              carrier: null,
              communication_preference: "app",
          };
}
export function SpecificitiesFormSection({
    queryName,
    trucker,
}: {
    queryName: string;
    trucker?: Trucker;
}) {
    const dispatch = useDispatch();
    const [newCompanyName, setNewCompanyName] = useState("");
    const [isAddCompanyModalOpen, openAddCompanyModal, closeAddCompanyModal] = useToggle();

    const searchingCompanies = useSelector((state) => state.loading.companiesSearch);
    const connectedCompanyId = useSelector(getConnectedCompanyId);

    const companyOptions: SelectOptions<number> = useSelector((state) => {
        const companies: Company[] = searchSelector(state.companies, queryName);
        return companies
            .filter(({pk}) => pk !== connectedCompanyId)
            .map((company) => {
                return {value: company.pk, label: company.name};
            });
    });
    const form = useFormContext();
    const isRented = form.watch("is_rented");
    const isDedicated = form.watch("is_dedicated");

    useEffect(() => {
        dispatch(
            fetchDebouncedSearchCompanies(queryName, {text: "", category: "carrier"}, 1, true)
        );
    }, [dispatch, queryName]);

    const searchCompanies = useCallback(
        (input: string, {action}: SelectInputActionMeta) => {
            if (action === "input-change") {
                dispatch(
                    fetchDebouncedSearchCompanies(
                        queryName,
                        {text: input, category: "carrier"},
                        1,
                        true
                    )
                );
            }
        },
        [dispatch, queryName]
    );
    const handleNewCarrierClick = useCallback(
        (newCompanyName: string) => {
            openAddCompanyModal();
            setNewCompanyName(newCompanyName);
        },
        [openAddCompanyModal]
    );

    const isValidNewCompany = useCallback(
        (label: string) => {
            if (!label) {
                return false;
            }
            return (
                companyOptions.filter((c) => c.label?.toUpperCase() === label.toUpperCase())
                    .length === 0
            );
        },
        [companyOptions]
    );

    const COMMUNICATION_PREFERENCE_OPTIONS: SelectOptions<string> = [
        {value: "email", label: t("common.email")},
        {value: "app", label: t("common.mobileApp")},
    ].sort((a, b) => a.label.localeCompare(b.label));

    return (
        <FieldSet mt={5}>
            <FieldSetLegend>{t("common.specificities")}</FieldSetLegend>

            <Controller
                name="is_rented"
                render={({field: {value, onChange}, fieldState: {error}}) => (
                    <Box mt={3}>
                        <SwitchInput
                            value={value}
                            data-testid="input-is-rented"
                            labelRight={t("fleet.rentalDriver")}
                            disabled={!!trucker || isDedicated}
                            onChange={onChange}
                        />
                        {error?.message && <ErrorMessage error={error?.message} />}
                    </Box>
                )}
            />

            <HasFeatureFlag flagName="dedicatedResources">
                <Controller
                    name="is_dedicated"
                    render={({field: {value, onChange}, fieldState: {error}}) => (
                        <Box mt={3}>
                            <SwitchInput
                                value={value}
                                data-testid="input-is-dedicated"
                                labelRight={t("fleet.dedicatedDriver")}
                                disabled={!!trucker || isRented}
                                onChange={onChange}
                            />
                            {error?.message && <ErrorMessage error={error?.message} />}
                        </Box>
                    )}
                />
            </HasFeatureFlag>

            {(isRented || isDedicated) && (
                <Box mt={3} data-testid="modal-select-company">
                    <Controller
                        name="carrier"
                        render={({field: {value, onChange}, fieldState: {error}}) => (
                            <CreatableSelect
                                required
                                isDisabled={!!trucker}
                                label={t("common.company")}
                                error={error?.message}
                                isLoading={searchingCompanies}
                                value={value || undefined}
                                onChange={onChange}
                                options={companyOptions}
                                placeholder={t("components.enterCompanyPlaceholder")}
                                onInputChange={searchCompanies}
                                onCreateOption={handleNewCarrierClick}
                                isValidNewOption={isValidNewCompany}
                                formatCreateLabel={(company: string) =>
                                    t("components.addCompany", {company})
                                }
                            />
                        )}
                    />
                </Box>
            )}
            {isDedicated && (
                <Flex justifyContent="space-between" mt={3}>
                    <Box flexBasis="100%" height="40px">
                        <Controller
                            name="communication_preference"
                            render={({field: {value, onChange}, fieldState: {error}}) => {
                                const selectedValue = COMMUNICATION_PREFERENCE_OPTIONS.find(
                                    (option) => option.value === value
                                );
                                return (
                                    <Select
                                        value={selectedValue}
                                        onChange={(option) => onChange(option?.value)}
                                        options={COMMUNICATION_PREFERENCE_OPTIONS}
                                        placeholder={t("trucker.communicationPreference")}
                                        label={t("trucker.communicationPreference")}
                                        error={error?.message}
                                        data-testid="input-communication-preference"
                                    />
                                );
                            }}
                        />
                    </Box>
                </Flex>
            )}

            {isAddCompanyModalOpen && (
                <>
                    <HasFeatureFlag flagName="betterCompanyRoles">
                        <PartnerModal
                            onClose={closeAddCompanyModal}
                            onSaved={handleUpdateCarrier}
                            partner={{name: newCompanyName}}
                        />
                    </HasFeatureFlag>
                    <HasNotFeatureFlag flagName="betterCompanyRoles">
                        <CompanyModal
                            onClose={closeAddCompanyModal}
                            onSave={handleUpdateCarrier}
                            company={{name: newCompanyName}}
                        />
                    </HasNotFeatureFlag>
                </>
            )}
        </FieldSet>
    );

    function handleUpdateCarrier(company: Company | PartnerDetailOutput) {
        form.setValue("carrier", {
            value: company.pk,
            label: company.name,
        });
        closeAddCompanyModal();
    }
}
