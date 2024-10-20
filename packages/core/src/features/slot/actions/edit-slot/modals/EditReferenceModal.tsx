import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Box, Modal, TextInputEditableList, toast} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {STRING_LIST_SEPARATOR} from "dashdoc-utils";
import React from "react";
import {useForm, FormProvider, Controller} from "react-hook-form";
import {useDispatch} from "react-redux";
import {refreshFlow} from "redux/reducers/flow";
import {updateSlot} from "redux/reducers/flow/slot.slice";
import {actionService} from "redux/services/action.service";
import {z} from "zod";

interface InputFormType {
    references: string;
}

const validationSchema = z.object({
    references: z.string(),
});

type Props = {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    references: string[] | null;
    slotId: number;
    "data-testid"?: string;
};

/**
 * A modal containing a form for editing the references.
 */
export function EditReferenceModal({
    title,
    onClose,
    onSubmit,
    references,
    slotId,
    ...props
}: Props) {
    const dispatch = useDispatch();

    const methods = useForm<InputFormType>({
        resolver: zodResolver(validationSchema),
    });

    const {
        handleSubmit,
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
                            control={methods.control}
                            name="references"
                            render={({field: {onChange}}) => (
                                <TextInputEditableList
                                    addItemLabel={t("components.addReference")}
                                    onChange={onChange}
                                    defaultItem={getDefaultItem()}
                                    buttonProps={{
                                        type: "button",
                                    }}
                                    data-testid="references-input"
                                />
                            )}
                        />
                    </Box>
                </form>
            </FormProvider>
        </Modal>
    );

    function getDefaultItem() {
        let result = [""];
        if (references && references.length > 0) {
            result = references;
        }
        return result.join(STRING_LIST_SEPARATOR);
    }

    async function submit() {
        let rawReferences = methods.getValues().references.split(STRING_LIST_SEPARATOR);

        // Filter out any empty strings from the array
        rawReferences = rawReferences.filter((reference) => reference.trim() !== "");

        // If the resultant array is empty, set it to an empty array
        if (!rawReferences.length) {
            rawReferences = [];
        }

        try {
            const actionResult = await dispatch(
                updateSlot({
                    id: slotId,
                    payload: {references: rawReferences},
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
