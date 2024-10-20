import {apiService, createSelector, loadAccount} from "@dashdoc/web-common";
import {createReducer, createAsyncThunk, createAction} from "@reduxjs/toolkit";
import {RootState} from "redux/reducers";
import {RetrievedWasteCompany} from "types";

export type WamAccountState = {
    wasteCompany: RetrievedWasteCompany | null | undefined;
};

const initialState: WamAccountState = {
    wasteCompany: null,
};

export const loadAccountWithWasteDetails = createAsyncThunk(
    "dashdoc/waste/account/load",
    async (_, {getState, dispatch}) => {
        await dispatch(loadAccount());
        const state = getState() as RootState;
        const companyId = state.account.companyId;
        if (!companyId) {
            return;
        }

        await dispatch(fetchWamAccount(companyId));
    }
);

export const fetchWamAccount = createAsyncThunk(
    "dashdoc/waste/account/fetch",
    async (companyId: number, {rejectWithValue}) => {
        try {
            const response = await apiService.get(`/waste-companies/${companyId}/`, {
                apiVersion: "web",
            });

            return response;
        } catch (e) {
            return rejectWithValue(e);
        }
    }
);

export const updateConnectedWamCompany = createAction<RetrievedWasteCompany>(
    "dashdoc/waste/account/updateConnectedWamCompany"
);

export const wamAccountReducer = createReducer(initialState, (builder) => {
    builder.addCase(fetchWamAccount.fulfilled, (state, action): WamAccountState => {
        state.wasteCompany = action.payload;

        return state;
    });

    builder.addCase(fetchWamAccount.rejected, (state): WamAccountState => {
        state.wasteCompany = null;

        return state;
    });

    builder.addCase(updateConnectedWamCompany, (state, action): WamAccountState => {
        state.wasteCompany = action.payload;

        return state;
    });
});

export const getConnectedWamCompany = createSelector(
    (state: RootState) => state.wamAccount.wasteCompany,
    (company) => {
        if (company) {
            return company;
        }
        return null;
    }
);
