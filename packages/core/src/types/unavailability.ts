import {z} from "zod";

export const partialUnavailabilitySchema = z.object({
    start_time: z.string().nonempty(),
    end_time: z.string().nonempty(),
    slot_count: z.number().min(1).nullable(),
});

export type PartialUnavailability = z.infer<typeof partialUnavailabilitySchema>;

export type Unavailability = PartialUnavailability & {
    id: number;
    zone: number;
    created_at: string;
    cancelled_at: string | null;
    cancelled_by: number | null;
    cancel_reason: string | null;
    author: number;
};
