import {z} from "zod";

import {
    taxCodeForCatalogZodSchema,
    TaxCodeForCatalog,
} from "app/taxation/invoicing/types/invoiceItemCatalogTypes";

// SLICE NAME
// used in the root state dict and in the root reducer
export const DASHDOC_TAX_CODES_SLICE_NAME = "dashdocTaxCodes" as const;

// STATES AND SELECTORS

/** The state of the dashdoc tax codes store*/
export type DashdocTaxCodeState = {
    dashdocTaxCodes: TaxCodeForCatalog[];
};

const initialState: DashdocTaxCodeState = {
    dashdocTaxCodes: [],
};

// I can assume that the root state extend the type
// {[DASHDOC_TAX_CODES_SLICE_NAME]: DashdocTaxCodeState}

/** Selector for the dashdoc tax codes */
export const dashdocTaxCodesSelector = (state: {
    [DASHDOC_TAX_CODES_SLICE_NAME]: DashdocTaxCodeState;
}) => state.dashdocTaxCodes;

// ACTIONS
const dashdocTaxCodeActionSchema = z.object({
    type: z.literal("POPULATE_DASHDOC_TAX_CODES"),
    payload: z.array(taxCodeForCatalogZodSchema),
});

/** The expected type of dashdoc tax code actions */
export type DashdocTaxCodeAction = z.infer<typeof dashdocTaxCodeActionSchema>;

/** Action creator for populating the dashdoc tax codes */
export const createPopulateDashdocTaxCodesAction = (
    taxCodes: TaxCodeForCatalog[]
): DashdocTaxCodeAction => ({
    type: "POPULATE_DASHDOC_TAX_CODES" as const,
    payload: taxCodes,
});

// SLICE REDUCER
/**
 * Reducer for the dashdoc tax codes.
 */
export const dashdocTaxCodesReducer = (
    state: DashdocTaxCodeState = initialState,
    action: unknown
): DashdocTaxCodeState => {
    // First check if the action is valid
    const result: {success: true; data: DashdocTaxCodeAction} | {success: false} =
        dashdocTaxCodeActionSchema.safeParse(action);
    // If the action is not valid, we return the state unchanged
    if (!result.success) {
        return state;
    }
    // If the action is valid, we can safely use it
    const taxCodeAction = result.data;
    switch (taxCodeAction.type) {
        case "POPULATE_DASHDOC_TAX_CODES":
            return {
                ...state,
                dashdocTaxCodes: taxCodeAction.payload,
            };
        default:
            // Should never happen
            return state;
    }
};
