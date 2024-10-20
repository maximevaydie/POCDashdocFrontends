import {TimezoneContext} from "@dashdoc/web-core";
import {Box, DropEvent, Droppable, Text} from "@dashdoc/web-ui";
import {formatDate, zoneDateToISO} from "dashdoc-utils";
import React, {useCallback, useContext} from "react";

import {TIME_CELL_WIDTH} from "../../gridStyles";
import {SchedulerDndContext} from "../../SchedulerDndContext";

export function Dropzone({
    startDate,
    minuteScale,
    resourceUid,
    isFirstRow,
}: {
    startDate: Date;
    minuteScale: number; // scale in minutes
    resourceUid: string;
    isFirstRow: boolean;
}) {
    const timezone = useContext(TimezoneContext);

    const {kind, acceptedTypes, isDroppable, onDrop} = useContext(SchedulerDndContext);

    // if minute scale divided by 2 is not a rounded number of minutes, keep 1 dropzone per cell otherwise 2 dropzones per cell
    const DROP_CELL_WIDTH = minuteScale % 2 === 1 ? TIME_CELL_WIDTH : TIME_CELL_WIDTH / 2;

    const getStepWidth = useCallback(
        (width: number) => {
            return Math.round(width / DROP_CELL_WIDTH) * DROP_CELL_WIDTH;
        },
        [DROP_CELL_WIDTH]
    );

    const getWidthInMinutes = useCallback(
        (width: number) => {
            const deltaMinutes = (minuteScale / TIME_CELL_WIDTH) * width;
            return deltaMinutes;
        },
        [minuteScale]
    );

    const handleDrop = useCallback(
        (drop: DropEvent) => {
            const deltaMinutes = getWidthInMinutes(getStepWidth(drop.target.position?.x ?? 0));
            const newDate = new Date(startDate);
            newDate.setMinutes(newDate.getMinutes() + deltaMinutes);
            drop.target.payload = {...drop.target.payload, day: zoneDateToISO(newDate, timezone)};
            onDrop(drop);
        },
        [getWidthInMinutes, getStepWidth, onDrop, startDate, timezone]
    );

    const getWhenDragOver = useCallback(
        (position: {x: number; y: number} | null) => {
            if (!position) {
                return null;
            }
            const left = getStepWidth(position.x);
            const deltaMinutes = getWidthInMinutes(left);
            const newDate = new Date(startDate);
            newDate.setMinutes(newDate.getMinutes() + deltaMinutes);

            return (
                <Box backgroundColor="blue.ultralight" height="100%" opacity={0.8}>
                    <Box
                        backgroundColor="blue.light"
                        width={`${DROP_CELL_WIDTH}px`}
                        position="absolute"
                        left={`${left}px`}
                        top={0}
                        bottom={0}
                    />
                    <Box
                        position="absolute"
                        left={`${left}px`}
                        top={isFirstRow ? 0 : undefined}
                        bottom={isFirstRow ? undefined : "100%"}
                        p={1}
                        border={"1px solid"}
                        borderColor="grey.light"
                        borderRadius={1}
                        backgroundColor="grey.white"
                    >
                        <Text variant="subcaption">{formatDate(newDate, "p")}</Text>
                    </Box>
                </Box>
            );
        },
        [getStepWidth, getWidthInMinutes, startDate, DROP_CELL_WIDTH, isFirstRow]
    );

    return (
        <Droppable
            onDrop={handleDrop}
            kind={kind}
            acceptedType={acceptedTypes}
            payload={{
                resourceUid,
            }}
            id={`${resourceUid}`}
            isDroppable={isDroppable}
            whenDragOver={getWhenDragOver}
            computeDropPosition
        />
    );
}
