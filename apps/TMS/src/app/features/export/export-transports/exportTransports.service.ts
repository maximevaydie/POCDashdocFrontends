import {ExportMethod} from "@dashdoc/web-common/src/features/export/types";
import {t} from "@dashdoc/web-core";
import {RadioProps} from "@dashdoc/web-ui";

function getExportOptions() {
    const options: Record<ExportMethod, RadioProps> = {
        download: {label: t("common.download"), value: "download", name: "transportExportMethod"},
        email: {label: t("common.sendViaEmail"), value: "email", name: "transportExportMethod"},
    };

    return options;
}

export const exportTransportsService = {getExportOptions};
