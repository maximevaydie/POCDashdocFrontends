import {t} from "@dashdoc/web-core";
import {Button, Flex, IconButton, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import isEqual from "lodash.isequal";
import omit from "lodash.omit";
import React, {FC, ReactElement} from "react";

import {ExtendedZonePopover} from "app/features/pricing/tariff-grids/table/actions/components/ExtendedZonePopover";
import {displayZone} from "app/features/pricing/tariff-grids/tariffGridZoneUtils";
import {TariffGrid, TariffGridZone} from "app/features/pricing/tariff-grids/types";

type OriginOrDestinationProps = {
    originOrDestination: TariffGridZone | null;
    isOriginOrDestination: TariffGrid["is_origin_or_destination"];
    onEditOriginOrDestination: (originOrDestination: TariffGridZone) => unknown;
};

export const OriginOrDestination: FC<OriginOrDestinationProps> = ({
    originOrDestination,
    isOriginOrDestination,
    onEditOriginOrDestination,
}) => {
    const [isEditable, makeEditable, makeNotEditable] = useToggle(false);

    const Popover: FC<{children: ReactElement}> = ({children}) => {
        return (
            <ExtendedZonePopover
                isOpen={isEditable}
                onClose={makeNotEditable}
                onSubmit={(zone) => {
                    const zoneWithoutId = omit(zone, ["id"]);
                    const selectedZoneWithoutId = omit(originOrDestination, ["id"]);
                    if (isEqual(zoneWithoutId, selectedZoneWithoutId)) {
                        makeNotEditable();
                        return;
                    }

                    onEditOriginOrDestination(zone);
                    makeNotEditable();
                }}
                zone={originOrDestination}
            >
                {children}
            </ExtendedZonePopover>
        );
    };

    if (originOrDestination === null) {
        return (
            <Flex alignItems={"center"} justifyContent={"center"}>
                <Popover>
                    <Button
                        variant={"plain"}
                        onClick={makeEditable}
                        data-testid={"landmark-button"}
                    >
                        {isOriginOrDestination === "origin"
                            ? t("tariffGrid.AddAnOrigin")
                            : t("tariffGrid.AddADestination")}
                    </Button>
                </Popover>
            </Flex>
        );
    }

    return (
        <>
            <Flex flexGrow={1}></Flex>
            <Flex alignItems={"center"} justifyContent={"center"}>
                <Text>{displayZone(originOrDestination)}</Text>
            </Flex>
            <Flex
                flexGrow={1}
                flexDirection={"row"}
                justifyContent={"right"}
                alignItems={"normal"}
            >
                <Popover>
                    <IconButton
                        data-testid="edit-landmark-button"
                        name="edit"
                        onClick={makeEditable}
                    />
                </Popover>
            </Flex>
        </>
    );
};
