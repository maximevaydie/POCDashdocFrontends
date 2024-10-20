import {
    SCHEDULER_ZOOM_SCALE,
    getNextZoom,
} from "@dashdoc/web-ui/src/scheduler/scheduler-by-time/SchedulerZoom";
import {useCallback, useEffect, useState} from "react";

import {predefinedZoomLevelState} from "app/features/scheduler/carrier-scheduler/hooks/predefinedZoomLevelState";

export function useDateZoom() {
    const [predefinedZoom, setPredefinedZoom] = predefinedZoomLevelState<number>(
        SCHEDULER_ZOOM_SCALE[2]
    );
    const [zoom, setZoom] = useState<number>(predefinedZoom);
    useEffect(() => {
        setPredefinedZoom(zoom);
    }, [setPredefinedZoom, zoom]);
    const handleDateZoom = useCallback(
        (delta: number) => {
            setZoom((prev) => getNextZoom(prev, delta));
        },
        [setZoom]
    );
    return {zoom, handleDateZoom};
}
