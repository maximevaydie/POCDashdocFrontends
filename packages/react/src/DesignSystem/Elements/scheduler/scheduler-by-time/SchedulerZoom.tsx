import {t} from "@dashdoc/web-core";
import {
    Flex,
    IconButton,
    TooltipWrapper,
    useResourceOffset,
    Text,
    useDevice,
} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React, {useEffect, useState} from "react";

type Props = {
    zoom?: number;
    onZoomChange: (value: number) => void;
    scrollGridRef?: React.RefObject<HTMLDivElement>;
};
export const SCHEDULER_ZOOM_SCALE = [5, 15, 30, 60, 120, 180, 240, 360];

export function SchedulerZoom({zoom, onZoomChange, scrollGridRef}: Props) {
    const isMobileDevice = useDevice() === "mobile";
    const scaleIndex = getScaleIndex(zoom);
    const resourceOffset = useResourceOffset();
    const percentage =
        (SCHEDULER_ZOOM_SCALE.length - 1 - scaleIndex) / (SCHEDULER_ZOOM_SCALE.length - 1);
    const [scrollValues, setScrollValues] = useState<{
        scrollWidth: number;
        scrollLeft: number;
        halfClientWidth: number;
    } | null>(null);

    useEffect(() => {
        if (!scrollValues) {
            return;
        }
        // Adjust scroll keep centered position
        if (scrollGridRef?.current) {
            const zoomFactor =
                (scrollGridRef.current.scrollWidth - resourceOffset) /
                (scrollValues.scrollWidth - resourceOffset);
            scrollGridRef.current.scrollLeft =
                resourceOffset +
                zoomFactor *
                    (scrollValues.scrollLeft + scrollValues.halfClientWidth - resourceOffset) -
                scrollValues.halfClientWidth;
        }
        setScrollValues(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoom]);

    if (isMobileDevice) {
        return null;
    }
    return (
        <Flex>
            <TooltipWrapper
                content={
                    <Text variant="caption" width="250px">
                        {t("scheduler.zoomShortcutAdvise")}
                    </Text>
                }
            >
                <IconButton
                    name="zoomOut"
                    mr={3}
                    onClick={() => handleZoom(1)}
                    data-testid="zoom-out"
                />
            </TooltipWrapper>
            {formatNumber(percentage, {
                style: "percent",
            })}
            <TooltipWrapper
                content={
                    <Text variant="caption" width="250px">
                        {t("scheduler.zoomShortcutAdvise")}
                    </Text>
                }
            >
                <IconButton
                    mx={3}
                    name="zoomIn"
                    onClick={() => handleZoom(-1)}
                    data-testid="zoom-in"
                />
            </TooltipWrapper>
        </Flex>
    );

    function handleZoom(delta: number) {
        // Store scroll state before zoom
        setScrollValues({
            scrollWidth: scrollGridRef?.current?.scrollWidth ?? 1,
            scrollLeft: scrollGridRef?.current?.scrollLeft ?? 0,
            halfClientWidth: (scrollGridRef?.current?.clientWidth ?? 0) / 2,
        });

        // Update zoom
        onZoomChange(delta);
    }
}

function getScaleIndex(zoom?: number) {
    return SCHEDULER_ZOOM_SCALE.findIndex((scale) => scale === zoom);
}

export function getNextZoom(currentZoom?: number, delta: number = 1) {
    const scaleIndex = getScaleIndex(currentZoom);
    const newIndex = Math.max(Math.min(scaleIndex + delta, SCHEDULER_ZOOM_SCALE.length - 1), 0);
    return SCHEDULER_ZOOM_SCALE[newIndex];
}
