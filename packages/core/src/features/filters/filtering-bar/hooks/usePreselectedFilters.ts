import {Logger} from "@dashdoc/web-core";
import {useCallback} from "react";
import createPersistedState from "use-persisted-state";

import {useSelector} from "../../../../hooks/useSelector";
import {getConnectedCompanyId} from "../../../../../../../react/Redux/accountSelector";

const PRESELECTED_TRANSPORT_FILTERS_STORAGE_KEY = "filters.transport";
const preselectedFiltersState = createPersistedState(
    PRESELECTED_TRANSPORT_FILTERS_STORAGE_KEY,
    sessionStorage
);

export type PreselectedFiltersByCompany<TPreselectedFilters> = Record<number, TPreselectedFilters>;

export function usePreselectedFilters<TPreselectedFilters extends Partial<Record<string, any>>>() {
    const [preselectedFilters, setPreselectedFilters] = preselectedFiltersState<
        PreselectedFiltersByCompany<TPreselectedFilters>
    >({});

    const companyId = useSelector(getConnectedCompanyId);

    const selectedFilters = (
        companyId && preselectedFilters[companyId] ? preselectedFilters[companyId] : {}
    ) as TPreselectedFilters;
    const updateSelectedFilters = useCallback(
        (
            key: keyof TPreselectedFilters,
            value: TPreselectedFilters[keyof TPreselectedFilters]
        ) => {
            // Need to add a try catch to handle the following error when call the function from useEffect
            // https://github.com/donavon/use-persisted-state/issues/56
            try {
                if (companyId) {
                    setPreselectedFilters((prev) => {
                        const prevCompany = prev[companyId] ?? {};
                        return {
                            ...prev,
                            [companyId]: {
                                ...prevCompany,
                                [key]: {...(prevCompany[key] ?? {}), ...value},
                            },
                        };
                    });
                }
            } catch (err) {
                Logger.error("Cannot set view in storage", err);
            }
        },
        [companyId, setPreselectedFilters]
    );

    return {
        selectedFilters,
        updateSelectedFilters,
    };
}
