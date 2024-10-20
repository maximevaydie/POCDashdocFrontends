import {AnalyticsEvent, analyticsService, getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, ButtonProps, ClickableFlex, Flex, Icon, Popover, Text} from "@dashdoc/web-ui";
import React, {useState} from "react";
import {useHistory} from "react-router";

import {TariffGrid, TariffGridOwnerType} from "app/features/pricing/tariff-grids/types";
import {useSelector} from "app/redux/hooks";

import {CreationModal} from "./modals/CreationModal";

interface TariffGridCreateActionProps {
    ownerType?: TariffGridOwnerType;
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
    onModalOpen?: () => void;
    onModalClose?: () => void;
}

export function TariffGridCreateAction({
    ownerType,
    variant,
    size,
    onModalOpen,
    onModalClose,
}: TariffGridCreateActionProps) {
    const history = useHistory();
    const connectedCompany = useSelector(getConnectedCompany);

    const [modalOwnerType, setModalOwnerType] = useState<TariffGridOwnerType>(); // undefined = not open

    return (
        <>
            {ownerType ? (
                <Button
                    type="button"
                    variant={variant}
                    size={size}
                    data-testid="add-tariff-grid-button"
                    onClick={() => openModal(ownerType)}
                    pl={0}
                >
                    <Icon name="add" mr={3} />
                    {t("tariffGrids.AddATariffGrid")}
                </Button>
            ) : (
                <Popover>
                    <Popover.Trigger>
                        <Button
                            type="button"
                            variant={variant}
                            size={size}
                            data-testid="add-tariff-grid-button"
                        >
                            <Icon name="add" mr={3} color="white" />
                            {t("tariffGrids.AddATariffGrid")}
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content>
                        <TariffGridCreateOption
                            ownerType={TariffGridOwnerType.CARRIER}
                            onClick={() => openModal(TariffGridOwnerType.CARRIER)}
                        />
                        <Flex borderBottom={"1px solid"} borderColor="grey.light" width="100%" />
                        <TariffGridCreateOption
                            ownerType={TariffGridOwnerType.SHIPPER}
                            onClick={() => openModal(TariffGridOwnerType.SHIPPER)}
                        />
                    </Popover.Content>
                </Popover>
            )}

            {modalOwnerType && (
                <CreationModal
                    ownerType={modalOwnerType}
                    onClose={() => {
                        setModalOwnerType(undefined);
                        onModalClose?.();
                    }}
                    afterCreation={handlePostCreation}
                />
            )}
        </>
    );

    function openModal(ownerType: TariffGridOwnerType) {
        setModalOwnerType(ownerType);
        onModalOpen?.();
    }

    function handlePostCreation(tariffGrid: TariffGrid) {
        analyticsService.sendEvent(AnalyticsEvent.tariffGridCreated, {
            "company id": connectedCompany?.pk,
            "is variable": tariffGrid.pricing_policy === "multiply",
            "steps unit": tariffGrid.pricing_metric,
            "original uid of tariff grid": tariffGrid.uid,
            "load category": tariffGrid.load_category,
            "is distance range": tariffGrid.lines_type === "distance_range_in_km",
        });
        history.push(`/app/tariff-grids/${tariffGrid.uid}`);
    }
}

const TariffGridCreateOption = ({
    ownerType,
    onClick,
}: {
    ownerType: TariffGridOwnerType;
    onClick: () => void;
}) => (
    <ClickableFlex
        onClick={onClick}
        flexDirection={"column"}
        p={3}
        maxWidth={350}
        hoverStyle={{
            backgroundColor: "blue.ultralight",
            borderRadius: 1,
        }}
        data-testid={`tariff-grid-create-option-${ownerType.toLowerCase()}`}
    >
        <Flex alignItems={"center"} mb={1}>
            <Icon
                name={ownerType === TariffGridOwnerType.CARRIER ? "truck" : "cart"}
                scale={[-1.5, 1.5]}
                mr={4}
                mt={0.5}
            />
            <Text variant="h2">
                {t(
                    ownerType === TariffGridOwnerType.CARRIER
                        ? "tariffGrids.addTariffGridCarrierTitle"
                        : "tariffGrids.addTariffGridShipperTitle"
                )}
            </Text>
        </Flex>
        <Flex flexGrow={1} flexDirection={"column"} ml={6}>
            <Text variant="body">
                {t(
                    ownerType === TariffGridOwnerType.CARRIER
                        ? "tariffGrids.addTariffGridCarrierDescription"
                        : "tariffGrids.addTariffGridShipperDescription"
                )}
            </Text>
        </Flex>
    </ClickableFlex>
);
