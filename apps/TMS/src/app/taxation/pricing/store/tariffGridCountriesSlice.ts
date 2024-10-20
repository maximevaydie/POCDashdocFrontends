import {z} from "zod";

import {
    TariffGridCountries,
    tariffGridCountriesZodSchema,
} from "app/features/pricing/tariff-grids/types";

// SLICE NAME
// used in the root state dict and in the root reducer
export const TARIFF_GRID_COUNTRIES_SLICE_NAME = "tariffGridCountries" as const;

// STATES AND SELECTORS

/** The state of the tariff grid countries store*/
export type TariffGridCountriesState = {
    tariffGridCountries: TariffGridCountries | undefined;
};

const initialState: TariffGridCountriesState = {
    tariffGridCountries: undefined,
};

// I can assume that the root state extend the type
// {[TARIFF_GRID_COUNTRIES_SLICE_NAME]: TariffGridCountriesState}
/** Selector for the tariff grid countries */
export const tariffGridCountriesSelector = (state: {
    [TARIFF_GRID_COUNTRIES_SLICE_NAME]: TariffGridCountriesState;
}) => state.tariffGridCountries;

// ACTIONS
const tariffGridCountriesActionZodSchema = z.object({
    type: z.literal("POPULATE_TARIFF_GRID_COUNTRIES"),
    payload: tariffGridCountriesZodSchema,
});

/** The expected type of tariff grid countries actions */
export type TariffGridCountriesAction = z.infer<typeof tariffGridCountriesActionZodSchema>;

/** Action creator for populating the tariff grid countries */
export const createPopulateTariffGridCountriesAction = (
    tariffGridCountries: TariffGridCountries
): TariffGridCountriesAction => ({
    type: "POPULATE_TARIFF_GRID_COUNTRIES" as const,
    payload: tariffGridCountries,
});

// SLICE REDUCER
/**
 * Reducer for the tariff grid countries.
 */
export const tariffGridCountriesReducer = (
    state: TariffGridCountriesState = initialState,
    action: unknown
): TariffGridCountriesState => {
    // First check if the action is valid
    const result: {success: true; data: TariffGridCountriesAction} | {success: false} =
        tariffGridCountriesActionZodSchema.safeParse(action);
    // If the action is not valid, we return the state unchanged
    if (!result.success) {
        return state;
    }
    // If the action is valid, we can safely use it
    const taxCodeAction = result.data;
    switch (taxCodeAction.type) {
        case "POPULATE_TARIFF_GRID_COUNTRIES":
            return {
                ...state,
                tariffGridCountries: taxCodeAction.payload,
            };
        default:
            // Should never happen
            return state;
    }
};
