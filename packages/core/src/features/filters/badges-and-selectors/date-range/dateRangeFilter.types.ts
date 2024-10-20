export type FilterDateTypes =
    | "transport"
    | "all"
    | "loading"
    | "unloading"
    | "invoicing"
    | "due"
    | "transports"
    | "payment"
    | "created";

export type BadgeDatesTypesKeys<TQuery> = {
    startDateKey: keyof TQuery;
    endDateKey: keyof TQuery;
    periodQueryKey: keyof TQuery;
    typeOfDates: FilterDateTypes;
};
