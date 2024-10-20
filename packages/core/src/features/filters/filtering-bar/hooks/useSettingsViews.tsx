import {useEffect, useRef} from "react";

import {useDispatch} from "../../../../hooks/useDispatch";
import {useSelectorWithSettings} from "../../../../hooks/useSelector";
import {
    loadSettingsViewsNextPage,
    selectSettingsViewsSearchByCategory,
    settingsViewsSelector,
    type SettingsViewState,
} from "../../../../../../../react/Redux/reducers/settingsViewsReducer";

import type {CommonRootState} from "../../../../../../../react/Redux/types";
import type {GenericSettingsView} from "../genericSettingsViews.types";

type SettingsView = {
    settingsViews: SettingsViewState;
};

type State = CommonRootState & SettingsView;

export function useSettingsViews(
    categories: GenericSettingsView["category"][]
): GenericSettingsView[] {
    const dispatch = useDispatch();

    // Load all settings views pages of specified categories
    const search = useSelectorWithSettings((state) =>
        selectSettingsViewsSearchByCategory(state, categories)
    );

    const firstLoad = useRef(true);

    useEffect(() => {
        if (
            !search ||
            (search.hasNextPage &&
                search.loading !== "pending" &&
                (search.loading !== "failed" || firstLoad.current))
        ) {
            firstLoad.current = false;
            dispatch(loadSettingsViewsNextPage({categories}));
        }
    }, [search, dispatch, categories]);

    return useSelectorWithSettings(
        (state: State) => settingsViewsSelector(state, categories) as GenericSettingsView[]
    );
}
