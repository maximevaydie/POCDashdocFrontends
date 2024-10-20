import {t} from "@dashdoc/web-core";
import {Icon, Text} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import React from "react";

import {CustomExtension} from "./types";

export const CustomExtensionLatestRunResult = ({extension}: {extension: CustomExtension}) => {
    if (!extension.last_workflow_run_result) {
        return null;
    }

    if (!extension.last_workflow_run_result.successful) {
        return (
            <Text display="flex" alignItems="center">
                <Icon name="removeCircle" color="red.default" mr={1} />
                {t("settings.extensions.result.error", {
                    date: formatDate(extension.last_workflow_run_result.finished_at, "PPPp"),
                    message:
                        extension.last_workflow_run_result.exit_message ||
                        t("settings.extensions.result.error.noMessage"),
                })}
                .
            </Text>
        );
    }

    const transportImportedText = (() => {
        const transportCount = extension.last_workflow_run_result.metrics.transport_count_imported;
        if (transportCount <= 0) {
            return "";
        }
        return (
            ", " +
            t("settings.extensions.result.metric.importedTransports", {count: transportCount})
        );
    })();

    return (
        <Text display="flex" alignItems="center">
            <Icon name="checkCircle" color="green.dark" mr={1} />
            {t("settings.extensions.result.success", {
                date: formatDate(extension.last_workflow_run_result.finished_at, "PPPp"),
            })}
            {transportImportedText}.
        </Text>
    );
};
