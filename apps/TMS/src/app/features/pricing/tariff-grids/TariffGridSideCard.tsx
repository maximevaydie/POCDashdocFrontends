import {Card, Flex} from "@dashdoc/web-ui";
import {InvoiceItem} from "dashdoc-utils";
import React, {FC} from "react";

import {CustomersSection} from "app/features/pricing/tariff-grids/components/CustomersSection";
import {DirectionSection} from "app/features/pricing/tariff-grids/components/direction-section";
import {InvoiceItemSection} from "app/features/pricing/tariff-grids/components/InvoiceItemSection";
import {RequestedVehiclesSection} from "app/features/pricing/tariff-grids/components/RequestedVehiclesSection";
import {TariffGridVersionsCard} from "app/features/pricing/tariff-grids/components/tariff-grid-versions-card";
import {tariffGridService} from "app/features/pricing/tariff-grids/tariffGrid.service";
import {
    TariffGrid,
    TariffGridOwnerType,
    TariffGridRequestedVehicle,
    TariffGridVersion,
} from "app/features/pricing/tariff-grids/types";

export type TariffGridSideContentProps = {
    tariffGrid: TariffGrid;
    hasUnsavedChanges: boolean;
    mandatoryInvoiceItem: boolean;
    onChange: (newTariffGrid: TariffGrid) => void;
    openEditTariffGridVersionModal: (tariffGridVersion: TariffGridVersion) => unknown;
    openCreateTariffGridVersionModal: () => unknown;
    openDirectionModal: () => unknown;
};

export const TariffGridSideContent: FC<TariffGridSideContentProps> = ({
    tariffGrid,
    hasUnsavedChanges,
    mandatoryInvoiceItem,
    onChange,
    openEditTariffGridVersionModal,
    openCreateTariffGridVersionModal,
    openDirectionModal,
}) => {
    const isPurchaseTariffGrid = tariffGrid.owner_type === TariffGridOwnerType.SHIPPER;

    return (
        <Flex flex="1 1 0" flexDirection="column" ml={4} overflow="auto">
            <Card overflow="display">
                <DirectionSection
                    originOrDestination={tariffGrid.origin_or_destination}
                    isOriginOrDestination={tariffGrid.is_origin_or_destination}
                    onClick={openDirectionModal}
                />

                {!isPurchaseTariffGrid && (
                    <InvoiceItemSection
                        tariffGrid={tariffGrid}
                        mandatoryInvoiceItem={mandatoryInvoiceItem}
                        onChange={(product: InvoiceItem | null) =>
                            onChange(tariffGridService.editProduct(tariffGrid, product))
                        }
                    />
                )}
                <CustomersSection
                    tariffGrid={tariffGrid}
                    onChange={(newAllCustomers, newCustomers) =>
                        onChange(
                            tariffGridService.editClients(
                                tariffGrid,
                                newAllCustomers,
                                newCustomers
                            )
                        )
                    }
                />
            </Card>

            {isPurchaseTariffGrid && (
                <Card mt={3} overflow="display">
                    <RequestedVehiclesSection
                        tariffGrid={tariffGrid}
                        onChange={(vehicles: TariffGridRequestedVehicle[]) =>
                            onChange(tariffGridService.editRequestedVehicles(tariffGrid, vehicles))
                        }
                    />
                </Card>
            )}

            <TariffGridVersionsCard
                currentTariffGridVersion={tariffGrid.current_version}
                tariffGridVersions={tariffGrid.future_versions}
                hasUnsavedChanges={hasUnsavedChanges}
                openEditTariffGridVersionModal={openEditTariffGridVersionModal}
                openCreateTariffGridVersionModal={openCreateTariffGridVersionModal}
            />
        </Flex>
    );
};
