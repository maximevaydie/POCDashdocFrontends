import {Company} from "dashdoc-utils";

import {apiService} from "../../services/api.service";

export const REQUEST_COMPANY = "REQUEST_COMPANY";

function requestCompany(companyPk: string) {
    return {
        type: REQUEST_COMPANY,
        companyPk,
    };
}

export const REQUEST_COMPANY_SUCCESS = "REQUEST_COMPANY_SUCCESS";

export function requestCompanySuccess(company: Company) {
    return {
        type: REQUEST_COMPANY_SUCCESS,
        company,
    };
}

export const REQUEST_COMPANY_ERROR = "REQUEST_COMPANY_ERROR";

function requestCompanyError(companyPk: string, error: any) {
    return {
        type: REQUEST_COMPANY_ERROR,
        error,
        companyPk,
    };
}

export function fetchCompany(companyPk: string) {
    return async (dispatch: Function) => {
        dispatch(requestCompany(companyPk));
        try {
            const response: Company = await apiService.get(`/companies/${companyPk}/`);
            dispatch(requestCompanySuccess(response));
            return response;
        } catch (error) {
            dispatch(requestCompanyError(companyPk, error));
            return error;
        }
    };
}
