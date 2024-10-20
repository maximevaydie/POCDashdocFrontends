import {apiService} from "../../services/api.service";
export const REQUEST_DELETE_COMPANY = "REQUEST_DELETE_COMPANY";

function requestDeleteCompany(companyPk: string) {
    return {
        type: REQUEST_DELETE_COMPANY,
        companyPk,
    };
}

export const REQUEST_DELETE_COMPANY_SUCCESS = "REQUEST_DELETE_COMPANY_SUCCESS";

function requestDeleteCompanySuccess(companyPk: string) {
    return {
        type: REQUEST_DELETE_COMPANY_SUCCESS,
        companyPk,
    };
}

export const REQUEST_DELETE_COMPANY_ERROR = "REQUEST_DELETE_COMPANY_ERROR";

function requestDeleteCompanyError(companyPk: string, error: any) {
    return {
        type: REQUEST_DELETE_COMPANY_ERROR,
        error,
        companyPk,
    };
}

export function fetchDeleteCompany(companyPk: string) {
    return async (dispatch: Function) => {
        dispatch(requestDeleteCompany(companyPk));
        try {
            await apiService.delete(`/companies/${companyPk}/`);
            return dispatch(requestDeleteCompanySuccess(companyPk));
        } catch (error) {
            return dispatch(requestDeleteCompanyError(companyPk, error));
        }
    };
}
