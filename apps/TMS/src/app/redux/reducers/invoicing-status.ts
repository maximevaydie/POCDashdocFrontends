import {apiService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {createAsyncThunk, createReducer} from "@reduxjs/toolkit";

import {
    InvoicingMethodStatus,
    validateInvoicingMethodStatusOrRaise,
} from "app/taxation/invoicing/types/invoiceMethodStatusType";

// Action Creators
// ---------------

export const fetchInvoicingStatusAsync = async (): Promise<InvoicingMethodStatus> => {
    try {
        const response: unknown = await apiService.get("invoicing-method-status/", {
            apiVersion: "web",
        });
        const invoicingMethodStatus: InvoicingMethodStatus =
            validateInvoicingMethodStatusOrRaise(response);
        return invoicingMethodStatus;
    } catch (error) {
        Logger.error("Unexpected error while fetching invoicing method status.", error);
        throw error;
    }
};

export const fetchInvoicingStatus = createAsyncThunk(
    "dashdoc/invoicing-status",
    fetchInvoicingStatusAsync
);

// Reducer
// -------

export type InvoicingStatus = {
    loading: boolean;
    error: boolean;
    data: InvoicingMethodStatus | null;
};

const initialState: InvoicingStatus = {
    loading: false,
    error: false,
    data: null,
};

export const invoicingStatusReducer = createReducer<InvoicingStatus>(initialState, (builder) => {
    builder.addCase(fetchInvoicingStatus.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = false;
    });
    builder.addCase(fetchInvoicingStatus.pending, (state) => {
        state.loading = true;
        state.error = false;
    });
    builder.addCase(fetchInvoicingStatus.rejected, (state) => {
        state.loading = false;
        state.error = true;
    });
});
