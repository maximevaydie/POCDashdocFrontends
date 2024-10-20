import {resolveMediaUrl} from "@dashdoc/core";
import {
    StaticImage,
    apiService,
    getConnectedManager,
    getFeatureFlag,
    utilsService,
} from "@dashdoc/web-common";
import {ExportFormat, ExportMethod} from "@dashdoc/web-common/src/features/export/types";
import {Logger, queryService, t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    Checkbox,
    Flex,
    Icon,
    Link,
    Modal,
    ModeTypeSelector,
    Radio,
    ButtonProps,
    RadioProps,
    Text,
    TextInput,
    toast,
} from "@dashdoc/web-ui";
import {MessageDocumentType, formatDate} from "dashdoc-utils";
import React, {RefObject, createRef} from "react";
import {connect} from "react-redux";
import cloneDeep from "rfdc/default";

import {
    CustomExportForm,
    CustomExportFormPayload,
} from "app/features/export/export-transports/forms/CustomExportForm";
import {RootState} from "app/redux/reducers/index";
import {ExportEvent} from "app/redux/reducers/realtime";
import {SearchQuery} from "app/redux/reducers/searches";
import {getLastExportEvent} from "app/redux/selectors";
import {getDocumentTypeOptions} from "app/services/transport";

import {FORM_ID} from "./constants";
import {exportTransportsService} from "./exportTransports.service";
import {ExportPricingForm} from "./forms/ExportPricingForm";
import {ExportCustomTabs} from "./tabs/ExportCustomTabs";
import {ExportTransportsTabs} from "./tabs/ExportTransportsTabs";
import {
    ExportDeliveriesPostPayload,
    ExportInfo,
    ExportTransportsData,
    ExportTransportsPostPayload,
    SavedExport,
    SavedExportsPatchPayload,
} from "./types";

// This number has been guessed from tests done in production
const MAX_TRANSPORT_EXPORT = 6000;

type ColumnCode = string;
type ExportColumn = {code_string: ColumnCode; human_string: string};

interface OwnProps {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    isOrderTab: boolean;
    isTransportTab: boolean;
    onClose: () => void;
}

interface StateProps {
    connectedManagerEmail: string;
    query: any;
    shouldShowLegacyInvoicingExport: boolean;
    lastExportEvent: ExportEvent | null;
}

interface DispatchProps {}

type ExportTransportsModalProps = OwnProps & StateProps & DispatchProps;

interface ExportTransportsModalState {
    format: ExportFormat;
    email: string;
    exportName: string;
    loadingSubmit: boolean;
    selectedColumns: {[columnCode: string]: boolean};
    selectedColumnsLoading: boolean;
    documentTypes: Map<MessageDocumentType, boolean>;
    exportMethod: ExportMethod;
    downloadLink?: string;
    error: string;
    exportInfo: ExportInfo | null;
}

const DEFAULT_EXPORT_TYPE = "deliveries";
const DEFAULT_EXPORT_METHOD = "download";

class ExportTransportsModal extends React.Component<
    ExportTransportsModalProps,
    ExportTransportsModalState
