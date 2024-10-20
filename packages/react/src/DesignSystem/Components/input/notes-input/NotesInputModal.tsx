import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    TestableProps,
    Icon,
    Modal,
    Text,
    TextArea,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import React, {ReactNode} from "react";
import {Controller, FormProvider, useForm} from "react-hook-form";
import {z} from "zod";

interface InputFormType {
    value: string;
}

const validationSchema = z.object({
    value: z.string(),
});

type Props = {
    title: string;
    value: string;
    helpText?: ReactNode;
    onClose: () => void;
    onEdit: (newValue: string) => Promise<void>;
} & TestableProps;

export function NotesInputModal(props: Props) {
    const {title, onClose, onEdit, value, helpText} = props;

    const methods = useForm<InputFormType>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            value,
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
            onClose={isSubmitting ? undefined : onClose}
            data-testid={props["data-testid"]}
            size="medium"
            mainButton={{
                type: "button",
                children: t("common.save"),
                onClick: handleSubmit(submit),
                disabled: !isValid || isSubmitting,
                loading: isSubmitting,
            }}
            secondaryButton={{
                onClick: onClose,
                variant: "plain",
                children: t("common.cancel"),
                disabled: isSubmitting,
            }}
        >
            <Flex alignItems="center" mb={4}>
                <Text variant="h1" color="grey.dark">
                    {t("unavailability.notes")}
                </Text>
                {helpText && (
                    <TooltipWrapper content={<Box width="330px">{helpText}</Box>}>
                        <Icon name="info" color="grey.dark" ml={2} verticalAlign="middle" />
                    </TooltipWrapper>
                )}
            </Flex>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(submit)}>
                    <Box width="100%">
                        <Controller
                            name="value"
                            defaultValue={value}
                            control={methods.control}
                            render={({field}) => {
                                const {onChange, ...otherFields} = field;
                                // We are creating a customOnChange here because react-hook-form and TextArea expect different onChange signature
                                const textAreaOnChange = (
                                    _: string | number,
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    onChange(event);
                                };
                                return (
                                    <TextArea
                                        height="215px"
                                        {...otherFields}
                                        onChange={textAreaOnChange}
                                    />
                                );
                            }}
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
        const {value} = methods.getValues();
        try {
            await onEdit(value);
        } catch (e) {
            Logger.error(e);
        }
    }
}
