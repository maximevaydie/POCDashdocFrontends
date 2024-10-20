import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {Trucker} from "dashdoc-utils";
import React from "react";
import {useHistory} from "react-router";

import {fetchDeleteTrucker} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

type DeleteTruckerButton = {
    trucker: Trucker;
    onTruckerDelete?: () => void;
    onConfirmationClose: () => void;
};
export const DeleteTruckerButton = ({
    trucker,
    onTruckerDelete,
    onConfirmationClose,
}: DeleteTruckerButton) => {
    const dispatch = useDispatch();
    const history = useHistory();

    const handleDeleteTrucker = async () => {
        await dispatch(fetchDeleteTrucker(trucker.pk));
        onTruckerDelete?.();
        history.push("/app/fleet/truckers/");
    };

    return (
        <Button
            key="delete-trucker-button"
            data-testid="delete-trucker-button"
            onClick={handleDeleteTrucker}
            withConfirmation
            confirmationMessage={t("components.confirmDeleteTrucker")}
            modalProps={{
                title: t("components.deleteTrucker"),
                mainButton: {
                    children: t("common.delete"),
                },
                secondaryButton: {
                    onClick: onConfirmationClose,
                },
                onClose: onConfirmationClose,
            }}
            variant="plain"
            severity="danger"
        >
            {t("components.deleteTheTrucker")}
        </Button>
    );
};
