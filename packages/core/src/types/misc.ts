export type LoadingState = "idle" | "pending" | "reloading" | "succeeded" | "failed";

export type MutationState = "idle" | "pending" | "succeeded" | "failed";

export type DayOpeningHours = Array<Array<string>>;

export type Weekday =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

// This profile is derived from the redux store state.
export type FlowProfile = "siteManager" | "delegate" | "guest";
