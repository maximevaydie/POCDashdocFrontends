import {t} from "@dashdoc/web-core";
import {Modal} from "@dashdoc/web-ui";
import {RequestedVehicle, yup} from "dashdoc-utils";
import {useFormik} from "formik";
import React, {FunctionComponent, useState} from "react";

import {
    NewRequestedVehicle,
    RequestedVehicleSelect,
} from "app/features/fleet/requested-vehicle/RequestedVehicleSelect";
import {AmendTransportWarningBanner} from "app/features/transport/amend-transport-warning-banner";
import {fetchSetTransportRequestedVehicle} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

type RequestedVehicleForm = {
    requestedVehicle: RequestedVehicle | NewRequestedVehicle | null;
};

type RequestedVehicleModalProps = {
    transportUid: string;
    isModifyingFinalInfo: boolean;
    requestedVehicle: RequestedVehicle | null;
    onClose: () => void;
};

export const SelectRequestedVehicleModal: FunctionComponent<RequestedVehicleModalProps> = ({
    transportUid,
    isModifyingFinalInfo,
    requestedVehicle,
    onClose,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            requestedVehicle,
        },
        validationSchema: yup.object().shape({
            requestedVehicle: yup.object().nullable(),
        }),
        onSubmit: async (values: RequestedVehicleForm, formikHelpers) => {
            try {
                setIsLoading(true);
                // Update transport global instructions
                await dispatch(
                    fetchSetTransportRequestedVehicle(
                        transportUid,
                        values.requestedVehicle?.label ?? ""
                    )
                );
                setIsLoading(false);
                onClose();
            } catch (error) {
                setIsLoading(false);
                formikHelpers.setErrors({requestedVehicle: error.message});
            }
        },
    });
    return (
        <Modal
            id="requested-vehicle-modal"
            data-testid="requested-vehicle-modal"
            title={t("components.requestedVehicle.selectTitleModal")}
            onClose={onClose}
            mainButton={{
                type: "submit",
                children: t("common.save"),
                disabled: isLoading || !formik.isValid,
                form: "requested-vehicle-update-form",
                ["data-testid"]: "requested-vehicle-update-save",
            }}
        >
            {isModifyingFinalInfo && <AmendTransportWarningBanner isRental />}
            <form id="requested-vehicle-update-form" onSubmit={formik.handleSubmit} noValidate>
                <RequestedVehicleSelect
                    requestedVehicle={formik.values.requestedVehicle}
                    onChange={(requestedVehicle) => {
                        formik.setFieldValue("requestedVehicle", requestedVehicle);
                    }}
                    data-testid="requested-vehicle-select"
                />
            </form>
        </Modal>
    );
};
