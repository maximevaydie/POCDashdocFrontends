import {AnalyticsEvent, analyticsService, getConnectedCompany} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Button, ClickableFlex, Flex, Icon, Popover, Text} from "@dashdoc/web-ui";
import {
    FuelPriceIndex,
    FuelSurchargeAgreement,
    FuelSurchargeAgreementOwnerType,
} from "dashdoc-utils";
import {format} from "date-fns";
import React, {useState} from "react";

import {FuelSurchargeAgreementFormModal} from "app/features/pricing/fuel-surcharges/modals/FuelSurchargeAgreementFormModal";
import {
    AddFuelSurchargeAgreement,
    fetchAddFuelSurchargeAgreement,
} from "app/redux/actions/fuel-surcharge/fuel-surcharge-agreement";
import {useDispatch, useSelector} from "app/redux/hooks";

type Props = {
    onAfterCreation: (fuelSurchargeAgreement: FuelSurchargeAgreement) => void;
};

export const FuelSurchargeAgreementCreateActionDropdown: React.FC<Props> = ({onAfterCreation}) => {
    const dispatch = useDispatch();
    const connectedCompany = useSelector(getConnectedCompany);

    const [modalOwnerType, setModalOwnerType] = useState<FuelSurchargeAgreementOwnerType>(); // undefined = not open

    return (
        <>
            <Popover>
                <Popover.Trigger>
                    <Button type="button" data-testid="add-fuel-surcharge-agreement-button">
                        <Icon name="add" mr={3} color="white" />
                        {t("fuelSurcharges.createFuelSurchargeAgreement")}
                    </Button>
                </Popover.Trigger>
                <Popover.Content>
                    <CreateOption
                        ownerType={FuelSurchargeAgreementOwnerType.CARRIER}
                        onClick={() => handleCreate(FuelSurchargeAgreementOwnerType.CARRIER)}
                    />
                    <Flex borderBottom={"1px solid"} borderColor="grey.light" width="100%" />
                    <CreateOption
                        ownerType={FuelSurchargeAgreementOwnerType.SHIPPER}
                        onClick={() => handleCreate(FuelSurchargeAgreementOwnerType.SHIPPER)}
                    />
                </Popover.Content>
            </Popover>

            {modalOwnerType && (
                <FuelSurchargeAgreementFormModal
                    ownerType={modalOwnerType}
                    onSubmit={handleSubmit}
                    onClose={() => setModalOwnerType(undefined)}
                />
            )}
        </>
    );

    function handleCreate(ownerType: FuelSurchargeAgreementOwnerType) {
        setModalOwnerType(ownerType);

        analyticsService.sendEvent(AnalyticsEvent.fuelSurchargeCreation, {
            "company id": connectedCompany?.pk,
        });
    }

    async function handleSubmit(fuelSurchargeAgreement: FuelSurchargeAgreement) {
        const result = await onSubmitFuelSurchargeAgreementCreation(
            connectedCompany?.pk,
            dispatch,
            fuelSurchargeAgreement
        );
        if (result) {
            onAfterCreation(result);
            setModalOwnerType(undefined);
        }
    }
};

const CreateOption = ({
    ownerType,
    onClick,
}: {
    ownerType: FuelSurchargeAgreementOwnerType;
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
        data-testid={`fuel-surcharge-agreement-create-option-${ownerType.toLowerCase()}`}
    >
        <Flex alignItems={"center"} mb={1}>
            <Icon
                name={ownerType === FuelSurchargeAgreementOwnerType.CARRIER ? "truck" : "cart"}
                scale={[-1.5, 1.5]}
                mr={4}
                mt={0.5}
            />
            <Text variant="h2">
                {t(
                    ownerType === FuelSurchargeAgreementOwnerType.CARRIER
                        ? "components.addGasIndexCarrierTitle"
                        : "components.addGasIndexShipperTitle"
                )}
            </Text>
        </Flex>
        <Flex flexGrow={1} flexDirection={"column"} ml={6}>
            <Text variant="body">
                {t(
                    ownerType === FuelSurchargeAgreementOwnerType.CARRIER
                        ? "components.addGasIndexCarrierDescription"
                        : "components.addGasIndexShipperDescription"
                )}
            </Text>
        </Flex>
    </ClickableFlex>
);

export async function onSubmitFuelSurchargeAgreementCreation(
    companyPk: number | undefined | null,
    dispatch: ReturnType<typeof useDispatch>,
    fuelSurchargeAgreement: FuelSurchargeAgreement
): Promise<FuelSurchargeAgreement | null> {
    try {
        const payload: Partial<
            FuelSurchargeAgreement & {fuel_price_index_uid: FuelPriceIndex["uid"]}
        > = {
            ...fuelSurchargeAgreement,
            reference_date: format(fuelSurchargeAgreement.reference_date, "yyyy-MM-dd") as any,
            fuel_price_index_uid: fuelSurchargeAgreement.fuel_price_index.uid,
        };
        delete payload.fuel_price_index;
        const addFuelSurchargeAgreementRequest = dispatch(
            fetchAddFuelSurchargeAgreement(payload as AddFuelSurchargeAgreement)
        );
        const {fuel_surcharge_agreement} = await addFuelSurchargeAgreementRequest;
        sendEventOnFinalizedFuelSurchargeAgreementCreation(
            companyPk,
            fuel_surcharge_agreement.uid,
            fuel_surcharge_agreement.fuel_price_index.uid
        );
        return fuel_surcharge_agreement;
    } catch (e) {
        Logger.error("Failed to create a fuel surcharge agreement", e);
        return null;
    }
}

function sendEventOnFinalizedFuelSurchargeAgreementCreation(
    companyPk: number | undefined | null,
    fuelSurchargeAgreementId: FuelSurchargeAgreement["uid"],
    fuelPriceIndexId: FuelPriceIndex["uid"]
) {
    analyticsService.sendEvent(AnalyticsEvent.fuelSurchargeFinalizedCreation, {
        "company id": companyPk,
        "fuel surcharge id": fuelSurchargeAgreementId,
        "fuel surcharge index id": fuelPriceIndexId,
    });
}
