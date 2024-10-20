import {ReportCreationFormValues, ReportPost} from "@dashdoc/web-common/src/types/reportsTypes";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Button, toast} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {getReportType} from "../filters/utils";

import {ReportCreationModal} from "./ReportCreationModal";

export type ReportCreationButtonProps = {
    onCreate: (report: ReportPost) => Promise<void>;
};
export const ReportCreationButton: FunctionComponent<ReportCreationButtonProps> = (props) => {
    const [isCreationModalOpen, openCreationModal, closeCreationModal] = useToggle();
    const [isCreatingReport, startReportCreation, stopReportCreation] = useToggle();

    const onCreate = async (reportValues: ReportCreationFormValues) => {
        const payload = {
            name: reportValues.name,
            type: getReportType(reportValues),
        };

        startReportCreation();
        try {
            // @ts-ignore
            await props.onCreate(payload);
            closeCreationModal();
        } catch (e) {
            Logger.error(e);
            toast.error(t("reports.errorMessages.unableToCreateReport"));
        } finally {
            stopReportCreation();
        }
    };

    return (
        <>
            <Button onClick={openCreationModal} data-testid="create-report-button">
                {t("reports.creationButtonText")}
            </Button>
            {isCreationModalOpen && (
                <ReportCreationModal
                    onCreate={onCreate}
                    isLoading={isCreatingReport}
                    onClose={closeCreationModal}
                />
            )}
        </>
    );
};
