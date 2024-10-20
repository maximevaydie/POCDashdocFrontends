import {ExportMethod} from "@dashdoc/web-common/src/features/export/types";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    ModeTypeSelector,
    Radio,
    Select,
    Text,
    TextInput,
    IconNames,
} from "@dashdoc/web-ui";
import React, {useState} from "react";
import cloneDeep from "rfdc/default";

import {FORM_ID} from "../constants";
import {exportTransportsService} from "../exportTransports.service";
import {ColumnsSpec, ExportInfo, ExportType, SavedExport} from "../types";

import {AvailableColumnsField} from "./field/AvailableColumnsField";
import {SelectedColumnsField} from "./field/SelectedColumnsField";

export type CustomExportFormPayload = SavedExport;

type Props = {
    value: SavedExport;
    exportInfo: ExportInfo;
    onSubmit: (payload: CustomExportFormPayload) => Promise<void>;
};

type ExportTypeOption = {value: ExportType; label: string; icon: IconNames};

export function CustomExportForm({value, exportInfo, onSubmit}: Props) {
    const options = exportTransportsService.getExportOptions();
    let exportTypeOptions: ExportTypeOption[] = [
        {
            value: "deliveries",
            label: t("exportModal.pickupDelivery"),
            icon: "workflowDataTable2",
        },
        {
            value: "transports_pricing",
            label: t("exportModal.transportPlusPrice"),
            icon: "euro",
        },
        {
            value: "orders_pricing",
            label: t("exportModal.orderPlusPrice"),
            icon: "euro",
        },
        {
            value: "carbon_footprint",
            label: t("exportModal.carbonFootprint"),
            icon: "ecologyLeaf",
        },
    ];

    const [formState, setFormState] = useState<CustomExportFormPayload>(() => cloneDeep(value));

    let columnsSpec: ColumnsSpec;
    switch (formState.export_type) {
        case "transports_pricing":
            columnsSpec = exportInfo.transports_pricing_export;
            break;
        case "orders_pricing":
            columnsSpec = exportInfo.orders_pricing_export;
            break;
        case "carbon_footprint":
            columnsSpec = exportInfo.transports_carbon_footprint_export;
            break;
        case "operations_carbon_footprint":
            columnsSpec = exportInfo.chain_elements_carbon_footprint_export;
            break;
        default:
            // deliveries
            columnsSpec = exportInfo.deliveries_export;
            break;
    }

    const handleUpdateColumnsMemoized = React.useCallback(handleUpdateColumns, []);

    return (
        <form onSubmit={handleSubmit} id={FORM_ID}>
            <Box
                style={{
                    display: "grid",
                    gridTemplateColumns: "4fr 3fr",
                    gap: "24px",
                    height: "700px",
                }}
            >
                <Flex
                    p={4}
                    flexGrow={1}
                    style={{
                        overflow: "hidden",
                    }}
                    flexDirection="column"
                    backgroundColor="grey.white"
                >
                    <Text variant="h1" color="grey.dark" mb={2}>
                        {t("common.general")}
                    </Text>
                    <Flex flexDirection="column" mb={3}>
                        <TextInput
                            id="export-name"
                            label={t("common.exportName")}
                            type="text"
                            required
                            placeholder={t("common.name")}
                            onChange={(name) => setFormState((prev) => ({...prev, name}))}
                            value={formState.name}
                        />
                    </Flex>
                    <Text variant="h1" color="grey.dark" mt={4} mb={2}>
                        {t("exportModal.exportMethod")}
                    </Text>
                    <Flex style={{gap: "24px"}} mb={1}>
                        {Object.entries(options).map(([option, {label, value, name}]) => (
                            <Radio
                                key={option}
                                name={name}
                                label={label}
                                value={value}
                                onChange={(export_method: ExportMethod) => {
                                    setFormState((prev) => ({...prev, export_method}));
                                }}
                                checked={formState.export_method === option}
                                labelProps={{marginBottom: 1}}
                            />
                        ))}
                    </Flex>
                    {formState.export_method === "email" && (
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

                    <Text variant="h1" color="grey.dark" mt={4} mb={2}>
                        {t("common.exportType")}
                    </Text>
                    <Select<ExportTypeOption>
                        options={exportTypeOptions}
                        onChange={(option: ExportTypeOption) => {
                            if (
                                option?.value === "carbon_footprint" &&
                                formState.export_type === "operations_carbon_footprint"
                            ) {
                                handleUpdateExportType("operations_carbon_footprint");
                            } else {
                                handleUpdateExportType(option?.value);
                            }
                        }}
                        value={exportTypeOptions.find(
                            (option) =>
                                option.value ===
                                (formState.export_type === "operations_carbon_footprint"
                                    ? "carbon_footprint"
                                    : formState.export_type)
                        )}
                        isClearable={false}
                    />

                    {(formState.export_type === "operations_carbon_footprint" ||
                        formState.export_type === "carbon_footprint") && (
                        <Box mt={2}>
                            <ModeTypeSelector<ExportType>
                                modeList={[
                                    {
                                        value: "carbon_footprint",
                                        label: t("exportModal.transportsCarbonFootprint"),
                                        icon: "ecologyLeaf",
                                    },
                                    {
                                        value: "operations_carbon_footprint",
                                        label: t("exportModal.transportOperationsCarbonFootprint"),
                                        icon: "workflowDataTable2",
                                    },
                                ]}
                                currentMode={formState.export_type}
                                setCurrentMode={handleUpdateExportType}
                            />
                        </Box>
                    )}
                    <Text variant="h1" color="grey.dark" mt={4} mb={2}>
                        {t("common.availableColumns")}
                    </Text>
                    <AvailableColumnsField
                        columnsSpec={columnsSpec}
                        columns={formState.columns}
                        onChange={handleUpdateColumnsMemoized}
                    />
                </Flex>

                <Flex
                    p={4}
                    pl={4}
                    style={{overflowY: "hidden"}}
                    flexDirection="column"
                    backgroundColor="grey.white"
                    flex={1}
                >
                    <Text variant="h1" color="grey.dark" mb={2}>
                        {t("common.exportedColumns")}
                    </Text>
                    {formState.columns.length === 0 && (
                        <Text variant="h1" color="grey.default" ml={4} mt={4}>
                            {t("exportModal.addColumnsToExport")}
                        </Text>
                    )}

                    <Box pl={5} style={{overflowY: "auto"}}>
                        <SelectedColumnsField
                            columnsSpec={columnsSpec}
                            columns={formState.columns}
                            onChange={handleUpdateColumnsMemoized}
                        />
                    </Box>
                </Flex>
            </Box>
        </form>
    );

    function handleUpdateExportType(exportType: ExportType) {
        setFormState((prev) => ({
            ...prev,
            export_type: exportType,
            columns: [],
        }));
    }

    function handleUpdateColumns(columns: string[]) {
        setFormState((prev) => ({...prev, columns}));
    }

    async function handleSubmit(event: React.SyntheticEvent<EventTarget>) {
        event.preventDefault();
        await onSubmit(formState);
    }
}
