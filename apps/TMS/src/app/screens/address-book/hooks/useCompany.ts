import {fetchCompany} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {Company} from "dashdoc-utils";
import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {createSelector} from "reselect";

import {useSelector} from "app/redux/hooks";
import {RootState} from "app/redux/reducers";

export function useCompany(pk: number) {
    const dispatch = useDispatch();
    const [{loading}, setState] = useState<{
        loading: boolean;
        companyPk: string;
    }>({
        loading: true,
        companyPk: pk.toString(),
    });
    const getCompany = createSelector(
        ({companies}: RootState) => {
            return companies;
        },
        (companies) => {
            if (companies?.items[pk]) {
                return companies.items[pk];
            } else {
                return null;
            }
        }
    );
    const company = useSelector(getCompany) as Company | null;
    const companyPk = pk.toString();
    useEffect(() => {
        const fetch = async () => {
            try {
                setState((prev) => ({...prev, loading: true}));
                await dispatch(fetchCompany(companyPk));
            } catch (e) {
                Logger.error(e);
            } finally {
                setState((prev) => ({...prev, loading: false}));
            }
        };
        fetch();
    }, [companyPk, dispatch]);

    return {
        company,
        loading,
    };
}
