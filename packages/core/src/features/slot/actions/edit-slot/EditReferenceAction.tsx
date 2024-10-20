import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useSelector} from "redux/hooks";
import {isUpdating} from "redux/reducers/flow/slot.slice";

import {EditReferenceModal} from "./modals/EditReferenceModal";
type Props = {references: string[]; slotId: number};

export function EditReferenceAction({references, slotId}: Props) {
    const disabled = useSelector(isUpdating);
    const [show, setShow, setHide] = useToggle(false);
    return (
        <>
            <Button
                data-testid="edit-references-modal"
                variant="secondary"
                onClick={setShow}
                disabled={disabled}
                width="fit-content"
            >
                {t("common.edit")}
            </Button>
            {show && (
                <EditReferenceModal
                    title={t("components.updateReferenceListModalTitle")}
                    references={references}
                    slotId={slotId}
                    onClose={setHide}
                    onSubmit={setHide}
                    data-testid="edit-references-modal"
                />
            )}
        </>
    );
}
