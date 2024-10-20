import {getConnectedManager, managerService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import {ImportReportType} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import {OnEntryInit, ResultValues} from "nuvo-react";
import React from "react";
import {useSelector} from "react-redux";

import {NuvoDataImporterModal} from "app/common/nuvo-importer/NuvoDataImporterModal";

import {NuvoModel} from "./type";

type NuvoDataImporterButtonProps = {
    onImportDone: () => void;
    model: NuvoModel;
    importData: (data: ResultValues) => Promise<ImportReportType>;
    displayDateFormatPicker?: boolean;
    onEntryInit?: OnEntryInit;
};

export const NuvoDataImporterButton = (props: NuvoDataImporterButtonProps) => {
    const manager = useSelector(getConnectedManager);

    const canImport =
        managerService.isDashdocStaff(manager) || import.meta.env.MODE === "training";
    const [isImporterModalOpen, openImporterModal, closeImporterModal] = useToggle();

    const close = () => {
        closeImporterModal();
    };
    return (
        <>
            {canImport && (
                <Button
                    key="importDataButton"
                    ml={2}
                    variant="secondary"
                    onClick={openImporterModal}
                >
                    <Icon mr={2} name="cloudUpload" /> {t("transportsForm.uploadFile")}
                </Button>
            )}

            {isImporterModalOpen && (
                <NuvoDataImporterModal
                    onClose={close}
                    onImportDone={props.onImportDone}
                    displayDateFormatPicker={props.displayDateFormatPicker}
                    onEntryInit={props.onEntryInit}
                    model={props.model}
                    importData={props.importData}
                />
            )}
        </>
    );
};
