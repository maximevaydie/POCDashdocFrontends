import {useDispatch} from "@dashdoc/web-common";
import {ExportMethod} from "@dashdoc/web-common/src/features/export/types";
import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useMemo} from "react";

import {ExportFileType, ExportModal} from "app/features/export/ExportModal";
import {fetchExportTruckers} from "app/redux/actions";
import {SearchQuery} from "app/redux/reducers/searches";
import {TruckersScreenQuery} from "app/screens/fleet/truckers/TruckersScreen";

type Props = {
    currentSelection: string[];
    currentQuery: TruckersScreenQuery;
    allTruckersSelected: boolean;
};

export function ExportTruckersButton({
    currentSelection,
    currentQuery,
    allTruckersSelected,
}: Props) {
    const [isTruckersExportModelOpen, openTruckersExportModal, closeTruckersExportModal] =
        useToggle();
    const dispatch = useDispatch();
    const selectedTruckersQuery: SearchQuery = useMemo(() => {
        if (allTruckersSelected) {
            return currentQuery;
        } else {
            return {id__in: currentSelection};
        }
    }, [allTruckersSelected, currentSelection, currentQuery]);

    return (
        <>
            <IconButton
                name="export"
                label={t("common.export")}
                key="exportFleetItems"
                onClick={openTruckersExportModal}
                ml={2}
                data-testid="truckers-screen-export-button"
            />
            {isTruckersExportModelOpen && (
                <ExportModal
                    allowedExportMethods={["download"]}
                    allowedFileTypes={["xlsx", "csv"]}
                    fileTypeLabel={t("truckersList.export.fileTypeLabel")}
                    objectsSelectedText={t("components.selectedTruckersCount", {
                        smart_count: currentSelection.length,
                    })}
                    onClose={closeTruckersExportModal}
                    dataType="truckers"
                    onExport={handleExportTruckers}
                />
            )}
        </>
    );
    function handleExportTruckers(
        fileType: ExportFileType,
        exportMethod: ExportMethod,
        email: string
    ) {
        dispatch(fetchExportTruckers(selectedTruckersQuery, fileType, exportMethod, email));
    }
}
