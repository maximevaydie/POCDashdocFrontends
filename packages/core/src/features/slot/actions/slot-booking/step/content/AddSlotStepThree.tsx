import {t} from "@dashdoc/web-core";
import {Box, Checkbox, Required, Text, TextInput, TextInputEditableList} from "@dashdoc/web-ui";
import {CompanyPicker} from "features/company/company-picker/CompanyPicker";
import {
    CreateCompanyPayload,
    SelectCompanyPayload,
} from "features/company/SelectOrCreateCompanyForm";
import {securityProtocolService} from "features/security-protocol/securityProtocol.service";
import {SecurityProtocolLink} from "features/security-protocol/SecurityProtocolLink";
import React, {useEffect} from "react";
import {Control, Controller, useFormContext} from "react-hook-form";
import {useSelector} from "react-redux";
import {selectFlowDelegateCompanies, selectProfile} from "redux/reducers/flow";
import {rightPolicyServices} from "services/rightPolicy.service";
import {Site, SlotCustomField} from "types";
import {Company} from "types/company";

interface AddSlotStepThreeProps {
    site: Site;
    control: Control<any, object>;
    onCreateCompany: (payload: CreateCompanyPayload) => Promise<Company>;
    onJoinCompany: (payload: SelectCompanyPayload | CreateCompanyPayload) => Promise<Company>;
}

export function AddSlotStepThree({
    site,
    control,
    onCreateCompany,
    onJoinCompany,
}: AddSlotStepThreeProps) {
    const {getValues} = useFormContext();
    const delegateCompanies = useSelector(selectFlowDelegateCompanies);
    const profile = useSelector(selectProfile);
    const needAcceptSecurityProtocol = securityProtocolService.needAccept(profile, site);

    const allowCreateCompany = rightPolicyServices.canCreateCompany(profile);
    const {
        trigger,
        formState: {errors},
    } = useFormContext();

    useEffect(() => {
        // FIXME: hack to trigger the validation explicitly, we need to find a better way to do this
        trigger();
    }, [trigger]);

    let defaultCompany: Company | null = null;
    if (profile === "siteManager") {
        defaultCompany = site ? {name: site.name, pk: site.company} : null;
    } else {
        defaultCompany = delegateCompanies[0];
    }
    const customFields: SlotCustomField[] = getValues("custom_fields");
    return (
        <Box>
            <Text data-testid="step-three-title" variant="h1" paddingY={6} paddingX={6}>
                {t("flow.addSlot.completeToConfirm")}
            </Text>
            <Box paddingX={6}>
                <Text variant="h2" mb={2}>
                    {t("slot.book.for")}
                </Text>
                <Box mb={5}>
                    {site && defaultCompany && (
                        <Controller
                            name="company"
                            defaultValue={defaultCompany.pk}
                            control={control}
                            render={({field}) => (
                                <CompanyPicker
                                    {...field}
                                    flowSite={site}
                                    profile={profile}
                                    initialSelection={defaultCompany as Company}
                                    allowCreate={allowCreateCompany}
                                    onUpdate={(company) => {
                                        field.onChange(company.pk);
                                    }}
                                    allowSearch={profile === "delegate"}
                                    onSelectOrCreate={async (payload) => {
                                        if ("existing_company" in payload) {
                                            return await handleSelect(payload, field.onChange);
                                        } else {
                                            return await handleCreate(payload, field.onChange);
                                        }
                                    }}
                                />
                            )}
                        />
                    )}
                </Box>

                {customFields.length > 0 && (
                    <>
                        <Text variant="h2" mb={2}>
                            {t("components.complementaryInformation")}
                            {t("common.colon")}
                        </Text>
                        <Box mb={5}>
                            {customFields.map((customField, index) => (
                                <Controller
                                    key={`custom_fields.${index}`}
                                    name={`custom_fields.${index}.value`}
                                    defaultValue={true}
                                    render={({field, fieldState}) => (
                                        <Box mb={2}>
                                            <TextInput
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    trigger(`custom_fields.${index}.value`);
                                                }}
                                                error={!!fieldState.error?.message}
                                                label={customField.label}
                                                data-testid={`settings-zones-custom-fields-${customField.id}`}
                                                required={customField.required}
                                            />
                                        </Box>
                                    )}
                                />
                            ))}
                        </Box>
                    </>
                )}

                <Text variant="h2" mb={2}>
                    {t("common.references")}
                    {t("common.colon")}
                </Text>
                <Box mb={5}>
                    <Controller
                        control={control}
                        name="references"
                        defaultValue=""
                        render={({field: {onChange}}) => (
                            <TextInputEditableList
                                addItemLabel={t("common.addAReference")}
                                onChange={onChange}
                                defaultItem={""}
                                buttonProps={{
                                    type: "button",
                                }}
                                error={errors.references?.message as string}
                                data-testid="references-input"
                            />
                        )}
                    />
                </Box>
                <Controller
                    name="note"
                    defaultValue=""
                    control={control}
                    render={({field}) => (
                        <TextInput
                            {...field}
                            data-testid="note-input"
                            label={t("unavailability.notes")}
                        />
                    )}
                />

                {needAcceptSecurityProtocol && (
                    <Box mt={5}>
                        <Text variant="h2" mb={2}>
                            {t("common.securityProtocol")}
                        </Text>
                        {site.security_protocol && (
                            <Box mb={2}>
                                <SecurityProtocolLink securityProtocol={site.security_protocol} />
                            </Box>
                        )}
                        <Box mb={5}>
                            <Controller
                                name="accept_security_protocol"
                                control={control}
                                render={({field}) => (
                                    <>
                                        <Checkbox
                                            {...field}
                                            checked={field.value === true}
                                            label={t("common.securityProtocol.accept")}
                                            data-testid="accept-security-protocol"
                                        />
                                        <Required />
                                    </>
                                )}
                            />
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );

    async function handleSelect(
        payload: SelectCompanyPayload,
        onChange: (pk: number) => void
    ): Promise<Company> {
        const company = {pk: payload.existing_company, name: payload.existing_company_name};
        if (profile === "delegate") {
            const companyId = payload.existing_company;
            const delegateCompany = delegateCompanies.find((company) => company.pk === companyId);
            if (!delegateCompany) {
                // join only when it's useful
                await onJoinCompany(payload);
            }
        }
        onChange(company.pk);
        return company;
    }

    async function handleCreate(
        payload: CreateCompanyPayload,
        onChange: (pk: number) => void
    ): Promise<Company> {
        const company = await onCreateCompany(payload);
        onChange(company.pk);
        return company;
    }
}
