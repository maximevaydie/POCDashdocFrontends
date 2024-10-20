import {ExportMethod} from "@dashdoc/web-common/src/features/export/types";

export type ExportType =
    | "deliveries"
    | "orders_pricing"
    | "transports_pricing"
    | "carbon_footprint"
    | "operations_carbon_footprint";

export type SavedExport = {
    name: string;
    email: string;
    export_type: ExportType;
    export_method: ExportMethod;
    columns: string[];
};

export type ColumnsSpec = {
    all_columns: {
        /**
         * Sample:
         * {
         *   "Informations du transport": [
         *     ["uid", "Numéro de suivi"],
         *     ["transport_number", "Numéro de transport"],
         *   ]
         * }
         */
        [key: string]: [string, string][];
    };
};

export type ExportInfo = {
    deliveries_export: ColumnsSpec;
    transports_pricing_export: ColumnsSpec;
    orders_pricing_export: ColumnsSpec;
    transports_carbon_footprint_export: ColumnsSpec;
    chain_elements_carbon_footprint_export: ColumnsSpec;
    saved_exports: SavedExport[];
};

export type SavedExportsPatchPayload = {
    saved_exports: SavedExport[];
};

export type ExportDeliveriesPostPayload = {
    filters: string;
    format: "excel_custom";
    email: string;
    export_name: string;
    export_method: ExportMethod;
    selected_columns: string[];
};

export type ExportTransportsData = {
    exportMethod: ExportMethod;
    email: string;
    exportName: string;
};

export type ExportTransportsPostPayload = {
    filters: string;
    email: string;
    export_name: string;
    export_method: ExportMethod;
    columns: string[];
};
