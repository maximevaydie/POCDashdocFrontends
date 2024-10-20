import {TypedUseSelectorHook, useSelector as untypedUseSelector} from "react-redux";

import type {SettingsViewState} from "../redux/reducers/settingsViewsReducer";
import type {CommonRootState} from "../redux/types";

export const useSelector: TypedUseSelectorHook<CommonRootState> = untypedUseSelector;

export const useSelectorWithSettings: TypedUseSelectorHook<
    CommonRootState & {settingsViews: SettingsViewState}
> = untypedUseSelector;
