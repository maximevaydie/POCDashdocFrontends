import {t} from "@dashdoc/web-core";
import {LoadingWheel, Modal} from "@dashdoc/web-ui";
import {ImportReportType} from "@dashdoc/web-ui";
import {OnEntryInit, ResultValues} from "nuvo-react";
import React, {Suspense, useState} from "react";

import {NuvoModel} from "./type";

const NuvoDataImporter = React.lazy(() => import("app/common/nuvo-importer/NuvoDataImporter"));

export const NuvoDataImporterModal = ({
    onImportDone,
    onClose,
    model,
    importData,
    displayDateFormatPicker,
    onEntryInit,
}: {
    onImportDone: () => void;
    onClose: () => void;
    model: NuvoModel;
    importData: (data: ResultValues) => Promise<ImportReportType>;
    displayDateFormatPicker?: boolean;
    onEntryInit?: OnEntryInit;
}) => {
    const [report, setReport] = useState<ImportReportType | undefined>(undefined);

    const close = () => {
        onClose();
        setReport(undefined);
    };
    return (
        <>
            <Modal
                title={t("transportsForm.uploadFile")}
                onClose={close}
                size={"large"}
                mainButton={{
                    onClick: close,
                    children: report ? t("common.close") : t("common.cancel"),
                }}
                preventClosingByMouseClick={true} // needed to avoid bad behaviors on Nuvo UI
            >
                <Suspense fallback={<LoadingWheel />}>
                    <NuvoDataImporter
                        onImportDone={() => {
                            onImportDone();
                        }}
                        model={model}
                        importData={async (data: ResultValues) =>
                            setReport(await importData(data))
                        }
                        report={report}
                        displayDateFormatPicker={displayDateFormatPicker}
                        onEntryInit={onEntryInit}
                    />
                </Suspense>
            </Modal>
        </>
    );
};
