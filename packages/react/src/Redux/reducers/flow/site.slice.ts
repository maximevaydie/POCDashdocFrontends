import {apiService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {createAction, createAsyncThunk, createReducer, createSelector} from "@reduxjs/toolkit";
import {populateFormData} from "dashdoc-utils";
import {FlowState} from "redux/reducers/flow";
import {actionService} from "redux/services/action.service";
import {LoadingState, Site} from "types";

// Action Creators
// ---------------

export const firstTimeAsDelegate = createAction("dashdoc/flow/site/firstTimeAsDelegate");
export const firstTimeAsDelegateClose = createAction("dashdoc/flow/site/firstTimeAsDelegateClose");

export const getSite = createAsyncThunk("dashdoc/flow/site/get", async (siteId: number) => {
    const response: Site = await apiService.get(`/flow/sites/${siteId}/`, {apiVersion: "web"});
    return response;
});

export type SitePatchPayload = {
    id: number;
} & Partial<{
    contact_email: string;
    contact_phone: string;
    address:
        | {
              address: string;
              city: string;
              postcode: string;
              country: string;
              longitude: null;
              latitude: null;
          }
        | {
              address: string;
              city: string;
              postcode: string;
              country: string;
              longitude: number;
              latitude: number;
          };
    use_slot_handled_state: boolean;
}>;

export const getSiteBySlug = createAsyncThunk(
    "dashdoc/flow/site/getBySlug",
    async (slug: string) => {
        const response: Site = await apiService.get(`/flow/sites/slug/${slug}/`, {
            apiVersion: "web",
        });
        return response;
    }
);

export const patchSite = createAsyncThunk(
    "dashdoc/flow/site/patch",
    async ({payload}: {payload: SitePatchPayload}, {rejectWithValue}) => {
        try {
            const response: Site = await apiService.patch(`/flow/sites/${payload.id}/`, payload, {
                apiVersion: "web",
            });
            return response;
        } catch (err) {
            Logger.error(err);
            const errorPayload = await actionService.getErrorPayload(err);
            return rejectWithValue(errorPayload);
        }
    }
);

export type SiteSecurityProtocolPayload = {
    site: number;
    file: File;
};

export const addSiteSecurityProtocol = createAsyncThunk(
    "dashdoc/flow/site/securityProtocol/add",
    async ({payload: {site, file}}: {payload: SiteSecurityProtocolPayload}, {rejectWithValue}) => {
        try {
            const formData = populateFormData({file});
            const response = await apiService.post(
                `/flow/sites/${site}/security-protocol/`,
                formData,
                {
                    apiVersion: "web",
                }
            );
            return response;
        } catch (err) {
            Logger.error(err);
            const errorPayload = await actionService.getErrorPayload(err);
            return rejectWithValue(errorPayload);
        }
    }
);

export const deleteSiteSecurityProtocol = createAsyncThunk(
    "dashdoc/flow/site/securityProtocol/delete",
    async ({payload: {site}}: {payload: {site: number}}, {rejectWithValue}) => {
        try {
            const response = await apiService.delete(`/flow/sites/${site}/security-protocol/`, {
                apiVersion: "web",
            });
            return response;
        } catch (err) {
            Logger.error(err);
            const errorPayload = await actionService.getErrorPayload(err);
            return rejectWithValue(errorPayload);
        }
    }
);

// Reducer
// -------
export type SiteState = {
    entity: Site | null;
    loading: LoadingState;
    firstTimeAsDelegate: boolean;
};

const initialState: SiteState = {
    entity: null,
    loading: "idle",
    firstTimeAsDelegate: false,
};

export const siteReducer = createReducer<SiteState>(initialState, (builder) => {
    builder.addCase(getSiteBySlug.pending, (state) => {
        if (state.loading === "idle") {
            state.loading = "pending";
        } else {
            state.loading = "reloading";
        }
    });
    builder.addCase(getSiteBySlug.rejected, (state) => {
        state.loading = "failed";
    });
    builder.addCase(getSiteBySlug.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.loading = "succeeded";
    });

    builder.addCase(firstTimeAsDelegate, (state) => {
        state.firstTimeAsDelegate = true;
    });
    builder.addCase(firstTimeAsDelegateClose, (state) => {
        state.firstTimeAsDelegate = false;
    });
    builder.addCase(patchSite.fulfilled, (state, action) => {
        state.entity = action.payload;
        state.loading = "succeeded";
        toast.success(t("flow.site.patch.success"));
    });

    builder.addCase(addSiteSecurityProtocol.fulfilled, (state, action) => {
        if (state.entity) {
            state.entity.security_protocol = action.payload;
        }
    });

    builder.addCase(deleteSiteSecurityProtocol.fulfilled, (state) => {
        if (state.entity) {
            state.entity.security_protocol = null;
        }
    });
});

const selectSelf = (state: {flow: FlowState}) => state;

export const selectSite = createSelector(selectSelf, ({flow}) => flow.site.entity);
export const selectSiteLoading = createSelector(selectSelf, ({flow}) => flow.site.loading);
export const selectFirstTimeAsDelegate = createSelector(
    selectSelf,
    ({flow}) => flow.site.firstTimeAsDelegate
);
