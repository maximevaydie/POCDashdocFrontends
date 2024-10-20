import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {
    exportService,
    FleetType,
} from "app/features/fleet/unavailabilities/export/exportUnavailabilities.service";
import {ExportUnavailabilityModal} from "app/features/fleet/unavailabilities/export/ExportUnavailabilityModal";

export const ExportUnavailabilityButton = ({type}: {type: FleetType}) => {
    const [isOpened, open, close] = useToggle();
    return (
        <>
            <Button variant="secondary" onClick={open} data-testid="export-unavailabilities">
                {t(exportService.getLabelKey(type))}
            </Button>
            {isOpened && <ExportUnavailabilityModal type={type} onClose={close} />}
        </>
    );
};
