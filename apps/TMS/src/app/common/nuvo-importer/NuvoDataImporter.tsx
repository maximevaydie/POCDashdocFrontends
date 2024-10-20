import {NuvoApiKey} from "@dashdoc/web-common";
import {ImportReport, ImportReportType} from "@dashdoc/web-ui";
import {OnEntryInit, ResultValues} from "nuvo-react";
import {NuvoImporter} from "nuvo-react/index";
import React from "react";

import {DateFormatPicker} from "../../features/fleet/DateFormatPicker";
import {useNuvoDateFormat} from "../../hooks/useNuvoDateFormat";

import {
    formatResultsDate,
    getNuvoStyle,
    getNuvoTranslations,
    translateModel,
} from "./nuvoImporter.service";
import {NuvoModel} from "./type";

type Props = {
    onImportDone: () => void;
    model: NuvoModel;
    importData: (data: ResultValues) => void;
    report: ImportReportType | undefined;
    displayDateFormatPicker?: boolean;
    onEntryInit?: OnEntryInit;
};

// this component is based on Nuvo which is a really heavy library.
// please import it lazily using `const NuvoFleetImporter = React.lazy(() => import('app/features/fleet/NuvoFleetImporter'));`
// eslint-disable-next-line import/no-default-export
export default function NuvoDataImporter({
    onImportDone,
    model,
    importData,
    report,
    displayDateFormatPicker,
    onEntryInit,
}: Props) {
    const {dateFormat, setDateFormat} = useNuvoDateFormat();
    const style = getNuvoStyle();
    return (
        <>
            {!report && (
                <>
                    {displayDateFormatPicker && (
                        <DateFormatPicker onPick={setDateFormat} value={dateFormat} />
                    )}
                    <NuvoImporter
                        licenseKey={NuvoApiKey}
                        settings={{
                            embedUploadArea: true,
                            developerMode: import.meta.env.MODE !== "prod",
                            identifier: "product_data",
                            columns: translateModel(model, dateFormat),
                            style: style,
                            i18nOverrides: getNuvoTranslations(),
                            automaticMapping: true,
                        }}
                        onResults={async (res, _, complete) => {
                            res = formatResultsDate(model, res, dateFormat);
                            await importData(res);
                            complete();
                            onImportDone();
                        }}
                        onEntryInit={onEntryInit}
                    />
                </>
            )}
            {report && <ImportReport {...report}></ImportReport>}
        </>
    );
}
