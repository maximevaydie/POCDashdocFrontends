import {GenericSettingsView, periodOptions} from "@dashdoc/web-common";
import {SchedulerCardSettingsData} from "dashdoc-utils";
import {z} from "zod";

import {CharteringView} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";
import {DedicatedResourcesView} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

export const PoolOfUnplannedSettingsSchema = z.object({
    pool_period: z.enum(periodOptions).nullable().optional(),
    pool_start_date: z.string().nullable().optional(),
    pool_end_date: z.string().nullable().optional(),
    pool_loading_period: z.enum(periodOptions).nullable().optional(),
    pool_loading_start_date: z.string().nullable().optional(),
    pool_loading_end_date: z.string().nullable().optional(),
    pool_unloading_period: z.enum(periodOptions).nullable().optional(),
    pool_unloading_start_date: z.string().nullable().optional(),
    pool_unloading_end_date: z.string().nullable().optional(),
    tags__in: z.array(z.string()).optional(),
    shipper__in: z.array(z.string()).optional(),
    address__in: z.array(z.string()).optional(),
    origin_address__in: z.array(z.string()).optional(),
    destination_address__in: z.array(z.string()).optional(),
    address_text: z.string().optional(),
    address_postcode__in: z.string().optional(),
    address_country__in: z.string().optional(),
    origin_address_text: z.string().optional(),
    origin_address_postcode__in: z.string().optional(),
    origin_address_country__in: z.string().optional(),
    destination_address_text: z.string().optional(),
    destination_address_postcode__in: z.string().optional(),
    destination_address_country__in: z.string().optional(),
    text: z.array(z.string()).optional(),
});
export type PoolOfUnplannedSettings = z.infer<typeof PoolOfUnplannedSettingsSchema>;

export const SchedulerSettingsSchema = z.object({
    resource_settings: z.object({
        trucker__in: z.array(z.string()).optional(),
        vehicle__in: z.array(z.string()).optional(),
        trailer__in: z.array(z.string()).optional(),
        carrier__in: z.array(z.string()).optional(),
        custom_id_order: z.array(z.string()).optional(),
        fleet_tags__in: z.array(z.string()).optional(),
        ordering_truckers: z.string().optional(),
        ordering_vehicles: z.string().optional(),
        ordering_trailers: z.string().optional(),
        view: z.optional(z.custom<TripSchedulerView | CharteringView | DedicatedResourcesView>()),
        extended_view: z.boolean().optional(),
    }),
    card_display_settings: z.custom<SchedulerCardSettingsData>(),
});
export type SchedulerSettings = z.infer<typeof SchedulerSettingsSchema>;

export type SchedulerSettingsView = GenericSettingsView<SchedulerSettings>;
