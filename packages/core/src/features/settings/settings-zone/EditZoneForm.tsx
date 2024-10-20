import {getMessageFromErrorCode} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Flex, Box, Button, toast} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {CustomFieldsSection} from "features/settings/settings-zone/form-sections/CustomFieldsSection";
import isEqual from "lodash.isequal";
import React, {useEffect} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {refreshFlow, useDispatch} from "redux/reducers/flow";
import {updateZoneOpeningHours} from "redux/reducers/flow/zone.slice";
import {updateZone} from "redux/reducers/flow/zone.slice";
import {Site, Zone} from "types";

import {ConstraintsSection} from "./form-sections/ConstraintsSection";
import {DelegateSection} from "./form-sections/DelegateSection";
import {GeneralSection} from "./form-sections/GeneralSection";
import {SlotSection} from "./form-sections/SlotSection";
import {ZoneOpeningDaysSection} from "./form-sections/ZoneOpeningDaysSection";
import {ZoneRawData} from "./types";
import {zoneFormService} from "./zoneForm.service";
interface Props {
    site: Site;
    zone: Zone;
}

export function EditZoneForm({site, zone}: Props) {
    const dispatch = useDispatch();

    const methods = useForm({
        mode: "onChange",
        resolver: zodResolver(zoneFormService.getSchema()),
        defaultValues: zoneFormService.getDefaultValues(zone),
    });

    const {
        handleSubmit,
        trigger,
        watch,
        formState: {isValid, isSubmitting, dirtyFields, defaultValues},
    } = methods;
    const delegableValue = watch("delegable");

    useEffect(() => {
        trigger(); // Validate on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Flex flexDirection="column">
                    <GeneralSection />
                    <CustomFieldsSection />
                    <DelegateSection />
                    {delegableValue && <ConstraintsSection />}
                    {/* TODO disable those when getting error opening_hours_remaining_slots */}
                    <SlotSection />
                    <ZoneOpeningDaysSection />
                </Flex>

                <Box display="flex" flexDirection="row-reverse" mt={4}>
                    <Button
                        type="submit"
                        variant="primary"
                        ml={4}
                        data-testid="settings-zones-setup-tab-save-button"
                        disabled={!isValid || isSubmitting}
                    >
                        {t("common.save")}
                    </Button>
                    <Button
                        variant="secondary"
                        data-testid="settings-zones-setup-tab-cancel-button"
                    >
                        {t("common.cancel")}
                    </Button>
                </Box>
            </form>
        </FormProvider>
    );

    async function onSubmit(formData: ZoneRawData) {
        const isValidForm = await trigger();
        if (!isValidForm) {
            return;
        }

        if (!site || !site.id) {
            return;
        }

        // Take only the dirty fields from formData for patching
        const patchData = {
            ...filterDirtyFields(formData, dirtyFields),
        };
        // The isDirty from ReactForm does not support custom object, Class or File object @see https://react-hook-form.com/docs/useformstate
        if (!isEqual(formData.custom_fields, defaultValues?.custom_fields)) {
            patchData.custom_fields = formData.custom_fields;
        }
        const transformedData = transformPatchData(patchData, site.id, zone.id);

        try {
            const updateZoneResult = await dispatch(updateZone({zone: transformedData}));
            if (updateZoneResult.error) {
                throw new Error(t("flow.settings.zoneSetupTab.error.updatingZone"));
            }

            if (dirtyFields.opening_hours) {
                patchData.opening_hours = formData.opening_hours;
                const openingHoursResult = await dispatch(
                    updateZoneOpeningHours({
                        id: zone.id,
                        openingHours: formData.opening_hours,
                    })
                );

                if (openingHoursResult.payload?.non_field_errors?.code) {
                    const errorCode = openingHoursResult.payload?.non_field_errors?.code[0];
                    toast.error(
                        getMessageFromErrorCode(errorCode) ??
                            t("flow.settings.zoneSetupTab.error.updatingOpeningHours")
                    );
                    return;
                }

                if (openingHoursResult.payload?.opening_hours?.code) {
                    const errorCode = openingHoursResult.payload?.opening_hours?.code[0];
                    methods.reset({
                        ...formData,
                        opening_hours: zone.opening_hours,
                    });
                    toast.error(
                        getMessageFromErrorCode(errorCode) ??
                            t("flow.settings.zoneSetupTab.error.updatingOpeningHours")
                    );
                    return;
                }

                if (openingHoursResult.error) {
                    throw new Error(t("flow.settings.zoneSetupTab.error.updatingOpeningHours"));
                }
            }

            await dispatch(refreshFlow());
            toast.success(t("flow.settings.zoneSetupTab.zoneUpdated"));
        } catch (e) {
            Logger.error(e);
            toast.error(t("flow.settings.zoneSetupTab.error.updatingZone"));
        }
    }
}

function filterDirtyFields(formData: ZoneRawData, dirtyFields: any): ZoneRawData {
    return (Object.keys(dirtyFields) as (keyof ZoneRawData)[]).reduce(
        (acc, curr) => {
            if (formData[curr] !== undefined) {
                acc[curr] = formData[curr] as ZoneRawData[keyof ZoneRawData];
            }
            return acc;
        },
        {} as Record<keyof ZoneRawData, any>
    );
}

function transformPatchData(patchData: ZoneRawData, siteId: number, zoneId: number) {
    return {
        ...patchData,
        id: zoneId,
        site: siteId,
    };
}