> {
    defaultColumns: ColumnCode[] = [];
    columns: ExportColumn[] = [];

    transportExportRadioOptions: Record<ExportMethod, RadioProps> =
        exportTransportsService.getExportOptions();

    private downloadLinkRef: RefObject<HTMLAnchorElement>;
    constructor(props: ExportTransportsModalProps) {
        super(props);
        this.downloadLinkRef = createRef();

        this.state = {
            format: "excel_custom",
            exportInfo: null,
            email: props.connectedManagerEmail,
            exportName: "",
            loadingSubmit: false,
            documentTypes: getDocumentTypeOptions().reduce((acc, option) => {
                acc.set(option.value, true);
                return acc;
            }, new Map<MessageDocumentType, boolean>()),
            selectedColumns: {},
            selectedColumnsLoading: false,
            exportMethod: "download",
            downloadLink: undefined,
            error: "",
        };
    }

    componentDidMount() {
        this.retrieveColumns();
    }

    componentDidUpdate = (prevProps: ExportTransportsModalProps) => {
        if (
            this.props.lastExportEvent?.timestamp !== prevProps.lastExportEvent?.timestamp &&
            this.props.lastExportEvent?.data?.success
        ) {
            const exportUrl = resolveMediaUrl(this.props.lastExportEvent.data.export.url);
            this.setState({downloadLink: exportUrl});
        }
        if (this.state.downloadLink && this.state.exportMethod === "download") {
            this.triggerDownload();
            this.props.onClose();
        }
    };

    // @ts-ignore
    triggerDownload = () => this.downloadLinkRef.current.click();

    retrieveColumns = async () => {
        this.setState({selectedColumnsLoading: true});

        try {
            const exportInfo: ExportInfo = await apiService.get("/transports/export-info/", {
                apiVersion: "web",
            });
            this.setState({
                exportInfo,
            });
        } catch (error) {
            Logger.error(error);
        }

        apiService
            .get("/transports/excel-export-info/", {apiVersion: "v4"})
            .then(
                (response: {
                    all_columns: string[][];
                    default_columns: ColumnCode[];
                    previous_column_selection: ColumnCode[];
                }) => {
                    this.defaultColumns = response.default_columns;
                    let selectedColumns: {[columnCode: string]: boolean} = {};
                    this.columns = response.all_columns.map((column) => {
                        const [code_string, human_string] = column;
                        selectedColumns[column[0]] =
                            (!!response.previous_column_selection &&
                                !!response.previous_column_selection.find(
                                    (code) => code === column[0]
                                )) ||
                            (!response.previous_column_selection &&
                                !!this.defaultColumns.find((code) => code === column[0]));

                        return {
                            code_string,
                            human_string,
                        };
                    });

                    this.setState({
                        selectedColumns,
                        selectedColumnsLoading: false,
                    });
                }
            );
    };

    handleDeleteCustomExport = async (format: ExportFormat) => {
        if (typeof format !== "number" || this.state.exportInfo === null) {
            return; // invalid
        }
        const backup_exportInfo = cloneDeep(this.state.exportInfo);
        const backup_format = this.state.format;

        const newSavedExports = cloneDeep(this.state.exportInfo.saved_exports);
        newSavedExports.splice(format, 1);

        let newFormat: ExportFormat = this.state.format;
        if (newSavedExports.length <= 0) {
            newFormat = "excel_custom";
        } else {
            newFormat = Math.max(0, format - 1);
        }
        const exportInfo = {
            ...this.state.exportInfo,
            saved_exports: newSavedExports,
        };
        // Update the local state immediately
        this.setState({
            exportInfo,
            format: newFormat,
        });
        // submit the new state to the server and rollback if it fails
        try {
            const savedExportsBody: SavedExportsPatchPayload = {
                saved_exports: newSavedExports,
            };
            await apiService.patch("/transports/saved-exports/", savedExportsBody, {
                apiVersion: "web",
            });
        } catch (error) {
            // Restore the previous state
            this.setState({exportInfo: backup_exportInfo, format: backup_format});
            toast.error(t("common.error"));
            throw error;
        }
    };

    handleNewCustomExport = () => {
        if (this.state.exportInfo === null) {
            return; // invalid
        }

        const savedExport: SavedExport = {
            name: formatDate(new Date(), "P"),
            email: this.props.connectedManagerEmail,
            export_type: DEFAULT_EXPORT_TYPE,
            export_method: DEFAULT_EXPORT_METHOD,
            columns: [],
        };
        const exportInfo = {
            ...this.state.exportInfo,
            saved_exports: [...this.state.exportInfo.saved_exports, savedExport],
        };
        this.setState({
            exportInfo,
            format: exportInfo.saved_exports.length - 1,
        });
    };

    handleCustomExportSubmit = async (payload: CustomExportFormPayload) => {
        if (payload.name.trim().length <= 0) {
            toast.error(t("common.errors.nameIsRequired"));
            return;
        }
        if (payload.export_method === "email" && !utilsService.validateEmail(payload.email)) {
            toast.error(t("errors.email.invalid"));
            return;
        }
        const count = this.props.selectedTransportsCount;
        const isAboveLimit = count > MAX_TRANSPORT_EXPORT;
        if (isAboveLimit) {
            this.props.onClose();
            return;
        }
        if (this.state.exportInfo === null || typeof this.state.format !== "number") {
            this.props.onClose();
            return; // invalid
        }

        this.setState({loadingSubmit: true, error: ""});

        let body: ExportDeliveriesPostPayload | ExportTransportsPostPayload;
        let exportUrl: string;
        const {columns, email, export_method, export_type, name} = payload;
        // avoid empty export name - set the current date as default
        const export_name = name ?? formatDate(new Date(), "P");
        switch (export_type) {
            case "orders_pricing":
                exportUrl = "/transports/export-orders-price-lines/";
                body = {
                    filters: queryService.toQueryString(this.props.selectedTransportsQuery),
                    email,
                    export_name,
                    export_method,
                    columns,
                };
                break;
            case "transports_pricing":
                exportUrl = "/transports/export-transports-price-lines/";
                body = {
                    filters: queryService.toQueryString(this.props.selectedTransportsQuery),
                    email,
                    export_name,
                    export_method,
                    columns,
                };
                break;
            case "carbon_footprint":
                exportUrl = "/transports/export-carbon-footprint/";
                body = {
                    filters: queryService.toQueryString(this.props.selectedTransportsQuery),
                    email,
                    export_name,
                    export_method,
                    columns,
                };
                break;
            case "operations_carbon_footprint":
                exportUrl = "/transports/export-operations-carbon-footprint/";
                body = {
                    filters: queryService.toQueryString(this.props.selectedTransportsQuery),
                    email,
                    export_name,
                    export_method,
                    columns,
                };
                break;
            default:
                exportUrl = "/transports/export/";
                body = {
                    filters: queryService.toQueryString(this.props.selectedTransportsQuery),
                    format: "excel_custom",
                    email,
                    export_name,
                    export_method,
                    selected_columns: columns,
                };
                break;
        }

        const savedExportsBody: SavedExportsPatchPayload = {
            saved_exports: cloneDeep(this.state.exportInfo.saved_exports),
        };
        savedExportsBody.saved_exports[this.state.format] = cloneDeep(payload);
        // avoid empty name - set the current date as default
        for (let i = 0; i < savedExportsBody.saved_exports.length; i++) {
            const savedExport = savedExportsBody.saved_exports[i];
            if (!savedExport.name || savedExport.name.trim().length <= 0) {
                savedExport.name = formatDate(new Date(), "P");
            }
        }
        try {
            await apiService.patch("/transports/saved-exports/", savedExportsBody, {
                apiVersion: "web",
            });
        } catch (error) {
            this.setState({loadingSubmit: false});
            if (error.status == 400) {
                let json = await error.json();
                this.setState({
                    error:
                        json?.format?.detail[0] ||
                        `${t("errors.invalid_field")} : ${Object.keys(json)}`,
                });
                Logger.error(error);
                toast.error(t("common.error"));
                return;
            } else {
                throw error;
            }
        }

        try {
            await apiService.post(exportUrl, body, {apiVersion: "web"});
            this.setState({error: ""});
            if (payload.export_method === "email") {
                toast.success(t("common.emailSent"));
            }
            if (payload.export_method === "email") {
                this.props.onClose();
            }
        } catch (error) {
            this.setState({loadingSubmit: false});
            if (error.status == 400) {
                let json = await error.json();
                this.setState({
                    error:
                        json?.format?.detail[0] ||
                        `${t("errors.invalid_field")} : ${Object.keys(json)}`,
                });
                Logger.error(error);
                if (payload.export_method === "email") {
                    toast.error(t("mail.error.couldNotSend"));
                } else {
                    toast.error(t("file.error.couldNotDownload"));
                }
            } else {
                throw error;
            }
        }
    };

    handleExportTransportsSubmit = async (payload: ExportTransportsData) => {
        const count = this.props.selectedTransportsCount;
        const isAboveLimit = count > MAX_TRANSPORT_EXPORT;
        if (isAboveLimit) {
            this.props.onClose();
            return;
        }

        this.setState({loadingSubmit: true, error: ""});
        const {exportMethod, email, exportName} = payload;

        const body = {
            filters: queryService.toQueryString(this.props.selectedTransportsQuery),
            email,
            export_name: exportName,
            export_method: exportMethod,
        };

        try {
            if (this.state.format === "pricing") {
                await apiService.post("/export-transports-pricing/", body, {apiVersion: "web"});
            } else if (this.state.format === "chartering") {
                await apiService.post("/transports/export-orders-price-lines/", body, {
                    apiVersion: "web",
                });
            } else if (this.state.format === "carbon-footprint") {
                await apiService.post("/transports/export-carbon-footprint/", body, {
                    apiVersion: "web",
                });
            } else if (this.state.format === "operations-carbon-footprint") {
                await apiService.post("/transports/export-operations-carbon-footprint/", body, {
                    apiVersion: "web",
                });
            } else {
                throw new Error("Invalid format");
            }
            this.setState({error: ""});
            if (payload.exportMethod === "email") {
                toast.success(t("common.emailSent"));
            }
            if (payload.exportMethod === "email") {
                this.props.onClose();
            }
        } catch (error) {
            this.setState({loadingSubmit: false});
            if (error.status == 400) {
                let json = await error.json();
                this.setState({
                    error:
                        json?.format?.detail[0] ||
                        `${t("errors.invalid_field")} : ${Object.keys(json)}`,
                });
                Logger.error(error);
                toast.error(t("mail.error.couldNotSend"));
            } else {
                throw error;
            }
        }
    };

    handleExportDeliveriesOrDocumentsSubmit = async (
        event?: React.SyntheticEvent<EventTarget>
    ) => {
        const count = this.props.selectedTransportsCount;
        const isAboveLimit = count > MAX_TRANSPORT_EXPORT;
        if (isAboveLimit) {
            this.props.onClose();
            return;
        }
        event?.preventDefault();
        this.setState({loadingSubmit: true, error: ""});

        let selected_columns = this.columns
            .map((column) => {
                return this.state.selectedColumns[column.code_string]
                    ? column.code_string
                    : undefined;
            })
            .filter(Boolean);

        const documentTypes: MessageDocumentType[] = [];
        this.state.documentTypes.forEach((_value, key) => {
            if (this.state.documentTypes.get(key)) {
                documentTypes.push(key);
            }
        });

        const body = {
            filters: queryService.toQueryString(this.props.selectedTransportsQuery),
            format: this.state.format,
            email: this.state.email,
            export_name: this.state.exportName,
            export_method: this.state.exportMethod,
            document_types: documentTypes,
            selected_columns:
                this.state.format === "excel"
                    ? this.columns.map((e) => e.code_string)
                    : selected_columns,
        };

        try {
            await apiService.post("/transports/export/", body, {apiVersion: "web"});
            this.setState({error: ""});
            if (this.state.exportMethod === "email") {
                toast.success(t("common.emailSent"));
            }
            if (this.state.format === "invoicing-excel" || this.state.exportMethod === "email") {
                this.props.onClose();
            }
        } catch (error) {
            this.setState({loadingSubmit: false});
            if (error.status == 400) {
                let json = await error.json();
                this.setState({
                    error:
                        json?.format?.detail[0] ||
                        `${t("errors.invalid_field")} : ${Object.keys(json)}`,
                });
                Logger.error(error);
                toast.error(t("mail.error.couldNotSend"));
            } else {
                throw error;
            }
        }
    };

    handleDocumentTypeChange = (value: MessageDocumentType, checked: boolean) => {
        const documentTypes = new Map(this.state.documentTypes);
        documentTypes.set(value, checked);
        this.setState({documentTypes});
    };

    handleColumnChange = (code: string, checked: boolean) => {
        this.setState({selectedColumns: {...this.state.selectedColumns, [code]: checked}});
    };

    _renderSelectDocumentTypes = () => {
        return (
            <Flex flexDirection="column">
                <Text variant="h1" mb={2}>
                    {t("exportTransportsModal.documentTypesToExport")}
                </Text>
                {getDocumentTypeOptions().map((option) => (
                    <Checkbox
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        checked={this.state.documentTypes.get(option.value)}
                        onChange={(checked) =>
                            this.handleDocumentTypeChange(option.value, checked)
                        }
                    />
                ))}
            </Flex>
        );
    };

    handleSelectAllButtonClicked = () => {
        let selectedColumns = this.state.selectedColumns;
        this.columns.forEach((column) => {
            selectedColumns[column.code_string] = true;
        });
        this.setState({selectedColumns});
    };

    handleClearButtonClicked = () => {
        let selectedColumns = this.state.selectedColumns;
        this.columns.forEach((column) => {
            selectedColumns[column.code_string] = false;
        });
        this.setState({selectedColumns});
    };

    handleDefaultColumnsButtonClicked = () => {
        let selectedColumns = this.state.selectedColumns;
        Object.keys(selectedColumns).forEach((columnCode: ColumnCode) => {
            selectedColumns[columnCode] = this.defaultColumns.includes(columnCode);
        });

        this.setState({selectedColumns});
    };

    _renderSelectedColumns = () => {
        return (
            <Box>
                <Text variant="h1">{t("exportTransportsModal.columnsToExport")}</Text>
                <Text variant="caption" mt={2} mb={1}>
                    <Link type="button" onClick={this.handleSelectAllButtonClicked} mr={2}>
                        {t("common.selectAll")}
                    </Link>
                    -
                    <Link type="button" onClick={this.handleClearButtonClicked} mx={2}>
                        {t("common.deselectAll")}
                    </Link>
                    -
                    <Link type="button" onClick={this.handleDefaultColumnsButtonClicked} ml={2}>
                        {t("exportModal.defaultColumns")}
                    </Link>
                </Text>
                <Flex
                    minHeight="8em"
                    height="32em"
                    overflowY="auto"
                    p={2}
                    my={2}
                    flexDirection="column"
                    backgroundColor="grey.light"
                    borderRadius={1}
                >
                    {this.columns.map((column) => (
                        <Checkbox
                            key={column.code_string}
                            label={column.human_string}
                            value={column.code_string}
                            checked={this.state.selectedColumns[column.code_string]}
                            onChange={(checked) =>
                                this.handleColumnChange(column.code_string, checked)
                            }
                        />
                    ))}
                </Flex>
            </Box>
        );
    };

    _renderShipmentsCount = () => {
        const count = this.props.selectedTransportsCount || 0;
        return (
            <Text color="grey.dark">
                {t("components.countSelectedTransports", {count, smart_count: count})}
            </Text>
        );
    };

    _renderFormDetails = () => {
        return (
            <>
                <Flex flexDirection="column" mb={1}>
                    <Text variant="h1" my={2}>
                        {t("exportModal.exportMethod")}
                    </Text>
                    {Object.entries(this.transportExportRadioOptions).map(
                        ([option, {label, value, name}]) => (
                            <Radio
                                key={option}
                                name={name}
                                label={label}
                                value={value}
                                onChange={(exportMethod: ExportMethod) =>
                                    this.setState({exportMethod})
                                }
                                checked={this.state.exportMethod === option}
                                labelProps={{marginBottom: 1}}
                            />
                        )
                    )}
                </Flex>
                {this.state.exportMethod === "email" && (
                    <Box mb={2}>
                        <TextInput
                            required
                            label={t("common.email")}
                            id="export-email"
                            type="email"
                            placeholder={t("common.email")}
                            onChange={(email) => this.setState({email})}
                            value={this.state.email}
                        />
                    </Box>
                )}
                <Box mb={3}>
                    <TextInput
                        id="export-name"
                        label={t("components.pleaseEnterExportName")}
                        type="text"
                        placeholder={t("common.name")}
                        onChange={(exportName) => this.setState({exportName})}
                        value={this.state.exportName}
                    />
                </Box>
            </>
        );
    };

    _renderLegacyInvoicingExportDetail = () => {
        return <p>{t("exportModal.invoicingDetails")}</p>;
    };

    _renderContent = () => {
        if (this.state.loadingSubmit && this.state.exportMethod === "download") {
            return (
                <>
                    <Text mb={2}>{t("components.waitForDownloadOrExportsTab")}</Text>
                    <StaticImage src="exports-transports.gif" />
                </>
            );
        }
        const saved_exports = this.state.exportInfo?.saved_exports ?? null;
        const oneUnsavedCustomExport = saved_exports?.some(
            (savedExport) => savedExport.name.length <= 0
        );
        return (
            <Flex m={-5} mb={2} borderBottom="solid 1px" borderBottomColor="grey.light">
                <Flex p={4} flexDirection="column" backgroundColor="grey.white" maxWidth="340px">
                    <Text variant="h1" color="grey.dark" mb={4}>
                        {t("common.defaultExport")}
                    </Text>
                    <ExportTransportsTabs
                        currentFormat={this.state.format}
                        isOrderTab={this.props.isOrderTab}
                        isTransportTab={this.props.isTransportTab}
                        onClick={(format: ExportFormat) => this.setState({format})}
                    />
                    <Text variant="h1" color="grey.dark" my={4}>
                        {t("common.customExports")}
                    </Text>
                    {saved_exports && (
                        <>
                            <ExportCustomTabs
                                savedExports={saved_exports}
                                currentFormat={this.state.format}
                                onDelete={
                                    // disable deletion if there is on new export unsaved
                                    !oneUnsavedCustomExport
                                        ? this.handleDeleteCustomExport
                                        : undefined
                                }
                                onClick={(format: ExportFormat) => this.setState({format})}
                            />
                            {
                                // disable creation if there is on new export unsaved
                                !oneUnsavedCustomExport && (
                                    <Box ml={2} mt={2}>
                                        <Link
                                            onClick={this.handleNewCustomExport}
                                            alignItems="center"
                                        >
                                            <Icon fontSize={1} name="plusSign" mr={2} />
                                            {t("exportModal.addCustomExport")}
                                        </Link>
                                    </Box>
                                )
                            }
                        </>
                    )}
                </Flex>
                <Flex
                    flex={2}
                    backgroundColor="grey.ultralight"
                    flexDirection="column"
                    borderLeft="solid 1px"
                    borderLeftColor="grey.light"
                    p={4}
                >
                    {typeof this.state.format === "number" &&
                        this.state.exportInfo &&
                        saved_exports &&
                        this.state.format < saved_exports.length && (
                            <CustomExportForm
                                key={this.state.format}
                                value={saved_exports[this.state.format]}
                                exportInfo={this.state.exportInfo}
                                onSubmit={this.handleCustomExportSubmit}
                            />
                        )}
                    {(this.state.format === "pricing" || this.state.format === "chartering") && (
                        <>
                            <ExportPricingForm onSubmit={this.handleExportTransportsSubmit} />
                            <Box>
                                <div className="small-spacer" />
                                {this.state.error && (
                                    <div className="alert alert-danger" role="alert">
                                        {t("common.error")} : {this.state.error}
                                    </div>
                                )}
                            </Box>
                        </>
                    )}

                    {(this.state.format === "carbon-footprint" ||
                        this.state.format === "operations-carbon-footprint") && (
                        <>
                            <form
                                onSubmit={async (event: React.SyntheticEvent<EventTarget>) => {
                                    event.preventDefault();
                                    await this.handleExportTransportsSubmit({
                                        email: this.state.email,
                                        exportMethod: this.state.exportMethod,
                                        exportName: this.state.exportName,
                                    });
                                }}
                                id={FORM_ID}
                            >
                                {this.props.isTransportTab && (
                                    <ModeTypeSelector<ExportFormat>
                                        modeList={[
                                            {
                                                value: "carbon-footprint",
                                                label: t("exportModal.transportsCarbonFootprint"),
                                                icon: "ecologyLeaf",
                                            },
                                            {
                                                value: "operations-carbon-footprint",
                                                label: t(
                                                    "exportModal.transportOperationsCarbonFootprint"
                                                ),
                                                icon: "workflowDataTable2",
                                            },
                                        ]}
                                        currentMode={this.state.format}
                                        setCurrentMode={(format) => this.setState({format})}
                                    />
                                )}
                                {this._renderFormDetails()}
                            </form>
                        </>
                    )}
                    {typeof this.state.format !== "number" &&
                        ["excel", "excel_custom", "documents", "invoicing-excel"].includes(
                            this.state.format
                        ) && (
                            <form
                                onSubmit={this.handleExportDeliveriesOrDocumentsSubmit}
                                id={FORM_ID}
                            >
                                {this.state.format === "excel_custom" && (
                                    <Callout variant="secondary" mb={3}>
                                        {t("exportModal.pickupDeliveryCustomWillBeReplaced")}
                                    </Callout>
                                )}
                                {this.state.format === "excel" && (
                                    <Callout variant="secondary" mb={3}>
                                        {t(
                                            "exportModal.transportExportBecomePickupDeliveryExport"
                                        )}
                                    </Callout>
                                )}
                                <Box>
                                    {this.state.format === "excel_custom" &&
                                        this._renderSelectedColumns()}
                                    {this.state.format === "documents" &&
                                        this._renderSelectDocumentTypes()}
                                    {
                                        /* TO remove with invoicing-excel-export FF */
                                        this.state.format === "invoicing-excel" &&
                                            this._renderLegacyInvoicingExportDetail()
                                    }
                                </Box>
                                <Box>
                                    {this.state.format !== "invoicing-excel" &&
                                        this._renderFormDetails()}
                                    <div className="small-spacer" />
                                    {this.state.error && (
                                        <div className="alert alert-danger" role="alert">
                                            {t("common.error")} : {this.state.error}
                                        </div>
                                    )}
                                </Box>
                            </form>
                        )}
                </Flex>
            </Flex>
        );
    };

    _renderContentWhenTooManyTransports = (count: number) => {
        return (
            <Box>
                <div className="row">
                    <div className="col-md-12">
                        <p>
                            {t("exportModal.tooManyTransports", {
                                count: count,
                                max: MAX_TRANSPORT_EXPORT,
                            })}
                        </p>
                    </div>
                </div>
            </Box>
        );
    };

    render = () => {
        const count = this.props.selectedTransportsCount;
        const isAboveLimit = count > MAX_TRANSPORT_EXPORT;
        const isCustomExport = typeof this.state.format === "number";

        let mainButton: ButtonProps | null = {
            children: isCustomExport ? t("common.exportAndSave") : t("common.export"),
            type: "submit",
            form: "export-transports-form",
            loading: this.state.loadingSubmit,
            disabled: this.props.selectedTransportsCount === 0,
        };
        let secondaryButton: ButtonProps | null = {
            children: this.state.loadingSubmit ? t("common.close") : t("common.cancel"),
            onClick: this.props.onClose,
        };
        if (isAboveLimit) {
            mainButton = {
                children: t("common.close"),
                onClick: this.props.onClose,
            };
            secondaryButton = null;
        }
        if (this.state.loadingSubmit) {
            mainButton = null;
        }

        return (
            <Modal
                title={t("components.exportTransports")}
                id="export-transports-modal"
                size={isCustomExport ? "xlarge" : "large"}
                onClose={this.props.onClose}
                mainButton={mainButton}
                secondaryButton={secondaryButton}
                additionalFooterContent={this._renderShipmentsCount()}
            >
                {isAboveLimit
                    ? this._renderContentWhenTooManyTransports(count)
                    : this._renderContent()}
                <Link display="none" ref={this.downloadLinkRef} href={this.state.downloadLink} />
            </Modal>
        );
    };
}

const mapStateToProps = (state: RootState): StateProps => {
    const connectedManager = getConnectedManager(state);
    const lastExportEvent: ExportEvent | null = getLastExportEvent(state);
    return {
        shouldShowLegacyInvoicingExport: getFeatureFlag(state, "invoicing-excel-export"),
        connectedManagerEmail: connectedManager?.user.email ?? "",
        query: state.searches.transports.currentQuery,
        lastExportEvent,
    };
};

export default connect<StateProps, DispatchProps, OwnProps>(mapStateToProps)(
    ExportTransportsModal
);
