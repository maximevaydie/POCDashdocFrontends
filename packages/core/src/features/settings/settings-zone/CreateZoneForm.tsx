import {t} from "@dashdoc/web-core";
import {Flex, Box, Button, toast} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {CustomFieldsSection} from "features/settings/settings-zone/form-sections/CustomFieldsSection";
import React from "react";
import {FormProvider, useForm} from "react-hook-form";
import {useDispatch} from "redux/hooks";
import {createZone} from "redux/reducers/flow/zone.slice";
import {actionService} from "redux/services/action.service";
import {Site, Zone} from "types";

import {ConstraintsSection} from "./form-sections/ConstraintsSection";
import {DelegateSection} from "./form-sections/DelegateSection";
import {GeneralSection} from "./form-sections/GeneralSection";
import {SlotSection} from "./form-sections/SlotSection";
import {ZoneOpeningDaysSection} from "./form-sections/ZoneOpeningDaysSection";
import {ZoneRawData} from "./types";
import {zoneFormService} from "./zoneForm.service";

type Props = {
    site: Site;
    onCreate: (zone: Zone) => void;
};
export function CreateZoneForm({site, onCreate}: Props) {
    const dispatch = useDispatch();

    const methods = useForm({
        mode: "onChange",
        resolver: zodResolver(zoneFormService.getSchema()),
        defaultValues: zoneFormService.getDefaultValues(),
    });

    const {
        handleSubmit,
        trigger,
        watch,
        reset,
        formState: {isValid, isSubmitting, touchedFields},
    } = methods;

    const delegableValue = watch("delegable");

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Flex flexDirection="column">
                    <GeneralSection />
                    <CustomFieldsSection />
                    <DelegateSection />
                    {delegableValue && <ConstraintsSection />}
                    <SlotSection />
                    <ZoneOpeningDaysSection />
                </Flex>

                <Box display="flex" flexDirection="row-reverse" mt={4}>
                    <Button
                        type="submit"
                        variant="primary"
                        ml={4}
                        data-testid="settings-zones-setup-tab-save-button"
                        disabled={!touchedFields.name || !isValid || isSubmitting}
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
        const ZoneCleanData = transformZoneData(formData, site.id);

        const actionResult = await dispatch(createZone({zone: ZoneCleanData}));
        if (actionService.containsError(actionResult)) {
            toast.error(actionService.getError(actionResult));
            return;
        }
        onCreate(actionResult.payload);
        reset();
    }
}

const clearOpeningHours = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
};

function transformZoneData(data: ZoneRawData, siteId: number) {
    return {
        ...data,
        site: siteId,
        opening_hours: {
            ...clearOpeningHours,
            ...data.opening_hours,
        },
    };
}
