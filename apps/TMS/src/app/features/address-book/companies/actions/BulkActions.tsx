import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {ExportAddressesModal} from "app/features/export/ExportAddressesModal";

type Props = {
    allSelected: boolean;
    allCount: number;
    currentSelection: Array<number | string>;
};
export function BulkActions({allSelected, allCount, currentSelection}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();
    return (
        <>
            <IconButton
                name="export"
                label={t("common.export")}
                onClick={openModal}
                data-testid="export-companies-addresses-button"
                ml={2}
            />
            {isModalOpen && (
                <ExportAddressesModal
                    entities="companies"
                    allEntitiesSelected={allSelected}
                    allEntitiesCount={allCount}
                    selectedEntities={currentSelection}
                    onClose={closeModal}
                    isShipperExport
                />
            )}
        </>
    );
}
