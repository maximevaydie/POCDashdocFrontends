import {getConnectedCompany, updateCompanySettings} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Text, Callout, NumberInput, Flex, Button, toast} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {Company, formatNumber} from "dashdoc-utils";
import React from "react";
import {Controller, FormProvider, UseFormReturn, useForm} from "react-hook-form";
import {z} from "zod";

import {useDispatch, useSelector} from "app/redux/hooks";

export function SettingsOptimization() {
    const dispatch = useDispatch();

    const company = useSelector(getConnectedCompany);

    const form = useForm<SettingsOptimizationFormType>({
        defaultValues: getDefaultValues(company),
        resolver: zodResolver(schema),
    });

    return (
        <Flex flexDirection="column" height="100%">
            <Box overflowY="scroll">
                <Text variant="title" mb={3}>
                    {t("settings.optimization")}
                </Text>
                <Callout>
                    {t("settings.optimization.intro-v2")}
                    <ul>
                        <li>{t("settings.optimization.tripsCreation")}</li>
                    </ul>
                </Callout>
                <Box marginY={3}>
                    <SettingsOptimizationForm form={form} />
                </Box>
            </Box>
            <Flex
                borderTop="1px solid"
                borderColor="grey.light"
                marginTop={"auto"}
                marginX={-2}
                marginBottom={-2}
                padding={2}
            >
                <Button
                    variant="primary"
                    onClick={form.handleSubmit(handleSubmit)}
                    marginLeft={"auto"}
                >
                    {t("common.save")}
                </Button>
            </Flex>
        </Flex>
    );

    async function handleSubmit(values: SettingsOptimizationFormType) {
        if (!company) {
            toast.error(t("common.error"));
            return;
        }
        await dispatch(
            updateCompanySettings({
                companyId: company.pk,
                settings: {
                    optimization_settings: {
                        default_vehicle_capacity_in_lm: values.vehicleCapacity,
                    },
                },
            })
        );
    }
}

const schema = z.object({
    vehicleCapacity: z.number().min(0),
});
type SettingsOptimizationFormType = z.infer<typeof schema>;
function getDefaultValues(company: Company | null): SettingsOptimizationFormType {
    return {
        vehicleCapacity:
            company?.settings?.optimization_settings.default_vehicle_capacity_in_lm ?? 13.6,
    };
}
function SettingsOptimizationForm({form}: {form: UseFormReturn<SettingsOptimizationFormType>}) {
    return (
        <FormProvider {...form}>
            <Text variant="h1" mb={3}>
                {t("settings.optimization.maximumVehicleCapacity")}
            </Text>
            <Text variant="body" mb={4}>
                {t("settings.optimization.maximumVehicleCapacityHelper")}
                {"\n\n"}
                {t("settings.optimization.maximumVehicleCapacityDefault", {
                    vehicleCapacity: formatNumber(13.6),
                })}
            </Text>
            <Controller
                name="vehicleCapacity"
                render={({field, fieldState: {error}}) => (
                    <NumberInput
                        {...field}
                        onTransientChange={field.onChange}
                        required
                        min={0}
                        width={250}
                        units={t("pricingMetrics.unit.linearMeters.short")}
                        label={t("settings.optimization.maximumVehicleCapacity")}
                        error={error?.message}
                    />
                )}
            />
        </FormProvider>
    );
}
