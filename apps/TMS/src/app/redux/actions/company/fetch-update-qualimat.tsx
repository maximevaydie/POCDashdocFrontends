import {apiService} from "@dashdoc/web-common";
import {IDTFCertification, Settings} from "dashdoc-utils";

export const UPDATE_QUALIMAT = "UPDATE_QUALIMAT";

function updateQualimat() {
    return {
        type: UPDATE_QUALIMAT,
    };
}

export const UPDATE_QUALIMAT_SUCCESS = "UPDATE_QUALIMAT_SUCCESS";

function updateQualimatSuccess(
    companyPk: number,
    idtfCertification: IDTFCertification,
    qualimatCertificateNumber: string,
    certificationName: string
) {
    return {
        type: UPDATE_QUALIMAT_SUCCESS,
        companyPk,
        enforceQualimatStandard: true,
        idtfCertification,
        qualimatCertificateNumber,
        certificationName,
    };
}

export const UPDATE_QUALIMAT_ERROR = "UPDATE_QUALIMAT_ERROR";

function updateQualimatError(error: any) {
    return {
        type: UPDATE_QUALIMAT_ERROR,
        error,
    };
}

export function fetchUpdateQualimat(
    companyPk: number,
    data: Pick<
        Settings,
        "idtf_certification" | "qualimat_certificate_number" | "certification_name"
    >
) {
    return (dispatch: Function) => {
        dispatch(updateQualimat());

        return apiService.post(`/companies/${companyPk}/update-qualimat/`, data).then(
            () => {
                return dispatch(
                    updateQualimatSuccess(
                        companyPk,
                        data.idtf_certification,
                        data.qualimat_certificate_number,
                        data.certification_name
                    )
                );
            },
            (error: any) => {
                return dispatch(updateQualimatError(error));
            }
        );
    };
}
