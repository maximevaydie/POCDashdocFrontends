import {getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Modal, Text, TextArea} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {useFormik} from "formik";
import React, {FunctionComponent, useState} from "react";

import {fetchSetTransportInstructions} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";

type GlobalInstructionsForm = {
    instructions: string;
};

type GlobalInstructionsModalProps = {
    transportUid: string;
    globalInstructions: string;
    onClose: () => void;
};

const GlobalInstructionsModal: FunctionComponent<GlobalInstructionsModalProps> = ({
    transportUid,
    globalInstructions,
    onClose,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const companyRole = useSelector((state) => getConnectedCompany(state)?.settings?.default_role);
    const dispatch = useDispatch();

    const form = useFormik({
        initialValues: {
            instructions: globalInstructions,
        },
        validationSchema: yup.object().shape({
            instructions: yup.string().nullable(),
        }),
        onSubmit: async (values: GlobalInstructionsForm) => {
            try {
                setIsLoading(true);
                // Update transport global instructions
                await dispatch(fetchSetTransportInstructions(transportUid, values.instructions));
                setIsLoading(false);
                onClose();
            } catch (error) {
                setIsLoading(false);
                form.setErrors({instructions: error.message});
            }
        },
    });

    let globalInstructionsInfos = "";
    switch (companyRole) {
        case "shipper":
            globalInstructionsInfos = t("transportForm.globalInstructionsTooltipShipper");
            break;
        case "carrier":
            globalInstructionsInfos = t("transportForm.globalInstructionsTooltipCarrier");
            break;
        case "carrier_and_shipper":
            globalInstructions = t("transportForm.globalInstructionsTooltipCarrierAndShipper");
            break;
        default:
            break;
    }

    return (
        <Modal
            id="global-instructions-modal"
            data-testid="global-instructions-modal"
            title={t("transportForm.globalInstructionsTitle")}
            onClose={onClose}
            mainButton={{
                type: "submit",
                children: t("common.save"),
                disabled: isLoading || !form.isValid,
                form: "global-instructions-update-form",
                ["data-testid"]: "global-instructions-update-save",
            }}
        >
            <Text mb={2}>{globalInstructionsInfos}</Text>
            <form id="global-instructions-update-form" onSubmit={form.handleSubmit} noValidate>
                <TextArea
                    pt={3}
                    css={{lineHeight: "20px"}}
                    minHeight={100}
                    data-testid="input-global-instructions"
                    {...form.getFieldProps("instructions")}
                    onChange={(_value, e) => form.handleChange(e)}
                    label={t("transportForm.globalInstructionsTitle")}
                    aria-label={t("transportForm.globalInstructionsPlaceholder")}
                    maxLength={1000}
                />
            </form>
        </Modal>
    );
};

export default GlobalInstructionsModal;
