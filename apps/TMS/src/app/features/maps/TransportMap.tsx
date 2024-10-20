import {ErrorBoundary, getConnectedCompany, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, MapOverlay, Modal} from "@dashdoc/web-ui";
import {LastTruckPositionTrace, Trace} from "dashdoc-utils";
import React, {useEffect, useState} from "react";

import {ActivityMap} from "app/features/maps/ActivityMap";
import {getLastTruckPosition, getTraces} from "app/features/maps/maps.service";
import {MapLegend} from "app/features/transport/transport-map/components/MapLegend";
import {transportMapService} from "app/features/transport/transport-map/transportMap.service";
import {useSelector} from "app/redux/hooks";

import type {Activity, Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    activities: Activity[];
};

export function TransportMap(props: Props) {
    /**
     * When a map is created too fast (before the modal container div is
     * actually rendered) the map size is wrong. In order to fix that issue
     * we wait that the modal is shown to load the map.
     *
     * Issue explained here:
     * - https://stackoverflow.com/q/54663919/2320342
     * - https://stackoverflow.com/a/20402399/2320342
     */
    const [bigMapModalReady, setBigMapModalReady] = useState(false);
    const [bigMapModalOpen, setBigMapModalOpen] = useState(false);
    const [lastTruckPosition, setLastTruckPosition] = useState<LastTruckPositionTrace | null>(
        null
    );
    const [traces, setTraces] = useState<Trace[]>([]);
    const [cursorOverMiniMap, setCursorOverMiniMap] = useState(false);
    const connectedCompany = useSelector(getConnectedCompany);
    const timezone = useTimezone();

    useEffect(() => {
        const getLastTruckPositionAndSetIt = async () => {
            setLastTruckPosition(
                await getLastTruckPosition(props.transport, connectedCompany?.pk)
            );
        };

        getLastTruckPositionAndSetIt();
    }, []);

    useEffect(() => {
        const getTracesAndSetIt = async () => {
            setTraces(await getTraces(props.transport, connectedCompany?.pk));
        };

        if (bigMapModalOpen && traces.length == 0) {
            getTracesAndSetIt();
        }
    }, [bigMapModalOpen]);

    const positions = transportMapService.getPositions(
        props.activities,
        timezone,
        lastTruckPosition,
        traces,
        props.transport
    );

    const filteredPositions = transportMapService.filterPositions(positions);

    return (
        <ErrorBoundary>
            <Box height="100%" width="100%" position="relative">
                <ActivityMap positions={filteredPositions} />
                <MapOverlay
                    cursorOverMiniMap={cursorOverMiniMap}
                    onMouseOver={() => setCursorOverMiniMap(true)}
                    onMouseOut={() => setCursorOverMiniMap(false)}
                    onClick={() => setBigMapModalOpen(true)}
                />
            </Box>

            {bigMapModalOpen && (
                <Modal
                    title={t("common.map")}
                    onClose={() => {
                        setBigMapModalOpen(false);
                        setBigMapModalReady(false);
                    }}
                    id="map-modal"
                    onShown={() => setBigMapModalReady(true)}
                    size="xlarge"
                    mainButton={null}
                    secondaryButton={null}
                >
                    <Flex>
                        <Box flexBasis="70%" height="70vh">
                            {bigMapModalReady && <ActivityMap positions={positions} />}
                        </Box>
                        <Box flexBasis="30%" height="70vh" overflow="auto">
                            <MapLegend activities={props.activities} />
                        </Box>
                    </Flex>
                </Modal>
            )}
        </ErrorBoundary>
    );
}
