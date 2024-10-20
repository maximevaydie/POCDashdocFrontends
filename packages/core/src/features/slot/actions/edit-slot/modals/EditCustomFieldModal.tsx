import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Box, Modal, TextInput, toast} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import clone from "lodash.clone";
import React from "react";
import {useForm, FormProvider, Controller} from "react-hook-form";
import {useDispatch} from "react-redux";
import {refreshFlow} from "redux/reducers/flow";
import {updateSlot} from "redux/reducers/flow/slot.slice";
import {actionService} from "redux/services/action.service";
import {Slot, SlotCustomField} from "types";
import {z} from "zod";

interface InputFormType {
    value: string;
}

type Props = {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    customField: SlotCustomField;
    slot: Slot;
    "data-testid"?: string;
};

/**
 * A modal containing a form for editing the references.
 */
export function EditCustomFieldModal({
    title,
    onClose,
    onSubmit,
    customField,
    slot,
    ...props
}: Props) {
    const dispatch = useDispatch();

    const validationSchema = z.object({
        value: z.string().refine(
            (value) => {
                if (customField.required) {
                    return value && value.length > 0;
                }
                return true;
            },
            {
                message: t("common.mandatoryField"),
            }
        ),
    });

    const methods = useForm<InputFormType>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            value: customField.value ?? "",
        },
    });

    const {
        handleSubmit,
        trigger,
        formState: {isValid, isSubmitting},
    } = methods;

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
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(submit)}
                    onKeyPress={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                        }
                    }}
                >
                    <Box width="100%">
                        <Controller
                            name="value"
                            render={({field, fieldState}) => (
                                <TextInput
                                    {...field}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        trigger();
                                    }}
                                    error={!!fieldState.error?.message}
                                    label={customField.label}
                                    data-testid={"custom_field-input"}
                                    required={customField.required}
                                />
                            )}
                        />
                    </Box>
                </form>
            </FormProvider>
        </Modal>
    );

    async function submit() {
        const isValidForm = await trigger(); // manually trigger validation
        if (!isValidForm) {
            return; // if the form is not valid, don't submit the form
        }
        try {
            let rawFormData = methods.getValues();
            const custom_fields = clone(slot.custom_fields ?? []).map((field) => {
                if (field.id === customField.id) {
                    return {
                        ...field,
                        value: rawFormData.value,
                    };
                } else {
                    return field;
                }
            });

            const actionResult = await dispatch(
                updateSlot({
                    id: slot.id,
                    payload: {custom_fields},
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
}
