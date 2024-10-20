import {PreselectedViews} from "@dashdoc/web-common";
import {createContext, useCallback, useMemo} from "react";

import {ViewContext} from "app/screens/scheduler/hook/view/viewContexts.types";

export const PoolViewContext = createContext<ViewContext>({
    viewPk: undefined,
    selectViewPk: () => {},
});

export function usePoolViewContext(
    viewPk: number | undefined,
    updateSelectedViews: (value: PreselectedViews<"poolViewPk">) => void
) {
    const selectViewPk = useCallback(
        (viewPk: number | undefined) => {
            updateSelectedViews({poolViewPk: viewPk});
        },
        [updateSelectedViews]
    );

    const poolViewContext = useMemo(
        () => ({
            viewPk,
            selectViewPk,
        }),
        [viewPk, selectViewPk]
    );

    return poolViewContext;
}
