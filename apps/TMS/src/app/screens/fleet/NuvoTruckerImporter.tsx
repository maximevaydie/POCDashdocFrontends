import {managerService, getConnectedManager} from "@dashdoc/web-common";
import {ResultValues} from "nuvo-react";
import React from "react";

import {fetchAddTrucker} from "app/redux/actions/truckers";
import {useDispatch, useSelector} from "app/redux/hooks";

import {NuvoDataImporterButton} from "../../common/nuvo-importer/NuvoDataImporterButton";
import {
    createEmptyReport,
    importAndFillReport,
    removeEmptyEntries,
    removeEmptyFieldInEntries,
    truckerModel,
} from "../../common/nuvo-importer/nuvoImporter.service";

import type {RootState} from "app/redux/reducers";

export const NuvoTruckerImporter = ({onImportDone}: {onImportDone: () => void}) => {
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
            model={truckerModel}
            displayDateFormatPicker
        />
    );

    async function handleImportData(entries: ResultValues) {
        const purgedEntries = removeEmptyFieldInEntries(removeEmptyEntries(entries));
        const newReport = createEmptyReport(["common.truckers"]);
        let lineNumber = 2; // first line is for header
        for (const entry of purgedEntries) {
            const {email, first_name, last_name, ...remainingValues} = entry;
            const payload = {
                user: {
                    email: email,
                    first_name: first_name,
                    last_name: last_name,
                },
                ...remainingValues,
            };
            await importAndFillReport(
                newReport,
                "common.truckers",
                async () => {
                    await dispatch(fetchAddTrucker(payload));
                },
                `${first_name} ${last_name}`,
                lineNumber
            );

            lineNumber++;
        }

        return newReport;
    }
};
