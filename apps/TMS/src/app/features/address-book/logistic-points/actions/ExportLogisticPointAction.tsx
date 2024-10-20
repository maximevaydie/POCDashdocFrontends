import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {ExportAddressesModal} from "app/features/export/ExportAddressesModal";

import type {LogisticPointSelection} from "app/features/address-book/logistic-points/types";

type Props = {
    selection: LogisticPointSelection;
    onActionFinished: (option?: {unselect: true}) => void;
};

export function ExportLogisticPointAction({selection}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();
    const allSelected = !("pk__in" in selection);
    const selectedEntities: number[] = "pk__in" in selection ? (selection.pk__in as number[]) : [];

    return (
        <>
            <IconButton
                name="export"
                label={t("common.export")}
                onClick={openModal}
                data-testid="export-addresses-button"
                ml={2}
            />
            {isModalOpen && (
                <ExportAddressesModal
                    entities="addresses"
                    allEntitiesSelected={allSelected}
                    allEntitiesCount={selection.allCount}
                    selectedEntities={selectedEntities}
                    onClose={closeModal}
                />
            )}
        </>
    );
}
