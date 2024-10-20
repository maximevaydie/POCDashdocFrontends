import {z} from "zod";

export const WebhookLogSettingsSchema = z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    timeout: z.boolean().optional(),
    text: z.array(z.string()).optional(),
});

export type WebhookLogSettings = z.infer<typeof WebhookLogSettingsSchema>;

export const DEFAULT_WEBHOOK_LOG_SETTINGS = {
    start_date: undefined,
    end_date: undefined,
    timeout: undefined,
    text: [],
};
