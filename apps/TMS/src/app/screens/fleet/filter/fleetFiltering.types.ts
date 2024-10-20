import {z} from "zod";

export const FleetSettingsSchema = z.object({
    tags__in: z.array(z.string()).optional(),
    license_plate__in: z.array(z.string()).optional(),
    fuel_type__in: z.array(z.string()).optional(),
    text: z.array(z.string()).optional(),
});

export type FleetSettings = z.infer<typeof FleetSettingsSchema>;
