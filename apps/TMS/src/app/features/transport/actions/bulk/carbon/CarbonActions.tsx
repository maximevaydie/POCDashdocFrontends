import {HasFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {MoreBulkAction} from "../MoreBulkAction";

import {BulkUpdateTransportCarbonFootprintModal} from "./BulkUpdateTransportCarbonFootprintModal";
import {BulkUpdateTransportOperationCategoryModal} from "./BulkUpdateTransportOperationCategoryModal";

import type {TransportsQueryParams} from "app/features/filters/deprecated/utils";

type Props = {
    onClose: () => void;
    selectedTransportsCount: number;
    selectedTransportsQuery: TransportsQueryParams | {uid__in: string[]};
};

export function CarbonActions({onClose, selectedTransportsCount, selectedTransportsQuery}: Props) {
    const [
        isBulkUpdateTransportCarbonFootprintModalOpen,
        openBulkUpdateTransportCarbonFootprintModal,
        closeBulkUpdateTransportCarbonFootprintModal,
    ] = useToggle();
    const [
        isBulkUpdateTransportOperationCategoryModalOpen,
        openBulkUpdateTransportOperationCategoryModal,
        closeBulkUpdateTransportOperationCategoryModal,
    ] = useToggle();

    return (
        <HasFeatureFlag flagName="carbonfootprintiso">
            <MoreBulkAction
                iconName="ecologyLeaf"
                label={t("bulkAction.updateTransportCarbonFootprint.title")}
                onClick={openBulkUpdateTransportCarbonFootprintModal}
                data-testid="bulk-update-transport-carbon-footprint-button"
            />
            {isBulkUpdateTransportCarbonFootprintModalOpen && (
                <BulkUpdateTransportCarbonFootprintModal
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    onClose={() => {
                        closeBulkUpdateTransportCarbonFootprintModal();
                        onClose();
                    }}
                />
            )}
            <MoreBulkAction
                separateBelow
                iconName="ecologyLeaf"
                label={t("bulkAction.updateTransportOperationCategory.title")}
                onClick={openBulkUpdateTransportOperationCategoryModal}
                data-testid="bulk-update-transport-operation-category-button"
            />
            {isBulkUpdateTransportOperationCategoryModalOpen && (
                <BulkUpdateTransportOperationCategoryModal
                    selectedTransportsQuery={selectedTransportsQuery}
                    selectedTransportsCount={selectedTransportsCount}
                    onClose={() => {
                        closeBulkUpdateTransportOperationCategoryModal();
                        onClose();
                    }}
                />
            )}
        </HasFeatureFlag>
    );
}
