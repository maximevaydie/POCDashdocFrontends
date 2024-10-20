import {getConnectedCompany, useSelector} from "@dashdoc/web-common";
import React, {createContext, useContext, useMemo, useState} from "react";

import {TransportOperationCategoryOption} from "app/features/carbon-footprint/transport-operation-category/TransportOperationCategorySelect";
import {useCompaniesInGroupViews} from "app/hooks/useCompaniesInGroupViews";
import {transportRightService} from "app/services/transport/transportRight.service";
import {Transport} from "app/types/transport";

interface CarbonFootprintContextType {
    canEditTransportOperationCategory: boolean;
    transportOperationCategory?: TransportOperationCategoryOption;
    onChangeTransportOperationCategory: (category: TransportOperationCategoryOption) => void;
    refreshCarbonFootprint?: (params?: {
        distance?: number | null;
        transportOperationCategory?: Transport["transport_operation_category"];
    }) => void;
}

const CarbonFootprintContext = createContext<CarbonFootprintContextType | undefined>(undefined);

export const useCarbonFootprintContext = () => {
    const context = useContext(CarbonFootprintContext);
    if (!context) {
        throw new Error("useCarbonFootprintContext must be used within a CarbonFootprintProvider");
    }
    return context;
};

interface CarbonFootprintProviderProps {
    children: React.ReactNode;
    transport: Transport;
    refreshCarbonFootprint?: (params?: {
        transportOperationCategory: TransportOperationCategoryOption;
    }) => void;
}

export const CarbonFootprintProvider: React.FC<CarbonFootprintProviderProps> = ({
    children,
    transport,
    refreshCarbonFootprint,
}) => {
    const initialTransportOperationCategory = useMemo(() => {
        if (transport.transport_operation_category?.uid) {
            return {
                name: transport.transport_operation_category.name,
                uid: transport.transport_operation_category.uid,
            };
        }
        return undefined;
    }, [transport]);

    const [transportOperationCategory, setTransportOperationCategory] = useState<
        TransportOperationCategoryOption | undefined
    >(initialTransportOperationCategory);

    const connectedCompany = useSelector(getConnectedCompany);
    const companiesInGroupViews = useCompaniesInGroupViews();
    const canEditTransportOperationCategory =
        transportRightService.canEditTransportOperationCategory(
            transport,
            connectedCompany?.pk,
            companiesInGroupViews
        );

    const onChangeTransportOperationCategory = (category: TransportOperationCategoryOption) => {
        setTransportOperationCategory(category);
    };

    return (
        <CarbonFootprintContext.Provider
            value={{
                canEditTransportOperationCategory,
                transportOperationCategory,
                onChangeTransportOperationCategory,
                refreshCarbonFootprint,
            }}
        >
            {children}
        </CarbonFootprintContext.Provider>
    );
};
