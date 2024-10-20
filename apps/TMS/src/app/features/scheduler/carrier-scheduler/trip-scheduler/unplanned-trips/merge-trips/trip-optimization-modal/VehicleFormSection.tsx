import {t} from "@dashdoc/web-core";
import {Text, NumberInput, TooltipWrapper, Icon, Flex} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React from "react";
import {Controller} from "react-hook-form";
import {z} from "zod";

export const vehicleFormSchema = z.object({
    vehicleCapacity: z.number().min(0),
});

type VehicleFormType = z.infer<typeof vehicleFormSchema>;

export function getVehicleDefaultValues(company: Company | null): VehicleFormType {
    return {
        vehicleCapacity: getDefaultVehicleCapacity(company),
    };
}

export function getDefaultVehicleCapacity(company: Company | null): number {
    return company?.settings?.optimization_settings.default_vehicle_capacity_in_lm ?? 13.6;
}

export function VehicleFormSection() {
    return (
        <>
            <Flex mb={4} mt={-3}>
                <Text variant="h1">{t("optimization.vehicleConstraints")}</Text>
                <TooltipWrapper
                    content={t("optimization.changeDefaultVehicleCapacity", {
                        settingsTab: t("sidebar.settings"),
                        optimizationTab: t("settings.optimization"),
                    })}
                >
                    <Icon name="questionCircle" ml={2} />
                </TooltipWrapper>
            </Flex>
            <Controller
                name="vehicleCapacity"
                render={({field: {ref: _ref, ...field}, fieldState: {error}}) => (
                    <NumberInput
                        {...field}
                        onTransientChange={field.onChange}
                        required
                        min={0}
                        units={t("pricingMetrics.unit.linearMeters.short")}
                        label={t("settings.optimization.maximumVehicleCapacity")}
                        error={error?.message}
                        data-testid="vehicle-capacity"
                    />
                )}
            />
        </>
    );
}
