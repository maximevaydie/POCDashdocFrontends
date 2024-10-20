import {companySchema} from "@dashdoc/web-common";
import {fetchAdd, fetchSearch, fetchUpdate} from "@dashdoc/web-common";
import {debouncedSearch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {APIVersion} from "dashdoc-utils";

import {companyInvoicingDataSchema} from "../schemas";

export const REQUEST_COMPANY_SEARCH = "REQUEST_COMPANY_SEARCH";

function requestCompanySearch(queryName: string, query: any, page: number) {
    return {
        type: REQUEST_COMPANY_SEARCH,
        query,
        queryName,
        page,
    };
}

export const REQUEST_COMPANY_SEARCH_SUCCESS = "REQUEST_COMPANY_SEARCH_SUCCESS";

function requestCompanySearchSuccess(
    queryName: string,
    query: any,
    companies: any[],
    page: number,
    hasNextPage: boolean
) {
    return {
        type: REQUEST_COMPANY_SEARCH_SUCCESS,
        items: companies,
        query,
        queryName,
        page,
        hasNextPage,
    };
}

export const REQUEST_COMPANY_SEARCH_ERROR = "REQUEST_COMPANY_SEARCH_ERROR";

function requestCompanySearchError(queryName: string, query: any, error: any, page: number) {
    return {
        type: REQUEST_COMPANY_SEARCH_ERROR,
        error,
        queryName,
        query,
        page,
    };
}

export function fetchSearchCompanies(
    queryName: string,
    query: any,
    page: number,
    simple = false,
    apiVersion?: APIVersion
) {
    const url = simple ? "companies/simple-list" : "companies";
    return fetchSearch(url, "companies", companySchema, queryName, query, page, apiVersion);
}

export function fetchSearchGroupViewCompanies(queryName: string, query: any, page: number) {
    return fetchSearch(
        "groupviews/companies",
        "companies",
        companySchema,
        queryName,
        query,
        page,
        "v4"
    );
}

export function fetchDebouncedSearchCompanies(
    queryName: string,
    query = {},
    page = 1,
    simple = false
) {
    return (dispatch: Function) => {
        const url = simple ? "/companies/simple-list/" : "/companies/";
        dispatch(requestCompanySearch(queryName, query, page));
        return debouncedSearch(url)(
            queryName,
            query,
            page,
            dispatch,
            requestCompanySearchSuccess,
            requestCompanySearchError
        );
    };
}

export function fetchAddCompanyFromGroupView(payload: any) {
    return fetchAdd(
        "groupviews/companies",
        "company",
        payload,
        companySchema,
        t("common.updateSaved"),
        undefined,
        "v4"
    );
}

export function fetchUpdateCompanyInvoicingData(companyPk: number, payload: any) {
    return fetchUpdate({
        urlBase: "customer-invoicing-data",
        objName: "companyInvoicingData",
        uid: companyPk,
        obj: payload,
        objSchema: companyInvoicingDataSchema,
        successMessage: t("common.updateSaved"),
        apiVersion: "web",
    });
}
