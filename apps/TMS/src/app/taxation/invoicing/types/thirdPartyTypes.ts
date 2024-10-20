import {z} from "zod";

export const THIRD_PARTY_NAMES = ["billit", "custom", "mock", "pennylane", "sage"] as const;

export type ThirdPartyName = (typeof THIRD_PARTY_NAMES)[number];

/** Describes the authentication state of a connector.
 * Must match the `IsAuthenticatedDict` type in the backend.
 */
export const isAuthenticatedZodSchema = z.object({
    isAuthenticated: z.boolean(),
    authenticationData: z.optional(
        z.object({
            code: z.string(),
            authorizationUrl: z.optional(z.string()),
        })
    ),
});

export type IsAuthenticated = z.infer<typeof isAuthenticatedZodSchema>;
