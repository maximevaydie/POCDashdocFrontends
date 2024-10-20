import {
    TypedUseSelectorHook,
    useDispatch as untypedUseDispatch,
    useSelector as untypedUseSelector,
} from "react-redux";

import {RootState} from "./reducers";

export const useDispatch: () => (action: any) => Promise<any> = untypedUseDispatch;
export type DispatchType = ReturnType<typeof useDispatch>;
export const useSelector: TypedUseSelectorHook<RootState> = untypedUseSelector;
