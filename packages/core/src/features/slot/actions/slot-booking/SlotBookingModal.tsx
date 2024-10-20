import {guid} from "@dashdoc/core";
import {storeService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Flex,
    IconButton,
    ModalBase,
    OnDesktop,
    OnMobile,
    renderInModalPortal,
    toast,
    useDevice,
} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {AsyncThunkAction} from "@reduxjs/toolkit";
import {STRING_LIST_SEPARATOR} from "dashdoc-utils";
import {CreateAccountPayload} from "features/account/actions/forms/CreateAccountForm";
import {GoBack} from "features/company/components/GoBack";
import {securityProtocolService} from "features/security-protocol/securityProtocol.service";
import {SlotTime, Step} from "features/slot/actions/slot-booking/step/types";
import React, {useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {useSelector} from "react-redux";
import {selectProfile, useDispatch} from "redux/reducers/flow";
import {getSiteBySlug} from "redux/reducers/flow/site.slice";
import {
    IrregularSlotPayload,
    SlotPayload,
    createSlot,
    createSlots,
    hideMultiSlotBooking,
} from "redux/reducers/flow/slot.slice";
import {fetchZones, selectZoneById} from "redux/reducers/flow/zone.slice";
import {actionService} from "redux/services/action.service";
import {Site, Slot, SlotCustomField, Zone} from "types";
import {z} from "zod";

import {StepContent} from "./step/StepContent";
import {StepNavigation} from "./step/StepNavigation";

interface InputFormType {
    zone: number;
    start_time: string;
    end_time?: string;
    slots_in_cart_start_time: string[];
    company: number;
    references: string;
    note?: string;
    accept_security_protocol?: boolean;
    custom_fields: SlotCustomField[];
}

type Props = {
    site: Site;
    title: string;
    zones: Zone[];
    isMulti: boolean;
    onClose: () => void;
    "data-testid"?: string;
};

/**
 * A modal containing a form for booking a slot.
 */
export function SlotBookingModal({site, title, onClose, zones, isMulti, ...props}: Props) {
    const profile = useSelector(selectProfile);
    const device = useDevice();
    const [key, setKey] = useState<string>("_");
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const dispatch = useDispatch();
    const [step, setStep] = useState<Step>(1);
    const [selectedSlotTime, setSelectedSlotTime] = useState<SlotTime | null>(null);
    const [createAccountPayload, setCreateAccountPayload] = useState<CreateAccountPayload | null>(
        null
    );

    const needAcceptSecurityProtocol = securityProtocolService.needAccept(profile, site);

    let validationSchema = z
        .object({
            zone: z.string().nonempty(t("errors.field_cannot_be_empty")),
            start_time: z.string().nonempty(t("errors.field_cannot_be_empty")),
            end_time: z.string().optional(),
            slots_in_cart_start_time: z.array(z.string()),
            company: z.number(),
            references: z.string().max(128, t("flow.slot.booking.error.referenceTooLong")),
            custom_fields: z.array(
                z
                    .object({
                        id: z.number(),
                        label: z.string(),
                        value: z.string().optional(),
                        required: z.boolean(),
                    })
                    .refine(
                        (customField) => {
                            if (customField.required) {
                                return customField.value && customField.value.length > 0;
                            }
                            return true;
                        },
                        {
                            message: t("common.mandatoryField"),
                        }
                    )
            ),
            note: z.string(),
            accept_security_protocol: z.boolean().optional(),
        })
        .superRefine((values, ctx) => {
            if (needAcceptSecurityProtocol && values.accept_security_protocol !== true) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t("common.securityProtocol.mandatory"),
                    path: ["accept_security_protocol"],
                });
            }
        });

    const methods = useForm<InputFormType>({
        resolver: zodResolver(validationSchema),
        mode: "onChange",
        defaultValues: {
            slots_in_cart_start_time: [],
        },
    });

    const {
        control,
        handleSubmit,
        trigger,
        setValue,
        watch,
        formState: {isValid, isSubmitting},
    } = methods;

    const showNav = !(step === 3 && profile === "guest");

    const slotsInCartStartTime = watch("slots_in_cart_start_time");

    return renderInModalPortal(
        <>
            <ModalBase
                title={device === "desktop" ? title : null}
                onClose={() => {
                    onClose();
                }}
                data-testid={props["data-testid"]}
                size="xlarge"
                height={["100vh", "fit-content", "fit-content"]}
                my={[0, "auto", "auto"]}
                overflow="hidden"
            >
                <Flex height="100%" flexDirection="column" overflowY="auto" px={5} pb={4} flex={1}>
                    <FormProvider {...methods}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit(submit)();
                            }}
                            onKeyPress={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                }
                            }}
                            style={{height: "100%", minHeight: "70vh"}}
                        >
                            <Flex
                                height="100%"
                                flexDirection={device === "desktop" ? "row" : "column"}
                            >
                                <OnDesktop>
                                    {showNav ? (
                                        <Box
                                            width="33%"
                                            borderRight="1px solid"
                                            borderColor="grey.light"
                                            padding={3}
                                        >
                                            <StepNavigation
                                                selectedZone={selectedZone}
                                                selectedSlotTime={selectedSlotTime}
                                                currentStep={step}
                                                turnToStep={async (step) => setStep(step)}
                                            />
                                        </Box>
                                    ) : (
                                        <Box ml={4}>
                                            <GoBack onAbort={handleBack} />
                                        </Box>
                                    )}
                                </OnDesktop>
                                <OnMobile>
                                    <Flex pt={5}>
                                        <Box flexGrow={1}>
                                            {showNav ? (
                                                <StepNavigation
                                                    selectedZone={selectedZone}
                                                    selectedSlotTime={selectedSlotTime}
                                                    currentStep={step}
                                                    turnToStep={async (step) => setStep(step)}
                                                />
                                            ) : (
                                                <GoBack onAbort={handleBack} />
                                            )}
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
                                <Flex flexDirection="column" flexGrow={1} width="100%">
                                    <StepContent
                                        key={key}
                                        site={site}
                                        step={step}
                                        zones={zones}
                                        isMulti={isMulti}
                                        selectedZone={selectedZone}
                                        onSelectZone={handleSelectZone}
                                        selectedSlotTime={selectedSlotTime}
                                        onSelectSlotTime={handleSelectSlotTime}
                                        createAccountPayload={createAccountPayload}
                                        onCreateAccount={(payload) => {
                                            setCreateAccountPayload(payload);
                                        }}
                                        control={control}
                                    />
                                    {step === 2 && isMulti && showNav && (
                                        <Flex justifyContent="flex-end" mt={8}>
                                            <Button
                                                alignSelf="flex-end"
                                                type="button"
                                                onClick={handleSelectSlotTimes}
                                                disabled={slotsInCartStartTime.length <= 0}
                                            >
                                                {t("common.next")}
                                            </Button>
                                        </Flex>
                                    )}
                                    {step === 3 && showNav && (
                                        <Flex justifyContent="flex-end" mt={8}>
                                            <Button
                                                alignSelf="flex-end"
                                                type="button"
                                                onClick={handleSubmit(submit)}
                                                data-testid="add-slot-form-modal-confirm-button"
                                                disabled={!isValid || isSubmitting}
                                            >
                                                {t("common.confirmBooking")}
                                            </Button>
                                        </Flex>
                                    )}
                                </Flex>
                            </Flex>
                        </form>
                    </FormProvider>
                </Flex>
            </ModalBase>
        </>
    );

    async function handleBack() {
        if (step === 3) {
            if (createAccountPayload) {
                setCreateAccountPayload(null);
            } else {
                setKey(guid()); // reset the StepContent state
                await setStep(2);
            }
        } else if (step === 2) {
            await setStep(1);
        }
    }

    async function handleSelectSlotTime(value: SlotTime) {
        setSelectedSlotTime(value);
        await setStep(3); // Set the step of the form to go to the last one
    }

    async function handleSelectSlotTimes() {
        await setStep(3); // Set the step of the form to go to the last one
    }

    async function handleSelectZone(zone: Zone) {
        // reset slot booking
        setSelectedSlotTime(null);
        if (zone.id !== selectedZone?.id) {
            methods.setValue("slots_in_cart_start_time", []);
        }
        setSelectedZone(zone);
        const values: SlotCustomField[] =
            zone.custom_fields?.map((customField) => ({
                id: customField.id,
                label: customField.label,
                required: customField.required,
                value: "",
            })) ?? [];
        setValue("custom_fields", values, {shouldTouch: true, shouldValidate: true});
        await setStep(2); // Set the form step
    }

    async function submit() {
        if (step === 3) {
            await submitSlotBooking();
        } else {
            // The validation should protect us from this case
            Logger.error("Invalid state");
        }
    }

    async function submitSlotBooking() {
        const isValidForm = await trigger(); // manually trigger validation
        if (!isValidForm) {
            return; // if the form is not valid, don't submit the form
        }

        let rawFormData = methods.getValues();

        let references = rawFormData.references.split(STRING_LIST_SEPARATOR);

        // Filter out any empty strings from the array
        references = references.filter((reference) => reference.trim() !== "");

        // If the resultant array is empty, set it to an empty array
        if (!references.length) {
            references = [];
        }

        const {company, note, zone, custom_fields, accept_security_protocol} = rawFormData;
        const owner = profile === "siteManager" ? site.company : rawFormData.company;

        try {
            let actionResult:
                | AsyncThunkAction<Slot, SlotPayload, {}>
                | AsyncThunkAction<{created: Slot[]; aborted: SlotPayload[]}, SlotPayload[], {}>;
            if (isMulti) {
                const slotsInCartStartTime = rawFormData.slots_in_cart_start_time;
                const formData = slotsInCartStartTime.map((start_time) => ({
                    company,
                    zone,
                    accept_security_protocol,
                    start_time,
                    references,
                    custom_fields,
                    note: note || null, // set to null if empty string
                    owner,
                }));
                dispatch(hideMultiSlotBooking()); // close the modal immediately in this case
                actionResult = await dispatch(createSlots(formData));
            } else {
                const {start_time, end_time} = rawFormData;
                const formData: SlotPayload | IrregularSlotPayload = {
                    company,
                    zone,
                    accept_security_protocol,
                    start_time,
                    end_time,
                    references,
                    custom_fields,
                    note: note || null, // set to null if empty string
                    owner,
                };
                actionResult = await dispatch(createSlot(formData));
            }
            if (actionService.containsError(actionResult)) {
                toast.error(actionService.getError(actionResult));
                if (
                    actionService.getErrorCode(actionResult) === "security_protocol_not_accepted"
                ) {
                    dispatch(getSiteBySlug(site.slug));
                }
                if (
                    actionService.getErrorCode(actionResult) === "missing_custom_field" ||
                    actionService.getErrorCode(actionResult) === "invalid_custom_fields_json"
                ) {
                    await dispatch(fetchZones({siteId: site.id, silently: true}));
                    if (selectedZone) {
                        const state = storeService.getState();
                        const zone = selectZoneById(state, selectedZone.id);
                        setSelectedZone(zone);
                        const values: SlotCustomField[] =
                            zone?.custom_fields?.map((customField) => ({
                                id: customField.id,
                                label: customField.label,
                                required: customField.required,
                                value: "",
                            })) ?? [];
                        for (const customField of values) {
                            if (rawFormData.custom_fields) {
                                const customFieldFromData = rawFormData.custom_fields.find(
                                    (cf) => cf.id === customField.id
                                );
                                // Keep the value if possible
                                if (customFieldFromData) {
                                    customField.value = customFieldFromData.value;
                                }
                            }
                        }
                        setValue("custom_fields", values, {
                            shouldTouch: true,
                            shouldValidate: true,
                        });
                    }
                }
                return;
            }
            // If the security protocol is accepted, we need to refetch the site to get the security protocol
            if (rawFormData.accept_security_protocol) {
                dispatch(getSiteBySlug(site.slug));
            }
            onClose();
        } catch (e) {
            Logger.error(e);
        }
    }
}
