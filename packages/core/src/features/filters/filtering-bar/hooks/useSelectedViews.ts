import {Logger} from "@dashdoc/web-core";
import {useCallback, useState} from "react";
import createPersistedState from "use-persisted-state";

import {useSelector} from "../../../../hooks/useSelector";
import {getConnectedCompanyId} from "../../../../../../../react/Redux/accountSelector";

const PRESELECTED_VIEWS_STORAGE_KEY = "settingsViews";
const preselectedViewsState = createPersistedState(PRESELECTED_VIEWS_STORAGE_KEY, sessionStorage);

export type PreselectedViews<TViewKeys extends string> = Partial<
    Record<TViewKeys, number | undefined>
>;
export type PreselectedViewsByCompany<TViewKeys extends string> = Record<
    number,
    PreselectedViews<TViewKeys>
>;

export function useSelectedViews<TViewKeys extends string>() {
    const [preselectedViews, setPreselectedViews] = preselectedViewsState<
        PreselectedViewsByCompany<TViewKeys>
    >({});

    const companyId = useSelector(getConnectedCompanyId);

    const [selectedViews, setSelectedViews] = useState<PreselectedViews<TViewKeys>>(
        companyId && preselectedViews[companyId] ? preselectedViews[companyId] : {}
    );

    const updateSelectedViews = useCallback(
        (value: PreselectedViews<TViewKeys>) => {
            setSelectedViews((prev) => ({...prev, ...value}));
            // Need to add a try catch to handle the following error when call the function from useEffect
            // https://github.com/donavon/use-persisted-state/issues/56
            try {
                if (companyId) {
                    setPreselectedViews((prev) => ({
                        ...prev,
                        [companyId]: {...(prev[companyId] ?? {}), ...value},
                    }));
                }
            } catch (err) {
                Logger.error("Cannot set view in storage", err);
            }
        },
        [companyId, setPreselectedViews]
    );

    return {
        ...selectedViews,
        updateSelectedViews,
    };
}
