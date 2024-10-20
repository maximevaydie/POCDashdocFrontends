import {Logger} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    IconButton,
    ModalBase,
    OnMobile,
    Text,
    renderInModalPortal,
    toast,
    useDevice,
} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import React from "react";
import {FormProvider, useForm} from "react-hook-form";
import {useDispatch} from "react-redux";
import {refreshFlow} from "redux/reducers/flow";
import {rescheduleSlot} from "redux/reducers/flow/slot.slice";
import {actionService} from "redux/services/action.service";
import {Slot, Zone} from "types";
import {z} from "zod";

import {RescheduleSlot} from "./RescheduleSlot";

interface InputFormType {
    start_time: string;
    end_time: string;
}

/**
 * A modal containing a form for reschedule a booking slot.
 */
export function RescheduleModal(props: {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    "data-testid"?: string;
    slot: Slot;
    zone: Zone;
}) {
    const {title, onClose, onSubmit, slot, zone} = props;
    const validationSchema = z.object({
        start_time: z.string(),
        end_time: z.string(),
    });
    const dispatch = useDispatch();
    const device = useDevice();

    const methods = useForm<InputFormType>({
        resolver: zodResolver(validationSchema),
    });

    const {
        handleSubmit,
        trigger,
        formState: {isSubmitting},
    } = methods;

    return renderInModalPortal(
        <ModalBase
            title={device === "desktop" ? title : null}
            onClose={onClose}
            data-testid={props["data-testid"]}
            size="large"
            height={["100vh", "fit-content", "fit-content"]}
            my={[0, "auto", "auto"]}
            overflow="hidden"
        >
            <Flex
                height="100%"
                flexDirection="column"
                overflowY="auto"
                px={5}
                pt={5}
                pb={4}
                flex={1}
            >
                <FormProvider {...methods}>
                    <form
                        onSubmit={handleSubmit(submit)}
                        style={{height: "100%", minHeight: device === "desktop" ? "80vh" : "70vh"}}
                    >
                        <Flex
                            height="100%"
                            flexDirection={device === "desktop" ? "row" : "column"}
                        >
                            <OnMobile>
                                <Flex mb={4}>
                                    <Box flexGrow={1} margin="auto">
                                        <Text
                                            variant="h2"
                                            textAlign="center"
                                            color="blue.default"
                                            data-testid="reschedule-slot-form-modal-title"
                                        >
                                            {title}
                                        </Text>
                                    </Box>
                                    <Box>
                                        <IconButton
                                            type="button"
                                            name="close"
                                            height={16}
                                            data-testid="close-modal-button"
                                            onClick={onClose}
                                        />
                                    </Box>
                                </Flex>
                            </OnMobile>
                            <Box
                                style={{
                                    display: "grid",
                                    gridTemplateRows: `1fr`,
                                }}
                                flexGrow={1}
                                width="100%"
                            >
                                <RescheduleSlot
                                    control={methods.control}
                                    slot={slot}
                                    zone={zone}
                                    onSelectSlotTime={handleSelectSlotTime}
                                />
                            </Box>
                        </Flex>
                    </form>
                </FormProvider>
            </Flex>
        </ModalBase>
    );

    async function handleSelectSlotTime() {
        if (!isSubmitting) {
            submit();
        }
    }

    async function submit() {
        const isValidForm = await trigger(); // manually trigger validation
        if (!isValidForm) {
            return; // if the form is not valid, don't submit the form
        }

        let rawFormData = methods.getValues();
        const formData = {
            slotId: slot.id,
            ...rawFormData,
        };

        try {
            const actionResult = await dispatch(rescheduleSlot(formData));
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
