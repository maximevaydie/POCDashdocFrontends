import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import isEqual from "lodash.isequal";
import omit from "lodash.omit";
import React, {FC, useState} from "react";

import {ExtendedZonePopover} from "app/features/pricing/tariff-grids/table/actions/components/ExtendedZonePopover";

import {TariffGrid, TariffGridZonesLineHeaders, TariffGridZone} from "../../types";

type CreateZoneActionProps = {
    dataTestId?: string;
    tariffGrid: TariffGrid<TariffGridZonesLineHeaders>;
    tariffGridZones: TariffGridZone[];
    onCreate: (zone: TariffGridZone) => unknown;
};

export const CreateZoneAction: FC<CreateZoneActionProps> = ({
    dataTestId,
    tariffGrid,
    tariffGridZones,
    onCreate,
}) => {
    const [isOpen, open, close] = useToggle();

    // This is used to eventually re-render the popover
    const [key, setKey] = useState(0);

    const handleOpenPopover = () => {
        setKey((key) => key + 1);
        open();
    };

    const buttonDataTestId = dataTestId ? `${dataTestId}-add-zone-button` : "add-zone-button";

    return (
        <ExtendedZonePopover
            key={key}
            isOpen={isOpen}
            onClose={close}
            onSubmit={onCreate}
            zone={null}
            tariffGridZones={tariffGridZones}
            getErrorMessage={(newZone) => {
                const newZoneWithoutId = omit(newZone, ["id"]);
                if (
                    tariffGridZones.some((zone) => {
                        const zoneWithoutId = omit(zone, ["id"]);
                        return isEqual(newZoneWithoutId, zoneWithoutId);
                    })
                ) {
                    return t("tariffGrids.zoneAlreadySelected");
                }
                return;
            }}
        >
            <Button
                variant={"plain"}
                data-testid={buttonDataTestId}
                alignContent={"left"}
                onClick={handleOpenPopover}
                flex={1}
            >
                {tariffGrid.is_origin_or_destination === "destination"
                    ? t("tariffGrid.AddAnOrigin")
                    : t("tariffGrid.AddADestination")}
            </Button>
        </ExtendedZonePopover>
    );
};
