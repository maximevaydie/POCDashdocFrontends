import {getConnectedManager} from "@dashdoc/web-common";
import {ExportMethod} from "@dashdoc/web-common/src/features/export/types";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Radio, Text, TextInput} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {useSelector} from "app/redux/hooks";

import {FORM_ID} from "../constants";
import {exportTransportsService} from "../exportTransports.service";
import {ExportTransportsData} from "../types";

type Props = {
    onSubmit: (payload: ExportTransportsData) => Promise<void>;
};

export function ExportPricingForm({onSubmit}: Props) {
    const options = exportTransportsService.getExportOptions();

    const manager = useSelector(getConnectedManager);

    const [formState, setFormState] = useState<ExportTransportsData>(() => ({
        email: manager?.user.email ?? "",
        exportName: "",
        exportMethod: "download",
    }));

    return (
        <form onSubmit={handleSubmit} id={FORM_ID}>
            <Flex flexDirection="column" mb={1}>
                <Text variant="h1" my={2}>
                    {t("exportModal.exportMethod")}
                </Text>
                {Object.entries(options).map(([option, {label, value, name}]) => (
                    <Radio
                        key={option}
                        name={name}
                        label={label}
                        value={value}
                        onChange={(checked: ExportMethod) => {
                            setFormState((prev) => ({...prev, exportMethod: checked}));
                        }}
                        checked={formState.exportMethod === option}
                        labelProps={{marginBottom: 1}}
                    />
                ))}
            </Flex>
            {formState.exportMethod === "email" && (
                <Box mb={2}>
                    <TextInput
                        required
                        label={t("common.email")}
                        id="export-email"
                        type="email"
                        placeholder={t("common.email")}
                        onChange={(email) => setFormState((prev) => ({...prev, email}))}
                        value={formState.email}
                    />
                </Box>
            )}
            <Box mb={3}>
                <TextInput
                    id="export-name"
                    label={t("components.pleaseEnterExportName")}
                    type="text"
                    placeholder={t("common.name")}
                    onChange={(exportName) => setFormState((prev) => ({...prev, exportName}))}
                    value={formState.exportName}
                />
            </Box>
        </form>
    );

    async function handleSubmit(event: React.SyntheticEvent<EventTarget>) {
        event.preventDefault();
        await onSubmit(formState);
    }
}
