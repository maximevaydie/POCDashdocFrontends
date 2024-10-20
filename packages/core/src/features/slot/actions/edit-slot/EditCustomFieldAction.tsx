import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useSelector} from "redux/hooks";
import {isUpdating} from "redux/reducers/flow/slot.slice";
import {Slot, SlotCustomField} from "types";

import {EditCustomFieldModal} from "./modals/EditCustomFieldModal";
type Props = {customField: SlotCustomField; slot: Slot};

export function EditCustomFieldAction({customField, slot}: Props) {
    const disabled = useSelector(isUpdating);
    const [show, setShow, setHide] = useToggle(false);
    return (
        <>
            <Button
                data-testid="edit-custom-field-modal"
                variant="secondary"
                onClick={setShow}
                disabled={disabled}
                width="fit-content"
            >
                {t("common.edit")}
            </Button>
            {show && (
                <EditCustomFieldModal
                    title={customField.label}
                    customField={customField}
                    slot={slot}
                    onClose={setHide}
                    onSubmit={setHide}
                    data-testid="edit-custom-field-modal"
                />
            )}
        </>
    );
}
