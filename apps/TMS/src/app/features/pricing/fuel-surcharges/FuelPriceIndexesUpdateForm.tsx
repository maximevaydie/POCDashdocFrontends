import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {Logger} from "@dashdoc/web-core";
import {FuelPriceIndex} from "dashdoc-utils";
import React, {useState} from "react";

import {FuelPriceIndexesUpdateFormModal} from "app/features/pricing/fuel-surcharges/modals/FuelPriceIndexesUpdateFormModal";
import {
    fetchBulkUpdateFuelPriceIndexes,
    BulkUpdateFuelPriceIndex,
} from "app/redux/actions/fuel-surcharge/fuel-price-indexes";
import {useDispatch} from "app/redux/hooks";

type FuelPriceIndexesUpdateFormProps = {
    onUpdateSuccess: () => void;
    onClose: () => void;
};

export const FuelPriceIndexesUpdateForm: React.FC<FuelPriceIndexesUpdateFormProps> = ({
    onUpdateSuccess,
    onClose,
}) => {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onUpdateFuelPriceIndexes = async (fuelPriceIndexes: BulkUpdateFuelPriceIndex[]) => {
        try {
            setIsSubmitting(true);
            const updateFuelPriceIndexesRequest = dispatch(
                fetchBulkUpdateFuelPriceIndexes(fuelPriceIndexes)
            );
            await updateFuelPriceIndexesRequest;
            onUpdateSuccess();
            onClose();
        } catch (e) {
            Logger.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };
    const {
        items: fuelPriceIndexes = [],
        hasNext: hasNextPage,
        loadNext: loadNextPage,
        isLoading,
    } = usePaginatedFetch<FuelPriceIndex>("fuel-price-indexes/", {});

    return (
        <FuelPriceIndexesUpdateFormModal
            fuelPriceIndexes={fuelPriceIndexes}
            hasNextPage={hasNextPage}
            loadNextPage={loadNextPage}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            onSubmit={onUpdateFuelPriceIndexes}
            onClose={onClose}
        />
    );
};
