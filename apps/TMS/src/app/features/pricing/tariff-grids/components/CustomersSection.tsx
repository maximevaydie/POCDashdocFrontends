import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {BadgeList, Box, Button, Callout, Flex, Text} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {EditClientActionDeprecated} from "app/features/pricing/tariff-grids/actions/EditClientActionDeprecated";
import {EditCustomersModal} from "app/features/pricing/tariff-grids/modals/EditCustomersModal";

import {ShowMoreClientAction} from "../actions/ShowMoreClientAction";
import {TariffGrid, TariffGridOwnerType} from "../types";

interface Props {
    tariffGrid: TariffGrid;
    onChange: (newAllCustomers: boolean, newCustomers: {pk: number; name: string}[]) => unknown;
}

export function CustomersSection({tariffGrid, onChange}: Props) {
    const hasPurchaseTariffGridsEnabled = useFeatureFlag("purchaseTariffGrids");
    return (
        <Box data-testid="tariff-grid-customers-section">
            {hasPurchaseTariffGridsEnabled ? (
                <CustomersSectionNew tariffGrid={tariffGrid} onChange={onChange} />
            ) : (
                <CustomersSectionDeprecated tariffGrid={tariffGrid} onChange={onChange} />
            )}
        </Box>
    );
}

function CustomersSectionNew({
    tariffGrid,
    onChange,
}: {
    tariffGrid: TariffGrid;
    onChange: (newAllCustomers: boolean, newCustomers: {pk: number; name: string}[]) => unknown;
}) {
    const [isEditionModalOpen, setIsEditionModalOpen] = useState(false);

    const isPurchaseTariffGrid = tariffGrid.owner_type === TariffGridOwnerType.SHIPPER;

    return (
        <>
            <Flex flexDirection="column" p={3}>
                <Text variant="h1" mb={3}>
                    {t(isPurchaseTariffGrid ? "common.carriers" : "common.shippers")}
                </Text>
                {tariffGrid.is_all_customers ? (
                    <Box width="max-content" data-testid="tariff-grid-all-customers-callout">
                        <Text backgroundColor="purple.ultralight" color="purple.dark" p={1}>
                            {t(
                                isPurchaseTariffGrid
                                    ? "tariffGrids.appliedToAllCarriers"
                                    : "tariffGrids.appliedToAllShippers"
                            )}
                        </Text>
                    </Box>
                ) : tariffGrid.customers.length > 0 ? (
                    <BadgeList
                        isMultiLine={true}
                        values={tariffGrid.customers.map((client) => client.name).slice(0, 4)}
                        showMoreButton={<ShowMoreClientAction clients={tariffGrid.customers} />}
                        dataTestId="tariff-grid-customers-badges"
                    />
                ) : (
                    <Callout iconDisabled>
                        {t(
                            isPurchaseTariffGrid
                                ? "tariffGrids.noCarrierYet"
                                : "tariffGrids.noShipperYet"
                        )}
                    </Callout>
                )}

                <Flex>
                    <Button
                        mt={3}
                        variant={"plain"}
                        data-testid={"edit-customers-button"}
                        onClick={() => setIsEditionModalOpen(true)}
                    >
                        {t("tariffGrids.EditClients")}
                    </Button>
                </Flex>
            </Flex>

            {isEditionModalOpen && (
                <EditCustomersModal
                    tariffGrid={tariffGrid}
                    onChange={onChange}
                    onClose={() => setIsEditionModalOpen(false)}
                />
            )}
        </>
    );
}

function CustomersSectionDeprecated({
    tariffGrid,
    onChange,
}: {
    tariffGrid: TariffGrid;
    onChange: (newAllCustomers: boolean, newCustomers: {pk: number; name: string}[]) => unknown;
}) {
    const isPurchaseTariffGrid = tariffGrid.owner_type === TariffGridOwnerType.SHIPPER;

    return (
        <Flex flexDirection="column" p={3}>
            <Text variant="h1" mb={3}>
                {t(isPurchaseTariffGrid ? "common.carriers" : "common.shippers")}
            </Text>
            {tariffGrid.customers.length > 0 ? (
                <BadgeList
                    isMultiLine={true}
                    values={tariffGrid.customers.map((client) => client.name).slice(0, 4)}
                    showMoreButton={<ShowMoreClientAction clients={tariffGrid.customers} />}
                    dataTestId="tariff-grid-customers-badges"
                />
            ) : (
                <Callout iconDisabled>
                    {t(
                        isPurchaseTariffGrid
                            ? "tariffGrids.noCarrierYet"
                            : "tariffGrids.noShipperYet"
                    )}
                </Callout>
            )}

            <EditClientActionDeprecated
                tariffGrid={tariffGrid}
                onChange={(newCustomers) => onChange(false, newCustomers)}
            />
        </Flex>
    );
}
