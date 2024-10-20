import {Logger, queryService, t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {createAsyncThunk, createReducer, createSelector} from "@reduxjs/toolkit";
import omit from "lodash.omit";
import {normalize, schema} from "normalizr";

import {GenericSettingsView} from "../../../dashdocOLD/common/src/features/filters/filtering-bar/genericSettingsViews.types";
import {getErrorMessage} from "../utils";
import {apiService} from "../../services/api.service";
import {storeService} from "../../services/store.service";

import type {CommonRootState} from "../types";

type State = CommonRootState & {
    settingsViews: SettingsViewState;
};

// Action Creators
// ---------------
export const retrieveSettingsView = createAsyncThunk(
    "dashdoc/retrieveSettingsView",
    async ({id}: {id: number}, {rejectWithValue}) => {
        try {
            const response = await apiService.get(`/settings-views/${id}/`, {
                apiVersion: "web",
            });
            return response;
        } catch (error) {
            Logger.error(error);
            return rejectWithValue(error);
        }
    }
);

export function retrieveSettingsViewIfNeeded(id: number) {
    const entities = storeService.getState<State>().settingsViews.entities;
    if (entities[id]) {
        return () => {
            return {payload: entities[id]};
        };
    }

    return retrieveSettingsView({
        id,
    });
}
export const createSettingsView = createAsyncThunk<
    GenericSettingsView,
    Omit<GenericSettingsView, "pk">
>("dashdoc/createSettingsView", async (data, {rejectWithValue}) => {
    try {
        const response = await apiService.post(`/settings-views/`, data, {
            apiVersion: "web",
        });
        toast.success(t("common.success"));
        return response;
    } catch (error) {
        Logger.error(error);
        toast.error(await getErrorMessage(error));
        return rejectWithValue(error);
    }
});
export const updateSettingsView = createAsyncThunk(
    "dashdoc/updateSettingsView",
    async (
        {
            id,
            data,
            successMessage,
        }: {
            id: number;
            data: GenericSettingsView;
            successMessage?: string;
        },
        {rejectWithValue}
    ) => {
        try {
            const response = await apiService.patch(`/settings-views/${id}/`, data, {
                apiVersion: "web",
            });
            toast.success(successMessage);
            return response;
        } catch (error) {
            Logger.error(error);
            toast.error(await getErrorMessage(error));
            return rejectWithValue(error);
        }
    }
);
export const deleteSettingsView = createAsyncThunk(
    "dashdoc/deleteSettingsView",
    async ({id}: {id: number}, {rejectWithValue}) => {
        try {
            const response = await apiService.delete(`/settings-views/${id}/`, {
                apiVersion: "web",
            });
            return response;
        } catch (error) {
            Logger.error(error);
            toast.error(await getErrorMessage(error));
            return rejectWithValue(error);
        }
    }
);

export const fetchSettingsViewsNextPage = createAsyncThunk(
    "dashdoc/fetchSettingsViewsNextPage",
    async ({
        queryString,
        page = 1,
        getMode,
    }: {
        queryString: string;
        page: number;
        getMode: "getOrCreate" | "get";
    }) => {
        let response;
        if (getMode === "getOrCreate") {
            response = await apiService.post(
                `/settings-views/get-or-create/?${queryString}&page=${page}`,
                null,
                {
                    apiVersion: "web",
                }
            );
        } else {
            response = await apiService.get(`/settings-views/?${queryString}&page=${page}`, {
                apiVersion: "web",
            });
        }
        const normalized = normalize(response.results, viewsSchema);
        return {
            entities: normalized.entities.settingsViews,
            results: normalized.result,
            hasNextPage: response.next !== null,
        };
    }
);

export function loadSettingsViewsNextPage({
    categories,
}: {
    categories: GenericSettingsView["category"][];
}) {
    const queryString = queryService.toQueryString({category__in: categories.join(",")});
    const loadedResults = storeService.getState<State>().settingsViews.searches[queryString];
    if (loadedResults && loadedResults.loading === "pending") {
        return () => {
            // nothing to do, loading already in progress
        };
    }
    if (loadedResults && !loadedResults.hasNextPage) {
        return () => {
            // nothing to do, all pages already loaded
        };
    }
    return fetchSettingsViewsNextPage({
        queryString,
        page: loadedResults ? loadedResults.page + 1 : 1,
        getMode:
            categories.length === 0 || categories.includes("scheduler") ? "getOrCreate" : "get",
    });
}

type LoadingState = "idle" | "pending" | "succeeded" | "failed";
type PaginatedResults = {
    items: number[];
    page: number;
    hasNextPage: boolean;
    loading: LoadingState;
};
export type SettingsViewState = {
    entities: Record<number, GenericSettingsView | undefined>;
    searches: Record<string, PaginatedResults>;
    adding: boolean;
};

const initialState: SettingsViewState = {
    entities: {},
    searches: {},
    adding: false,
};

const viewsSchema = new schema.Array(
    new schema.Entity("settingsViews", undefined, {idAttribute: "pk"})
);

// Reducer
// -------
export const settingsViewsReducer = createReducer<SettingsViewState>(initialState, (builder) => {
    builder.addCase(retrieveSettingsView.fulfilled, (state, action) => {
        state.entities[action.payload.pk] = action.payload;
    });
    builder.addCase(createSettingsView.pending, (state) => {
        state.adding = true;
    });
    builder.addCase(createSettingsView.fulfilled, (state, action) => {
        state.adding = false;
        state.entities[action.payload.pk] = action.payload;
        const searchesToUpdate = Object.keys(state.searches).filter((queryString) => {
            const query = queryService.parseQueryString("?" + queryString);
            return query?.category__in?.includes(action.payload.category);
        });
        // As elements are sorted by creation date we can add element
        // at the end of the list manually if all data are already loaded
        searchesToUpdate.map((queryString) => {
            const search = state.searches[queryString];
            if (!search.hasNextPage) {
                search.items.push(action.payload.pk);
            }
        });
    });
    builder.addCase(createSettingsView.rejected, (state) => {
        state.adding = false;
    });
    builder.addCase(updateSettingsView.fulfilled, (state, action) => {
        state.entities[action.meta.arg.id] = action.payload;
    });
    builder.addCase(deleteSettingsView.fulfilled, (state, action) => {
        state.entities = omit(state.entities, action.meta.arg.id);
    });
    builder.addCase(fetchSettingsViewsNextPage.pending, (state, action) => {
        if (!state.searches[action.meta.arg.queryString]) {
            state.searches[action.meta.arg.queryString] = {
                items: [],
                page: action.meta.arg.page - 1,
                hasNextPage: true,
                loading: "pending",
            };
        } else {
            state.searches[action.meta.arg.queryString].loading = "pending";
        }
    });
    builder.addCase(fetchSettingsViewsNextPage.fulfilled, (state, action) => {
        state.entities = {...state.entities, ...action.payload.entities};
        state.searches[action.meta.arg.queryString] = {
            items: [
                ...state.searches[action.meta.arg.queryString].items,
                ...action.payload.results,
            ],
            page: action.meta.arg.page,
            hasNextPage: action.payload.hasNextPage,
            loading: "succeeded",
        };
    });
    builder.addCase(fetchSettingsViewsNextPage.rejected, (state, action) => {
        state.searches[action.meta.arg.queryString].loading = "failed";
    });
});

// Selectors
// -------
const selectSettingsViewsEntitiesState = (state: State) => state.settingsViews.entities;
export const selectSettingsViewsSearchByCategory = (
    state: State,
    categories: GenericSettingsView["category"][]
) =>
    state.settingsViews.searches[queryService.toQueryString({category__in: categories.join(",")})];

export const settingsViewsSelector = createSelector(
    [
        selectSettingsViewsEntitiesState,
        (state: State, categories: GenericSettingsView["category"][]) =>
            selectSettingsViewsSearchByCategory(state, categories)?.items ?? [],
    ],
    (entities, viewsIds) => {
        return viewsIds.map((id) => entities[id]).filter((v) => !!v);
    }
);
export const settingsViewSelector = createSelector(
    [
        selectSettingsViewsEntitiesState,
        (_state: State, pk: GenericSettingsView["pk"] | undefined) => pk,
    ],
    (entities, pk) => (pk ? entities[pk] : null)
);

export const settingsViewsAddingSelector = (state: State) => state.settingsViews.adding;
