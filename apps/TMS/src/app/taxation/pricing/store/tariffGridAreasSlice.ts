import {z} from "zod";

import {
    TariffGridAreasDetails,
    tariffGridAreasDetailsSchema,
} from "app/features/pricing/tariff-grids/types";

// SLICE NAME
// used in the root state dict and in the root reducer
export const TARIFF_GRID_AREAS_SLICE_NAME = "tariffGridAreas" as const;

// STATES AND SELECTORS

/** The state of the tariff grid areas store*/
export type TariffGridAreasState = {
    tariffGridAreas: Record<string, TariffGridAreasDetails> | undefined;
};

const initialState: TariffGridAreasState = {
    tariffGridAreas: undefined,
};

// I can assume that the root state extend the type
// {[TARIFF_GRID_AREAS_SLICE_NAME]: TariffGridAreasState}

/** Selector for the tariff grid areas */
export const tariffGridAreasSelector = (state: {
    [TARIFF_GRID_AREAS_SLICE_NAME]: TariffGridAreasState;
}) => state.tariffGridAreas;

// ACTIONS
const tariffGridAreasActionZodSchema = z.object({
    type: z.literal("POPULATE_TARIFF_GRID_AREAS"),
    payload: z.record(tariffGridAreasDetailsSchema),
});

/** The expected type of tariff grid areas actions */
export type TariffGridAreasAction = z.infer<typeof tariffGridAreasActionZodSchema>;

/** Action creator for populating the tariff grid areas */
export const createPopulateTariffGridAreaAction = (
    tariffGridAreas: Record<string, TariffGridAreasDetails>
): TariffGridAreasAction => ({
    type: "POPULATE_TARIFF_GRID_AREAS" as const,
    payload: tariffGridAreas,
});

// SLICE REDUCER
/**
 * Reducer for the tariff grid areas.
 */
export const tariffGridAreasReducer = (
    state: TariffGridAreasState = initialState,
    action: unknown
): TariffGridAreasState => {
    // First check if the action is valid
    const result: {success: true; data: TariffGridAreasAction} | {success: false} =
        tariffGridAreasActionZodSchema.safeParse(action);
    // If the action is not valid, we return the state unchanged
    if (!result.success) {
        return state;
    }
    // If the action is valid, we can safely use it
    const taxCodeAction = result.data;
    switch (taxCodeAction.type) {
        case "POPULATE_TARIFF_GRID_AREAS":
            return {
                ...state,
                tariffGridAreas: taxCodeAction.payload,
            };
        default:
            // Should never happen
            return state;
    }
};
