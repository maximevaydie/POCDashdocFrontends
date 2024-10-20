import {t} from "@dashdoc/web-core";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {MoreBulkAction} from "app/features/transport/actions/bulk/MoreBulkAction";

import {DeleteConfirmationModal} from "./modals/DeleteConfirmationModal";

import type {LogisticPointSelection} from "app/features/address-book/logistic-points/types";

type Props = {
    selection: LogisticPointSelection;
    onDeleted: () => void;
};
export function DeleteBulkAction({selection, onDeleted}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();
    return (
        <>
            <MoreBulkAction
                iconName="bin"
                label={t("common.delete")}
                onClick={openModal}
                color={"red.dark"}
                data-testid="delete-button"
            />
            {isModalOpen && (
                <DeleteConfirmationModal
                    selection={selection}
                    onDeleted={onDeleted}
                    onClose={closeModal}
                />
            )}
        </>
    );
}
