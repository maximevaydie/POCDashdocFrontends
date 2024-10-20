import {t} from "@dashdoc/web-core";
import {BadgeList, Button, Popover} from "@dashdoc/web-ui";
import React from "react";

import {TariffGridRequestedVehicle} from "app/features/pricing/tariff-grids/types";

interface Props {
    requestedVehicles: TariffGridRequestedVehicle[];
}

export function ShowMoreRequestedVehiclesAction({requestedVehicles}: Props) {
    return (
        <>
            {requestedVehicles.length > 4 && (
                <Popover placement="top">
                    <Popover.Trigger>
                        {" "}
                        <Button mt={1} variant={"plain"}>
                            {t("tariffGrids.moreRequestedVehicles", {
                                smart_count: requestedVehicles.length - 5,
                            })}
                        </Button>
                    </Popover.Trigger>
                    <Popover.Content width="400px">
                        <BadgeList
                            isMultiLine={true}
                            values={requestedVehicles.map((vehicle) => vehicle.label)}
                        />
                    </Popover.Content>
                </Popover>
            )}
        </>
    );
}
