import {managerService, getConnectedManager} from "@dashdoc/web-common";
import {ResultValues} from "nuvo-react";
import React from "react";

import {fetchAddTrailer} from "app/redux/actions/trailers";
import {fetchAddVehicle} from "app/redux/actions/vehicles";
import {useDispatch, useSelector} from "app/redux/hooks";

import {NuvoDataImporterButton} from "../../common/nuvo-importer/NuvoDataImporterButton";
import {
    createEmptyReport,
    fleetModel,
    importAndFillReport,
    removeEmptyEntries,
    removeEmptyFieldInEntries,
} from "../../common/nuvo-importer/nuvoImporter.service";

import type {RootState} from "app/redux/reducers";

export const NuvoFleetImporter = ({onImportDone}: {onImportDone: () => void}) => {
    const dispatch = useDispatch();
    const hasEditAccess = useSelector((state: RootState) =>
        managerService.hasAtLeastUserRole(getConnectedManager(state))
    );
    if (!hasEditAccess) {
        return null;
    }
    return (
        <NuvoDataImporterButton
            importData={handleImportData}
            onImportDone={onImportDone}
            model={fleetModel}
            displayDateFormatPicker
        />
    );

    async function handleImportData(entries: ResultValues) {
        const purgedEntries = removeEmptyFieldInEntries(removeEmptyEntries(entries));
        const newReport = createEmptyReport(["common.vehicles", "settings.trailers"]);
        let lineNumber = 2; // first line is for header
        for (const entry of purgedEntries) {
            const equipmentType = entry?.equipment_type ?? "vehicle";
            if (equipmentType === "trailer") {
                await importAndFillReport(
                    newReport,
                    "settings.trailers",
                    async () => {
                        const response = await dispatch(fetchAddTrailer(entry));
                        if (response.error) {
                            throw response.error;
                        }
                    },
                    entry.license_plate as string,
                    lineNumber
                );
            } else {
                await importAndFillReport(
                    newReport,
                    "common.vehicles",
                    async () => {
                        const response = await dispatch(fetchAddVehicle(entry));
                        if (response.error) {
                            throw response.error;
                        }
                    },
                    entry.license_plate as string,
                    lineNumber
                );
            }
            lineNumber++;
        }

        return newReport;
    }
};
