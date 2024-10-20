// This file was generated by api-spec/openapi_to_ts.py. Do not edit it manually.

import * as z from "zod";

// @ts-ignore
import * as DynamicForm from "./DynamicForm";
// @ts-ignore
import * as ExtensionTriggers from "./ExtensionTriggers";

export type ExtensionInstantiatedResponse = {
    uid: string;
    template_connector_uid: string;
};
export const ExtensionInstantiatedResponseSchema = z.object({
    uid: z.string(),
    template_connector_uid: z.string(),
});

export type InstantiateExtensionRequest = {
    parameters: Record<string, string | number | null>;
};
export const InstantiateExtensionRequestSchema = z.object({
    parameters: z.record(z.string(), z.union([z.string(), z.number()]).nullable()),
});

export type RunResultMetrics = {
    transport_count_imported: number;
    emails_sent: number;
};
export const RunResultMetricsSchema = z.object({
    transport_count_imported: z.number(),
    emails_sent: z.number(),
});

export type RunResult = {
    finished_at: string;
    successful: boolean;
    exit_message: string;
    metrics: RunResultMetrics;
};
export const RunResultSchema = z.object({
    finished_at: z.string().datetime(),
    successful: z.boolean(),
    exit_message: z.string(),
    metrics: RunResultMetricsSchema,
});

export type Extension = {
    uid: string;
    name: string;
    icon_url: string;
    description: string;
    instantiated: boolean;
    last_workflow_run_result: RunResult | null;
    parameters: (
        | DynamicForm.ParameterSpecString
        | DynamicForm.ParameterSpecId
        | DynamicForm.ParameterSpecUid
    )[];
    sections: DynamicForm.SectionSpec[];
};
export const ExtensionSchema = z.object({
    uid: z.string(),
    name: z.string(),
    icon_url: z.string(),
    description: z.string(),
    instantiated: z.boolean(),
    last_workflow_run_result: RunResultSchema.nullable(),
    parameters: z.array(
        z.union([
            DynamicForm.ParameterSpecStringSchema,
            DynamicForm.ParameterSpecIdSchema,
            DynamicForm.ParameterSpecUidSchema,
        ])
    ),
    sections: z.array(DynamicForm.SectionSpecSchema),
});

export type ShortExtension = {
    uid: string;
    name: string;
    icon_url: string;
};
export const ShortExtensionSchema = z.object({
    uid: z.string(),
    name: z.string(),
    icon_url: z.string(),
});

export type TripSendToNetworkTriggerRequest = {
    trip_uid: string;
    parameters: Record<string, string | number | null>;
};
export const TripSendToNetworkTriggerRequestSchema = z.object({
    trip_uid: z.string(),
    parameters: z.record(z.string(), z.union([z.string(), z.number()]).nullable()),
});
