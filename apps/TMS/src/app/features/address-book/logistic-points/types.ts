import {LogisticPoint, periodOptions} from "@dashdoc/web-common";
import {z} from "zod";

export type LogisticPointListColumnName = keyof LogisticPoint | "type" | "signatories";

export const LogisticPointsFilterSchema = z.object({
    text: z.array(z.string()).optional(),
    company: z.string().optional(),
    creation_method__in: z.array(z.enum(["partner", "api", "trucker", "manager"])).optional(),
    period: z.enum(periodOptions).optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    ordering: z.string().optional(),
    has_security_protocol: z.boolean().optional(),
    has_coords_validated: z.boolean().optional(),
    has_instructions: z.boolean().optional(),
});
export type LogisticPointsFilter = z.infer<typeof LogisticPointsFilterSchema>;

export const LogisticPointsQuerySchema = z.object({
    text: z.array(z.string()).optional(),
    company: z.string().optional(),
    category__in: z.array(z.enum(["origin", "destination"])),
    creation_method__in: z.array(z.enum(["partner", "api", "trucker", "manager"])).optional(),
    created__gte: z.string().optional(),
    created__lte: z.string().optional(),
    ordering: z.string().optional(),
    has_security_protocol: z.boolean().optional(),
    has_coords_validated: z.boolean().optional(),
    has_instructions: z.boolean().optional(),
});

export type LogisticPointsQuery = z.infer<typeof LogisticPointsQuerySchema>;
export const LOGISTIC_POINTS_VIEW_CATEGORY = "logistic_points";

export type LogisticPointSelection = (
    | LogisticPointsQuery
    | {
          pk__in: number[];
      }
) & {allCount: number};
