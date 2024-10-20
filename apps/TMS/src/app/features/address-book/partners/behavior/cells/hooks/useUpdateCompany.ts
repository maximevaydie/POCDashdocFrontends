import {useTimezone, fetchUpdateCompany} from "@dashdoc/web-common";
import {getErrorMessageFromServerError} from "@dashdoc/web-common";
import {Address, Company} from "dashdoc-utils";
import {useCallback} from "react";

import {
    getPartnersQueryParamsFromFilterQuery,
    type FilterQueryWithNavigationParameters,
} from "app/features/filters/deprecated/utils";
import {fetchSearchCompanies} from "app/redux/actions";
import {fetchDeleteLogisticPoint} from "app/redux/actions/logisticPoints";
import {useDispatch} from "app/redux/hooks";

import {PARTNER_QUERY_NAME_UPDATE_COMPANY, PartnersScreenQuery} from "../../../types";

export function useUpdateCompany(currentQuery: PartnersScreenQuery) {
    const dispatch = useDispatch();
    const timezone = useTimezone();

    const reloadCompany = useCallback(
        (companyPk: Company["pk"]) =>
            dispatch(
                fetchSearchCompanies(
                    PARTNER_QUERY_NAME_UPDATE_COMPANY,
                    {
                        ...getPartnersQueryParamsFromFilterQuery(
                            currentQuery as FilterQueryWithNavigationParameters,
                            timezone
                        ),
                        company: companyPk,
                    },
                    1
                )
            ),
        [currentQuery, timezone, dispatch]
    );
    const onUpdateCompany = useCallback(
        (companyPk: Company["pk"], payload: any, callback: Function) => {
            dispatch(fetchUpdateCompany(companyPk, payload)).then(
                (response: any) => {
                    if (response.error) {
                        getErrorMessageFromServerError(response.error).then(
                            (errorMessage?: string) => {
                                callback(errorMessage);
                            }
                        );
                    } else {
                        reloadCompany(companyPk).then(() => {
                            callback();
                        });
                    }
                },
                (error: any) => {
                    getErrorMessageFromServerError(error).then((errorMessage?: string) => {
                        callback(errorMessage);
                    });
                }
            );
        },
        [dispatch, reloadCompany]
    );

    const onSaveAddress = useCallback(
        async (address: Address, callback: Function) => {
            if (address.company.pk) {
                await reloadCompany(address.company.pk);
            }
            callback();
        },
        [reloadCompany]
    );

    const onDeleteAddress = useCallback(
        async (address: Address, callback: Function) => {
            await dispatch(fetchDeleteLogisticPoint(address.pk));
            if (address.company.pk) {
                await reloadCompany(address.company.pk);
            }
            callback();
        },
        [dispatch, reloadCompany]
    );
    return {onDeleteAddress, onUpdateCompany, onSaveAddress};
}
