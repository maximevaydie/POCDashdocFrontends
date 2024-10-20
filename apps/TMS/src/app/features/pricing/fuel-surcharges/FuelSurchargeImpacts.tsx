import {t} from "@dashdoc/web-core";
import {Flex, Text} from "@dashdoc/web-ui";
import {FuelSurchargeAgreement, FuelSurchargeItem, formatDate} from "dashdoc-utils";
import debounce from "lodash.debounce";
import React, {Fragment, useCallback, useEffect, useState} from "react";

import {FuelSurchargeImpact} from "app/features/pricing/fuel-surcharges/FuelSurchargeImpact";
import {UpdatedFuelPriceIndex} from "app/features/pricing/fuel-surcharges/modals/FuelPriceIndexesUpdateFormModal";
import {fetchPreviewUpdateFuelPriceIndex} from "app/redux/actions/fuel-surcharge/fuel-price-indexes";
import {useDispatch} from "app/redux/hooks";

export type FuelSurchargeImpactData = {
    fuel_surcharge_agreement: Pick<FuelSurchargeAgreement, "uid" | "name">;
    fuel_surcharge_item: Pick<FuelSurchargeItem, "start_date" | "computed_rate">;
};

type FuelSurchargeImpactsProps = {
    fuelPriceIndex: UpdatedFuelPriceIndex | null;
};

export const FuelSurchargeImpacts: React.FC<FuelSurchargeImpactsProps> = ({fuelPriceIndex}) => {
    const dispatch = useDispatch();
    const [fuelSurchargeImpacts, setFuelSurchargeImpacts] = useState<FuelSurchargeImpactData[]>(
        []
    );

    const fetchSurchargeImpacts = useCallback(
        debounce(async (currentFuelPriceIndex) => {
            const {uid, updated_price, application_date} = currentFuelPriceIndex;
            if (updated_price && application_date) {
                const fetchPreviewUpdatePriceIndexRequest = dispatch(
                    fetchPreviewUpdateFuelPriceIndex({
                        uid,
                        updated_price: updated_price as number,
                        application_date: formatDate(application_date as Date, "yyyy-MM-dd"),
                    })
                );
                const {response} = await fetchPreviewUpdatePriceIndexRequest;
                setFuelSurchargeImpacts(response);
            } else {
                setFuelSurchargeImpacts([]);
            }
        }, 500),
        []
    );

    useEffect(() => {
        if (fuelPriceIndex) {
            fetchSurchargeImpacts(fuelPriceIndex);
        }
        return () => {
            setFuelSurchargeImpacts([]);
        };
    }, [
        fuelPriceIndex,
        fuelPriceIndex?.updated_price,
        fuelPriceIndex?.application_date,
        fetchSurchargeImpacts,
    ]);

    return (
        <Flex
            maxHeight="40em"
            bg="grey.light"
            p="2"
            width="100%"
            borderRadius="2"
            border="1px solid"
            borderColor="grey.light"
            boxShadow="small"
            flexDirection="column"
        >
            <Fragment>
                <Text variant="h1" color="grey.dark">
                    {t("fuelSurcharges.impacts")}
                    {fuelPriceIndex && (
                        <span>
                            {t("common.colon")}
                            {fuelPriceIndex.name}
                        </span>
                    )}
                </Text>
                <Flex
                    flexDirection="column"
                    style={{rowGap: "12px"}}
                    overflowY="scroll"
                    mx="1"
                    my="2"
                >
                    {fuelSurchargeImpacts.map((item, index) => {
                        return <FuelSurchargeImpact key={index} fuelSurchargeImpact={item} />;
                    })}
                </Flex>
            </Fragment>
        </Flex>
    );
};
