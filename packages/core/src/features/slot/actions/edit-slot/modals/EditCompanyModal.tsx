import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Box, Modal, toast} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {CompanyPicker} from "features/company/company-picker/CompanyPicker";
import {
    CreateCompanyPayload,
    SelectCompanyPayload,
} from "features/company/SelectOrCreateCompanyForm";
import React from "react";
import {useForm, Controller} from "react-hook-form";
import {useDispatch, useSelector} from "react-redux";
import {refreshFlow, selectFlowDelegateCompanies, selectProfile} from "redux/reducers/flow";
import {updateSlot} from "redux/reducers/flow/slot.slice";
import {actionService} from "redux/services/action.service";
import {rightPolicyServices} from "services/rightPolicy.service";
import {Company, Site} from "types";
import {z} from "zod";

interface InputFormType {
    company: number;
}

const validationSchema = z.object({
    company: z.number(),
});

type Props = {
    site: Site;
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    onCreateCompany: (payload: CreateCompanyPayload) => Promise<Company>;
    onJoinCompany: (payload: SelectCompanyPayload | CreateCompanyPayload) => Promise<Company>;
    "data-testid"?: string;
    slotId: number;
    defaultCompany: Company;
};

/**
 * A modal containing a form for editing the company.
 */
export function EditCompanyModal({
    title,
    onClose,
    onSubmit,
    onCreateCompany,
    onJoinCompany,
    site,
    slotId,
    defaultCompany,
    ...props
}: Props) {
    const dispatch = useDispatch();
    const profile = useSelector(selectProfile);
    const delegateCompanies = useSelector(selectFlowDelegateCompanies);

    const methods = useForm<InputFormType>({
        resolver: zodResolver(validationSchema),
    });

    const {
        handleSubmit,
        trigger,
        formState: {isValid, isSubmitting},
    } = methods;

    const allowCreateCompany = rightPolicyServices.canCreateCompany(profile);

    return (
        <Modal
            title={title}
            onClose={onClose}
            data-testid={props["data-testid"]}
            size="medium"
            mainButton={{
                type: "button",
                children: t("common.save"),
                onClick: () => {
                    submit();
                },
                disabled: !isValid || isSubmitting,
            }}
            secondaryButton={{
                onClick: onClose,
                variant: "plain",
                children: t("common.cancel"),
            }}
        >
            <form onSubmit={handleSubmit(submit)}>
                <Box width="100%">
                    <Controller
                        name="company"
                        defaultValue={defaultCompany.pk}
                        control={methods.control}
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
                </Box>
            </form>
        </Modal>
    );

    async function submit() {
        const isValidForm = await trigger(); // manually trigger validation

        if (!isValidForm) {
            return; // if the form is not valid, don't submit the form
        }
        const {company} = methods.getValues();

        try {
            const actionResult = await dispatch(
                updateSlot({
                    id: slotId,
                    payload: {
                        company,
                        owner: profile === "siteManager" ? site.company : company,
                    },
                })
            );
            if (actionService.containsError(actionResult)) {
                toast.error(actionService.getError(actionResult));
                return;
            }
            await dispatch(refreshFlow());
            await onSubmit();
        } catch (e) {
            Logger.error(e);
        }
    }

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
