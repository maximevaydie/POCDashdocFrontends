import {apiService, urlService} from "@dashdoc/web-common";
import {queryService, t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import {TemplateMinimalInfo} from "dashdoc-utils";
import sortBy from "lodash.sortby";
import React, {useEffect, useState} from "react";

import {PickerWrapper} from "../PickerWrapper";

import TemplatePicker from "./TemplatePicker";

type Props = {
    shipperPk: number | undefined;
    shipperAddressPk: number | undefined;
    shipperName: string | undefined;
    isShortcutDisabled: boolean;
    isComplexMode: boolean;
};
export function TemplatePickerWrapper({
    shipperPk,
    shipperAddressPk,
    shipperName,
    isShortcutDisabled,
    isComplexMode,
}: Props) {
    const [transportTemplates, setTransportTemplates] = useState<TemplateMinimalInfo[] | null>(
        null
    );

    const loadTemplates = () => {
        if (shipperPk) {
            apiService.Companies.getTransportTemplates(shipperPk).then(
                (transportTemplates: TemplateMinimalInfo[]) => {
                    setTransportTemplates(sortBy(transportTemplates, ["template_name"]));
                }
            );
        }
    };

    useEffect(loadTemplates, [shipperPk]);

    if (!shipperPk || !shipperAddressPk) {
        return null;
    }

    const handleCreateTransportTemplate = () => {
        let url = urlService.getBaseUrl() + "/app/transport-templates/new/";
        const params: {
            shipperPk: number;
            shipperAddressPk: number;
            complex?: boolean;
        } = {
            shipperPk,
            shipperAddressPk,
        };
        if (isComplexMode) {
            params.complex = isComplexMode;
        }
        if (params) {
            url = `${url}?${queryService.toQueryString(params)}`;
        }

        window.open(url);
    };
    return (
        <Box data-testid="transport-form-template-message">
            <PickerWrapper
                itemsCount={transportTemplates ? transportTemplates.length : -1}
                itemPicker={
                    <TemplatePicker
                        transportTemplates={transportTemplates}
                        openEditionInNewTab={true}
                        loadTemplates={loadTemplates}
                        autoFocusSearchField={true}
                    />
                }
                createItem={handleCreateTransportTemplate}
                labels={{
                    tooltipIndication: {
                        create: t("transportForm.createTemplatesIndication"),
                        use: t("transportForm.useTemplatesIndication"),
                    },
                    panelLabels: {
                        createExplanations: {
                            icon: "instructions",
                            intro: t("transportForm.templatesExplanationsIntro"),
                            steps: [
                                t("transportForm.templatesExplanationsStep1"),
                                t("transportForm.templatesExplanationsStep2"),
                                t("transportForm.templatesExplanationsStep3"),
                            ],
                            conclusion: t("transportForm.templatesExplanationsConclusion"),
                        },
                        detectedItems: t("transportForm.templatesDetected", {
                            smart_count: transportTemplates?.length,
                            shipperName,
                        }),
                        title: t("common.template"),
                        createButton: t("transportTemplates.createTemplate"),
                    },
                }}
                isShortcutDisabled={isShortcutDisabled}
            />
        </Box>
    );
}
