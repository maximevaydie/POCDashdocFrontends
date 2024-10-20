import {apiService, WASTE_ROOT_PATH} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Callout, Card, Flex, Icon, Text} from "@dashdoc/web-ui";
import React, {useEffect, useState} from "react";

import {TransportWasteShipment} from "app/types/transport";

type Props = {
    transportUid: string;
    wasteManagementEnabled: boolean;
};

export function TransportWasteLinkBanner({transportUid, wasteManagementEnabled}: Props) {
    const [wasteShipment, setWasteShipment] = useState<TransportWasteShipment | null>(null);

    useEffect(() => {
        const init = async () => {
            if (wasteManagementEnabled) {
                try {
                    const wasteShipment = await apiService.get(
                        `/waste-shipments/by-transport/${transportUid}/`,
                        {apiVersion: "web"}
                    );
                    setWasteShipment(wasteShipment);
                } catch (error) {
                    Logger.log(
                        `Transport ${transportUid} has no waste shipment : ${JSON.stringify(error)}`
                    );
                }
            }
        };
        init();
    }, [transportUid, wasteManagementEnabled]);

    if (!wasteShipment) {
        return null;
    }
    return (
        <Card my={3}>
            <Callout variant="secondary" iconDisabled borderRadius={0}>
                <Flex alignItems="baseline">
                    <Icon name="link" mr={2} />
                    <Text display="inline">
                        {t("transport.wasteLinkBanner.text")}{" "}
                        <a
                            href={`${WASTE_ROOT_PATH}/forms/${wasteShipment.uid}/`}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            {wasteShipment.name}
                        </a>
                    </Text>
                </Flex>
            </Callout>

            <Callout variant="warning" borderRadius={0}>
                <Text>{t("waste.transportLink.warningSync")} </Text>
            </Callout>
        </Card>
    );
}
