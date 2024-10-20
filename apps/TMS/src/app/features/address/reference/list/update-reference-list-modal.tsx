import {t} from "@dashdoc/web-core";
import {Modal} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {fetchUpdateSite} from "app/redux/actions/sites";
import {fetchSetCarrierReference, fetchSetShipperReference} from "app/redux/actions/transports";
import {useDispatch} from "app/redux/hooks";

import {UpdateReferenceList} from "./update-reference-list";

type Props = {
    transportUid?: string;
    siteUid?: string;
    onClose: () => void;
    referenceType: "carrier" | "shipper" | "origin" | "destination" | "invoice";
    initialReference: string;
};

export function UpdateReferenceListModal({
    transportUid,
    siteUid,
    onClose,
    referenceType,
    initialReference,
}: Props) {
    const [reference, setReference] = useState(initialReference);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleSubmit = (event: React.FormEvent) => {
        setLoading(true);
        let action: Promise<any> = Promise.resolve();
        switch (referenceType) {
            case "carrier":
                // @ts-ignore
                action = dispatch(fetchSetCarrierReference(transportUid, reference));
                break;
            case "shipper":
                // @ts-ignore
                action = dispatch(fetchSetShipperReference(transportUid, reference));
                break;
            case "origin":
            case "destination":
                action = dispatch(
                    // @ts-ignore
                    fetchUpdateSite(siteUid, {
                        uid: siteUid,
                        reference,
                    })
                );
                break;
            default:
                break;
        }

        action.then(() => {
            setLoading(false);
            onClose();
        });

        event.preventDefault();
    };

    return (
        <Modal
            title={t("components.updateReferenceListModalTitle")}
            onClose={onClose}
            mainButton={{onClick: handleSubmit, disabled: loading, autoFocus: false}}
            secondaryButton={{disabled: loading}}
            id="update-reference-modal"
        >
            <UpdateReferenceList
                autoFocus
                reference={reference}
                onChange={(newReference) => setReference(newReference)}
                data-testid="input-reference"
            />
        </Modal>
    );
}
