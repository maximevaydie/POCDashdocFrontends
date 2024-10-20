import {z} from "zod";

export const TruckersSettingsSchema = z.object({
    tags__in: z.array(z.string()).optional(),
    trucker__in: z.array(z.string()).optional(),
    carrier__in: z.array(z.string()).optional(),
    text: z.array(z.string()).optional(),
});

export type TruckersSettings = z.infer<typeof TruckersSettingsSchema>;
