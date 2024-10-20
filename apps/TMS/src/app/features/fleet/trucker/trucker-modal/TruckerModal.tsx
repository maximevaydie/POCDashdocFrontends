import {getConnectedCompanyId, getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, ErrorMessage, Modal, Text} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {Trucker, Usage} from "dashdoc-utils";
import omit from "lodash.omit";
import React from "react";
import {FormProvider, useForm} from "react-hook-form";
import {z} from "zod";

import {ImpactOnBillingCallout} from "app/features/fleet/trucker/ImpactOnBillingCallout";
import {
    ContactFormSection,
    contactFormValidationSchema,
    getContactDefaultValues,
} from "app/features/fleet/trucker/trucker-modal/form-sections/ContactFormSection";
import {
    GeneralFormSection,
    generalFormValidationSchema,
    getGeneralDefaultValues,
} from "app/features/fleet/trucker/trucker-modal/form-sections/GeneralFormSection";
import {
    MedicalVisitFormSection,
    getMedicalVisitDefaultValues,
    medicalVisitFormValidationSchema,
} from "app/features/fleet/trucker/trucker-modal/form-sections/MedicalVisitFormSection";
import {
    SpecificitiesFormSection,
    getSpecificitiesDefaultValues,
    specificitiesFormValidationSchema,
} from "app/features/fleet/trucker/trucker-modal/form-sections/SpecificitiesFormSection";
import {fetchAddTrucker, fetchUpdateTrucker} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";

const queryName = "trucker-modal";

type Props = {
    trucker?: Trucker;
    truckerFirstName?: string;
    onSubmitTrucker?: (trucker: Trucker) => void;
    onClose: () => void;
    usage?: Usage | null;
};

export function TruckerModal({trucker, truckerFirstName, onClose, onSubmitTrucker, usage}: Props) {
    const dispatch = useDispatch();
    const companyId = useSelector(getConnectedCompanyId);
    const displayRemoteIdField = !trucker || trucker?.carrier.pk === companyId;

    const defaultValues = {
        ...getGeneralDefaultValues(trucker, truckerFirstName),
        ...getContactDefaultValues(trucker),
        ...getSpecificitiesDefaultValues(trucker),
        ...getMedicalVisitDefaultValues(trucker),
    };

    const validationSchema = generalFormValidationSchema
        .and(contactFormValidationSchema)
        .and(specificitiesFormValidationSchema)
        .and(medicalVisitFormValidationSchema);

    type TruckerForm = z.infer<typeof validationSchema>;

    const form = useForm<TruckerForm>({
        defaultValues,
        resolver: zodResolver(validationSchema),
    });

    return (
        <Modal
            title={
                <Text variant="h1" p={1}>
                    {trucker ? t("transportsForm.updateDriver") : t("components.inviteNewDriver")}
                </Text>
            }
            data-testid="trucker-modal"
            onClose={onClose}
            mainButton={{
                children: t("common.save"),
                loading: form.formState.isSubmitting,
                onClick: form.handleSubmit(handleSubmit),
                "data-testid": "trucker-modal-save-button",
            }}
            secondaryButton={{
                children: t("common.cancel"),
            }}
            size="medium"
        >
            <Box>
                <FormProvider {...form}>
                    <ImpactOnBillingCallout usage={usage} />
                    <Box>
                        <GeneralFormSection displayRemoteIdField={displayRemoteIdField} />
                        <ContactFormSection />
                        <SpecificitiesFormSection queryName={queryName} trucker={trucker} />
                        <MedicalVisitFormSection />
                    </Box>
                    {form.formState.errors?.root?.message && (
                        <ErrorMessage error={form.formState.errors.root.message} />
                    )}
                </FormProvider>
            </Box>
        </Modal>
    );

    async function handleSubmit(values: TruckerForm) {
        const data = {
            ...omit(
                values,
                "first_name",
                "last_name",
                "email",
                "unavailability",
                "events",
                "carrier",
                "is_dedicated"
            ),
            user: {
                ...trucker?.user,
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email,
            },
            carrier: !values.is_dedicated ? values.carrier?.value : undefined,
            dedicated_by_carrier:
                !trucker && values.is_dedicated ? values.carrier?.value : undefined,
        };

        try {
            const fetchFunction = trucker
                ? fetchUpdateTrucker.bind(undefined, trucker.pk)
                : fetchAddTrucker;

            const updatedTrucker: Trucker = await dispatch(fetchFunction(data));

            if (onSubmitTrucker) {
                onSubmitTrucker(updatedTrucker);
            }
            onClose();
        } catch (error) {
            const errorMessage = await getErrorMessagesFromServerError(error);
            let genericError = "";

            if ("user" in errorMessage) {
                if ("first_name" in errorMessage.user) {
                    errorMessage.first_name = errorMessage.user.first_name;
                }
                if ("last_name" in errorMessage.user) {
                    errorMessage.last_name = errorMessage.user.last_name;
                }
                if ("email" in errorMessage.user) {
                    errorMessage.email = errorMessage.user.email;
                }
                delete errorMessage.user;
            }

            for (let key in errorMessage) {
                if (key in values) {
                    form.setError(key as keyof TruckerForm, {
                        type: "onSubmit",
                        message: errorMessage[key]?.message ?? errorMessage[key],
                    });
                } else {
                    genericError += `${errorMessage[key]}\n`;
                }
            }

            if (genericError) {
                form.setError("root", {type: "onSubmit", message: genericError});
            }
        }
    }
}
