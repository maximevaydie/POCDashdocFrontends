import {getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {Logger, t, TranslationKeys} from "@dashdoc/web-core";
import {buttonVariants, theme} from "@dashdoc/web-ui";
import {ImportReportType} from "@dashdoc/web-ui";
import {zoneDateToISO} from "dashdoc-utils";
import {parse} from "date-fns";
import {
    ColumnAPI,
    CurrencyValue,
    DropdownOptionAPI,
    FieldValue,
    ResultValues,
    ThemeAPI,
    ValidatorAPI,
} from "nuvo-react";

import {DateFormat} from "../../features/fleet/DateFormatPicker";

import {NuvoDropdownOption, NuvoModel, NuvoValidator, UserSpecificDateType} from "./type";

export const translateModel = (model: NuvoModel, dateFormat: DateFormat): ColumnAPI[] => {
    const translateValidators = (validators: NuvoValidator[]): ValidatorAPI[] => {
        return validators.map((validator) => {
            return {
                ...validator,
                errorMessage: validator.errorMessage ? t(validator.errorMessage) : undefined,
            };
        });
    };

    const translateDropdownOptions = (
        dropdownOptions: NuvoDropdownOption[]
    ): DropdownOptionAPI[] => {
        return dropdownOptions.map((option) => {
            return {
                ...option,
                label: t(option.label),
            };
        });
    };

    return model.map((column) => {
        return {
            ...column,
            label: t(column.label),
            description: column.description ? t(column.description) : undefined,
            validations: column.validations ? translateValidators(column.validations) : undefined,
            dropdownOptions: column.dropdownOptions
                ? translateDropdownOptions(column.dropdownOptions)
                : undefined,
            columnType:
                column.columnType === UserSpecificDateType
                    ? dateFormat.columnType
                    : column.columnType,
            alternativeMatches:
                column.columnType === UserSpecificDateType
                    ? dateFormat.alternativeMatches
                    : column.alternativeMatches,
            example:
                column.columnType === UserSpecificDateType ? dateFormat.example : column.example,
        };
    });
};

export const formatResultsDate = (
    model: NuvoModel,
    results: ResultValues,
    dateFormat: DateFormat
): ResultValues => {
    const toStandardFormat = (data: FieldValue | CurrencyValue): FieldValue | CurrencyValue => {
        if (!data) {
            return data;
        }

        let date = undefined;
        if (dateFormat.key == "us") {
            let [day, month, year] = (data as string).split("/");
            date = `${year}-${month}-${day}`;
        } else {
            throw new Error(`Not implemented Date format: ${dateFormat.key}`);
        }

        return date;
    };
    if (dateFormat.key == "standard") {
        return results;
    }

    const columnsToFormat = model.filter((column) => column.columnType == UserSpecificDateType);
    for (const result of results) {
        for (const column of columnsToFormat) {
            result[column.key] = toStandardFormat(result[column.key]);
        }
    }
    return results;
};

export const getNuvoTranslations = (): Record<string, string> => {
    const translationsKeys: TranslationKeys[] = [
        "nuvo.txt_upload_data",
        "nuvo.txt_allow_data_type",
        "nuvo.txt_select_files",
        "nuvo.txt_select_option",
        "nuvo.txt_back",
        "nuvo.txt_continue",
        "nuvo.txt_cancel",
        "nuvo.txt_sheet_selection",
        "nuvo.txt_sheet_selection_description",
        "nuvo.txt_select_header",
        "nuvo.txt_download_template",
        "nuvo.txt_download_template_desc",
        "nuvo.txt_download_excel",
        "nuvo.txt_download_excel_modal",
        "nuvo.txt_download_csv",
        "nuvo.txt_download_csv_modal",
        "nuvo.txt_all",
        "nuvo.txt_select",
        "nuvo.txt_export_as_excel",
        "nuvo.txt_title_submit_success",
        "nuvo.txt_example",
        "nuvo.txt_title_confirm_submit_data_without_error",
        "nuvo.txt_confirm_submit_data_with_error",
        "nuvo.txt_confirm_submit_data_without_error",
        "nuvo.txt_allow_error_confirm_submit_data_with_error",
        "nuvo.txt_import_data_error_exceed",
        "nuvo.txt_field_required",
        "nuvo.txt_field_category_required",
        "nuvo.txt_field_invalid_format_number",
        "nuvo.txt_field_invalid_format_number_int",
        "nuvo.txt_field_invalid_format_number_float",
        "nuvo.txt_field_not_in_options",
        "nuvo.txt_field_invalid_regex_format",
        "nuvo.txt_field_unique",
        "nuvo.txt_field_required_with",
        "nuvo.txt_field_required_without",
        "nuvo.txt_field_required_with_all",
        "nuvo.txt_field_required_without_all",
        "nuvo.txt_field_required_with_values",
        "nuvo.txt_field_required_without_values",
        "nuvo.txt_field_required_with_all_values",
        "nuvo.txt_field_required_without_all_values",
        "nuvo.txt_close",
        "nuvo.txt_data_processing",
        "nuvo.txt_back_page_dialog",
        "nuvo.txt_close_page_modal",
        "nuvo.txt_title_sheet_max_entries",
        "nuvo.txt_desc_sheet_max_entries",
        "nuvo.txt_dialog_un_matched",
        "nuvo.txt_or",
        "nuvo.txt_progress_upload",
        "nuvo.txt_progress_sheet_selection",
        "nuvo.txt_progress_header_selection",
        "nuvo.txt_progress_match_column",
        "nuvo.txt_progress_review_entries",
        "nuvo.txt_confirm_title",
        "nuvo.txt_massive_error",
        "nuvo.txt_match_column_required",
        "nuvo.txt_submit_understand",
        "nuvo.txt_go_back",
        "nuvo.txt_submit",
        "nuvo.txt_title_too_many_files_error",
        "nuvo.txt_too_many_files_error",
        "nuvo.txt_title_upload_valid_file_error",
        "nuvo.txt_upload_valid_file_error",
        "nuvo.txt_page_upload_desc",
        "nuvo.txt_select_header_desc",
        "nuvo.txt_num_sheet_other",
        "nuvo.txt_sheet_selection_title",
        "nuvo.txt_size_import_one",
        "nuvo.txt_size_import_other",
        "nuvo.txt_delete_button",
        "nuvo.txt_duplicate_button",
        "nuvo.txt_find_error",
        "nuvo.txt_toggle_error",
        "nuvo.txt_one_error",
        "nuvo.txt_error_amount",
        "nuvo.txt_confirm",
        "nuvo.txt_upload_file",
        "nuvo.txt_require_columns",
        "nuvo.txt_show_more",
        "nuvo.txt_show_less",
        "nuvo.txt_search",
        "nuvo.txt_required",
        "nuvo.txt_not_all_mapped",
        "nuvo.txt_empty",
        "nuvo.txt_unable_match_auto",
        "nuvo.txt_match_manual",
        "nuvo.txt_match_auto",
        "nuvo.txt_unable_match",
        "nuvo.txt_recommended_match",
        "nuvo.txt_others",
        "nuvo.txt_percent_row_have_values",
        "nuvo.txt_full_screen",
        "nuvo.txt_search_result",
        "nuvo.txt_title_warning_screen",
        "nuvo.txt_warning_screen",
        "nuvo.txt_title_warning_screen_modal_false",
        "nuvo.txt_warning_screen_modal_false",
        "nuvo.txt_complete_imports",
        "nuvo.txt_no_data_in_sheet_title",
        "nuvo.txt_no_data_in_sheet_description",
        "nuvo.txt_not_export_file",
        "nuvo.txt_allow_multiple_data_type",
        "nuvo.txt_allow_multiple_select_files",
        "nuvo.txt_multiple_sheet_selection_description",
        "nuvo.txt_page_multiple_upload_desc",
        "nuvo.txt_num_one_sheet_other",
        "nuvo.txt_size_multi_import_one",
        "nuvo.txt_size_multi_import_other",
        "nuvo.txt_allow_multiple_upload_file",
        "nuvo.txt_progress_join_column",
        "nuvo.txt_add_files",
        "nuvo.txt_progress_bar",
        "nuvo.txt_joined",
        "nuvo.txt_joined_columns",
        "nuvo.txt_maximum_selected_sheet",
        "nuvo.txt_joined_columns_description",
        "nuvo.txt_maximum_selected_sheet_desc",
        "nuvo.txt_accept_understand",
        "nuvo.txt_sheet_selection_list_title",
        "nuvo.txt_sheet_selection_multiple_desc",
        "nuvo.txt_sheet_selection_one_desc",
        "nuvo.txt_join_sheets",
        "nuvo.txt_join_sheets_desc",
        "nuvo.txt_join_sheets_percent_matched",
        "nuvo.txt_join_sheets_percent_not_matched",
        "nuvo.txt_title_warning_join_column",
        "nuvo.txt_desc_warning_join_column",
        "nuvo.txt_submit_i_understand",
        "nuvo.txt_match_percent_description",
        "nuvo.txt_title_warning_join_column_order",
        "nuvo.txt_desc_warning_join_column_order",
        "nuvo.txt_no_matching_entry_title",
        "nuvo.txt_no_matching_entry_description_multiple",
        "nuvo.txt_no_matching_entry_description_single",
        "nuvo.txt_upload_exceed_max_size_error",
        "nuvo.txt_title_upload_exceed_max_size_error",
        "nuvo.txt_manual_entry",
        "nuvo.txt_just_a_moment_please",
        "nuvo.txt_validating",
        "nuvo.txt_file_error",
        "nuvo.txt_dropdown_options",
        "nuvo.txt_positive_button_close_modal",
        "nuvo.txt_negative_button_close_modal",
        "nuvo.txt_invalid_data_behavior_block_more_error",
        "nuvo.txt_invalid_data_behavior_block",
        "nuvo.txt_confirm_title_close_modal",
        "nuvo.txt_field_invalid_date_dmy",
        "nuvo.txt_field_invalid_date_mdy",
        "nuvo.txt_field_invalid_date_ymd",
        "nuvo.txt_invalid_format_date_iso",
        "nuvo.txt_invalid_format_datetime",
        "nuvo.txt_invalid_format_time_hms",
        "nuvo.txt_invalid_format_time_hms_24",
        "nuvo.txt_invalid_format_time_hm",
        "nuvo.txt_invalid_format_time_hm_24",
        "nuvo.txt_invalid_format_email",
        "nuvo.txt_invalid_format_url_www",
        "nuvo.txt_invalid_format_url_https",
        "nuvo.txt_invalid_format_url",
        "nuvo.txt_invalid_format_phone",
        "nuvo.txt_invalid_format_zip_code_de",
        "nuvo.txt_invalid_format_percentage",
        "nuvo.txt_invalid_format_currency_eur",
        "nuvo.txt_invalid_format_currency_usd",
        "nuvo.txt_invalid_format_bic",
        "nuvo.txt_invalid_format_vat_eu",
        "nuvo.txt_invalid_format_gtin",
        "nuvo.txt_invalid_format_iban",
        "nuvo.txt_loading",
        "nuvo.txt_create_new_option",
        "nuvo.txt_custom_column_description",
        "nuvo.txt_create_new_column",
        "nuvo.txt_default_sheet_prefix_name",
        "nuvo.txt_file_format_error",
        "nuvo.txt_option_custom_created_info",
        "nuvo.txt_default_title_error",
        "nuvo.txt_import_error",
        "nuvo.txt_title_error_invalid_format",
        "nuvo.txt_create_custom_not_allowed",
        "nuvo.txt_add_new_row",
        "nuvo.txt_download_only_csv_template_desc",
        "nuvo.txt_title_info_box_automatic_mapping",
        "nuvo.txt_description_info_box_automatic_mapping",
        "nuvo.txt_multiselection_allowed",
        "nuvo.txt_successful_records",
        "nuvo.txt_failed_records",
        "nuvo.txt_import_data",
        "nuvo.txt_edit_data_button",
        "nuvo.txt_description_submit_success",
        "nuvo.txt_boolean_no",
        "nuvo.txt_boolean_yes",
        "nuvo.txt_default_sheet_name",
    ];
    const translations: Record<string, string> = {};
    for (const key of translationsKeys) {
        translations[key.slice(5)] = t(key);
    }

    return translations;
};

export const removeEmptyEntries = (data: ResultValues): ResultValues => {
    return data.filter((entry) =>
        Object.values(entry).some((value) => value !== null && value !== "")
    );
};

export const removeEmptyFieldInEntries = (data: ResultValues): ResultValues => {
    return data.reduce((result: ResultValues, entry) => {
        const filteredEntry = Object.fromEntries(
            Object.entries(entry).filter(
                (keyValuePair) => keyValuePair[1] !== null && keyValuePair[1] !== ""
            )
        );
        return [...result, filteredEntry];
    }, []);
};

export const fleetModel: NuvoModel = [
    {
        key: "license_plate",
        label: "common.licensePlate",
        description: "fleet.import.licensePlateDescription",
        example: "001VEH55",
        columnType: "string",
        validations: [
            {
                validate: "unique",
                errorMessage: "fleet.import.duplicatedLicensePlate",
            },
            {
                validate: "required",
                errorMessage: "fleet.import.requiredLicensePlate",
            },
        ],
    },
    {
        key: "remote_id",
        label: "fleet.import.remoteId",
        description: "fleet.import.remoteIdDescription",
        example: "other_software_id",
        columnType: "string",
        validations: [
            {
                validate: "unique",
                errorMessage: "fleet.import.duplicatedRemoteId",
            },
        ],
    },
    {
        key: "fleet_number",
        label: "common.fleetNumber",
        description: "fleet.import.fleetNumberDescription",
        example: "ABC123",
        columnType: "string",
        validations: [
            {
                validate: "unique",
                errorMessage: "fleet.import.duplicatedFleetNumber",
            },
        ],
    },
    {
        key: "used_for_qualimat_transports",
        label: "fleet.import.usedForQualimat",
        description: "fleet.import.usedForQualimatDescription",
        columnType: "boolean",
    },
    {
        key: "technical_control_deadline",
        label: "fleet.import.technicalControlDeadline",
        description: "fleet.import.technicalControlDeadlineDescription",
        columnType: UserSpecificDateType,
    },
    {
        key: "tachograph_deadline",
        label: "fleet.import.tachographDeadline",
        description: "fleet.import.tachographDeadlineDescription",
        columnType: UserSpecificDateType,
    },
    {
        key: "speed_limiter_deadline",
        label: "fleet.import.speedLimiterDeadline",
        description: "fleet.import.speedLimiterDeadlineDescription",
        columnType: UserSpecificDateType,
    },
    {
        key: "fuel_type",
        label: "common.fuel_type",
        description: "fleet.import.fuelTypeDescription",
        columnType: "category",
        dropdownOptions: [
            {
                label: "common.fuel_type.diesel",
                value: "GO",
                type: "string",
            },
            {
                label: "common.fuel_type.compressed_natural_gas",
                value: "CNG",
                type: "string",
            },
            {
                label: "common.fuel_type.liquefied_natural_gas",
                value: "LNG",
                type: "string",
            },
            {
                label: "common.fuel_type.electric",
                value: "EL",
                type: "string",
            },
        ],
        isMultiSelect: false,
    },
    {
        key: "equipment_type",
        label: "fleet.import.equipmentType",
        columnType: "category",
        dropdownOptions: [
            {
                label: "common.vehicle",
                value: "vehicle",
                type: "string",
                alternativeMatches: ["Moteur"],
            },
            {
                label: "common.trailer",
                value: "trailer",
                type: "string",
            },
        ],
        isMultiSelect: false,
    },
];

export const truckerModel: NuvoModel = [
    {
        key: "email",
        label: "common.email",
        description: "trucker.import.userEmailDescription",
        example: "azerty@yopmail.com",
        columnType: "email",
        dropdownOptions: [],
        validations: [
            {
                validate: "unique",
                errorMessage: "trucker.import.duplicatedEmail",
            },
        ],
    },
    {
        key: "first_name",
        label: "settings.firstNameLabel",
        description: "trucker.import.userFirstNameDescription",
        example: "Tony",
        columnType: "string",
        validations: [
            {
                validate: "required",
                errorMessage: "trucker.import.requieredUserFirstName",
            },
        ],
    },
    {
        key: "last_name",
        label: "settings.lastNameLabel",
        description: "trucker.import.userLastNameDescription",
        example: "Dupont",
        columnType: "string",
        validations: [
            {
                validate: "required",
                errorMessage: "trucker.import.requieredUserLastName",
            },
        ],
    },
    {
        key: "remote_id",
        label: "fleet.import.remoteId",
        description: "fleet.import.remoteIdDescription",
        example: "other_software_id",
        columnType: "string",
        validations: [
            {
                validate: "unique",
                errorMessage: "fleet.import.duplicatedRemoteId",
            },
        ],
    },
    {
        key: "phone_number",
        label: "common.phoneNumber",
        description: "common.phoneNumber",
        columnType: "string",
        example: "+33601020304",
        validations: [
            {
                validate: "regex",
                regex: "^((?:\\+\\d{2}|0|00\\d{2})( |\\d)*)$",
                errorMessage: "addressBook.import.contactPhoneNumberValidation",
            },
        ],
    },
    {
        key: "phone_number_personal",
        label: "common.personalPhoneNumber",
        description: "common.personalPhoneNumber",
        columnType: "string",
        example: "+33601020304",
        validations: [
            {
                validate: "regex",
                regex: "^((?:\\+\\d{2}|0|00\\d{2})( |\\d)*)$",
                errorMessage: "addressBook.import.contactPhoneNumberValidation",
            },
        ],
    },
    {
        key: "address",
        label: "trucker.import.userAddress",
        description: "trucker.import.userAddress",
        columnType: "string",
    },
    {
        key: "city",
        label: "common.city",
        description: "common.city",
        columnType: "string",
    },
    {
        key: "postcode",
        label: "common.postcode",
        description: "common.postcode",
        columnType: "string",
    },
    {
        key: "country_code",
        label: "trucker.import.countryCode",
        description: "trucker.import.countryCode",
        example: "FR",
        columnType: "country_code_alpha_2",
        isMultiSelect: false,
    },
    {
        key: "adr_license_number",
        label: "trucker.import.adrLicenseNumber",
        description: "trucker.import.adrLicenseNumber",
        columnType: "string",
    },
    {
        key: "adr_license_deadline",
        label: "trucker.import.adrLicenseDeadline",
        description: "trucker.import.adrLicenseDeadline",
        columnType: UserSpecificDateType,
    },
    {
        key: "adr_license_type",
        label: "trucker.import.adrLicenseType",
        description: "trucker.import.adrLicenseType",
        example: "cistern",
        columnType: "category",
        dropdownOptions: [
            {
                label: "tank",
                value: "cistern",
                type: "string",
            },
            {
                label: "fleet.adrLicenseType.package",
                value: "package",
                type: "string",
            },
            {
                label: "common.both",
                value: "both",
                type: "string",
            },
        ],
    },
    {
        key: "carrist_license_deadline",
        label: "fleet.carristDriverLicense",
        description: "fleet.carristDriverLicense",
        columnType: UserSpecificDateType,
    },
    {
        key: "cqc_deadline",
        label: "trucker.import.cqcDeadline",
        description: "trucker.import.cqcDeadline",
        columnType: UserSpecificDateType,
    },
    {
        key: "cqc_number",
        label: "trucker.import.cqcNumber",
        description: "trucker.import.cqcNumber",
        columnType: "string",
    },
    {
        key: "cqc_original_delivery_date",
        label: "trucker.import.cqcOriginalDeliveryDate",
        description: "trucker.import.cqcOriginalDeliveryDate",
        columnType: UserSpecificDateType,
    },
    {
        key: "driver_card_deadline",
        label: "trucker.import.driverCardDeadline",
        description: "trucker.import.driverCardDeadline",
        columnType: UserSpecificDateType,
    },
    {
        key: "driver_card_number",
        label: "trucker.import.driverCardNumber",
        description: "trucker.import.driverCardNumber",
        columnType: "string",
    },
    {
        key: "driving_license_deadline",
        label: "fleet.drivingLicenceDeadline",
        description: "fleet.drivingLicenceDeadline",
        columnType: UserSpecificDateType,
    },
    {
        key: "driving_license_number",
        label: "fleet.drivingLicenseNumber",
        description: "fleet.drivingLicenseNumber",
        columnType: "string",
    },
    {
        key: "carrier",
        label: "trucker.import.carrierPK",
        description: "trucker.import.carrierPK",
        columnType: "int",
    },
    {
        key: "occupational_health_visit_deadline",
        label: "trucker.import.occupationalHealthVisitDeadline",
        description: "trucker.import.occupationalHealthVisitDeadline",
        columnType: UserSpecificDateType,
    },
];

export const addressesModel: NuvoModel = [
    {
        key: "is_shipper",
        label: "addressBook.import.isShipper",
        columnType: "boolean",
        validations: [
            {
                validate: "required",
            },
        ],
    },
    {
        key: "is_carrier",
        label: "addressBook.import.isCarrier",
        columnType: "boolean",
    },
    {
        key: "is_producer",
        label: "addressBook.import.isWasteProducer",
        columnType: "boolean",
    },
    {
        key: "is_organizer",
        label: "addressBook.import.isOrganizer",
        columnType: "boolean",
    },
    {
        key: "is_processor",
        label: "addressBook.import.isWasteProcessor",
        columnType: "boolean",
    },
    {
        key: "is_origin",
        label: "addressBook.import.isPickupAddress",
        columnType: "boolean",
    },
    {
        key: "is_destination",
        label: "addressBook.import.isDeliveryAddress",
        columnType: "boolean",
    },
    {
        key: "company_name",
        label: "addressBook.import.companyName",
        columnType: "string",
        validations: [
            {
                validate: "required",
            },
        ],
    },
    {
        key: "company_remote_id",
        label: "addressBook.import.companyRemoteId",
        description: "addressBook.import.companyRemoteIdDescription",
        columnType: "string",
    },
    {
        key: "invoicing_remote_id",
        label: "addressBook.import.invoicingRemoteId",
        columnType: "string",
    },
    {
        key: "notes",
        label: "addressBook.import.notes",
        columnType: "string",
    },
    {
        key: "address",
        label: "common.address",
        columnType: "string",
    },
    {
        key: "postcode",
        label: "common.postcode",
        columnType: "string",
        validations: [
            {
                validate: "required",
            },
        ],
    },
    {
        key: "city",
        label: "common.city",
        columnType: "string",
    },
    {
        key: "country",
        label: "common.country",
        example: "FR",
        columnType: "country_code_alpha_2",
        validations: [
            {
                validate: "required",
            },
        ],
        isMultiSelect: false,
    },
    {
        key: "latitude",
        label: "common.latitude",
        columnType: "float",
        validations: [
            {
                validate: "required_with",
                columns: ["longitude"],
            },
        ],
    },
    {
        key: "longitude",
        label: "common.longitude",
        columnType: "float",
        validations: [
            {
                validate: "required_with",
                columns: ["latitude"],
            },
        ],
    },
    {
        key: "coords_validated",
        label: "addressBook.import.coordsValidated",
        columnType: "boolean",
        validations: [
            {
                validate: "required_with_all",
                columns: ["latitude", "longitude"],
            },
        ],
    },
    {
        key: "trade_number",
        label: "components.tradeNumber",
        columnType: "string",
    },
    {
        key: "vat_number",
        label: "components.VATNumber",
        columnType: "string",
    },
    {
        key: "siren_number",
        label: "addressBook.import.sirenNumber",
        columnType: "string",
    },
    {
        key: "contact_name",
        label: "addressBook.import.contactName",
        columnType: "string",
    },
    {
        key: "contact_phone_number",
        label: "addressBook.import.contactPhoneNumber",
        example: "+33601020304",
        columnType: "string",
    },
    {
        key: "contact_email_address",
        label: "addressBook.import.contactEmailAddress",
        columnType: "email",
    },
    {
        key: "account_code",
        label: "invoicing.accountCode",
        columnType: "string",
    },
    {
        key: "side_account_code",
        label: "invoicing.sideAccountCode",
        columnType: "string",
    },
    {
        key: "enterprise_number",
        label: "waste.enterprise_number",
        columnType: "int",
    },
    {
        key: "eori_number",
        label: "waste.eori_number",
        columnType: "string",
    },
    {
        key: "producer_establishment_unit_number",
        label: "waste.establishmentUnitNumber.producer",
        columnType: "int",
    },
    {
        key: "processor_establishment_unit_number",
        label: "waste.establishmentUnitNumber.processor",
        columnType: "int",
    },
    {
        key: "sea_ship",
        label: "waste.sea_ship",
        columnType: "string",
    },
    {
        key: "is_citizen",
        label: "waste.citizen",
        columnType: "boolean",
    },
];

export const transportsModel: NuvoModel = [
    {
        key: "transport_order_number",
        label: "transport.import.orderNumber",
        columnType: "string",
    },
    {
        key: "shipper_remote_id",
        label: "components.remoteId",
        columnType: "string",
    },
    {
        key: "shipper_name",
        label: "scheduler.cardSettings.shipper_name",
        columnType: "string",
        validations: [
            {
                validate: "required",
            },
        ],
    },
    {
        key: "shipper_address",
        label: "transport.import.shipperAddress",
        columnType: "string",
    },
    {
        key: "shipper_postcode",
        label: "transport.import.shipperPostcode",
        columnType: "string",
    },
    {
        key: "shipper_city",
        label: "transport.import.shipperCity",
        columnType: "string",
    },
    {
        key: "shipper_country",
        label: "common.country",
        example: "FR",
        columnType: "country_code_alpha_2",
        isMultiSelect: false,
    },
    {
        key: "loading_site_name",
        label: "transport.import.loadingSiteName",
        columnType: "string",
    },
    {
        key: "loading_site_address",
        label: "transport.import.loadingSiteAddress",
        columnType: "string",
    },
    {
        key: "loading_site_postcode",
        label: "transport.import.loadingSitePostcode",
        columnType: "string",
    },
    {
        key: "loading_site_city",
        label: "transport.import.loadingSiteCity",
        columnType: "string",
    },
    {
        key: "loading_site_country_code",
        label: "transport.import.loadingSiteCountryCode",
        example: "FR",
        columnType: "country_code_alpha_2",
        isMultiSelect: false,
    },
    {
        key: "loading_date",
        label: "transport.import.loadingDate",
        columnType: UserSpecificDateType,
    },
    {
        key: "loading_hour",
        label: "transport.import.loadingHour",
        example: "08:00",
        columnType: "time_hm",
        validations: [
            {
                validate: "regex",
                regex: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
                errorMessage: "transport.import.HourValidation",
            },
        ],
    },
    {
        key: "unloading_site_name",
        label: "transport.import.unloadingSiteName",
        columnType: "string",
    },
    {
        key: "unloading_site_address",
        label: "transport.import.unloadingSiteAddress",
        columnType: "string",
    },
    {
        key: "unloading_site_postcode",
        label: "transport.import.unloadingSitePostcode",
        columnType: "string",
    },
    {
        key: "unloading_site_city",
        label: "transport.import.unloadingSiteCity",
        columnType: "string",
    },
    {
        key: "unloading_site_country_code",
        label: "transport.import.unloadingSiteCountryCode",
        example: "FR",
        columnType: "country_code_alpha_2",
        isMultiSelect: false,
    },
    {
        key: "unloading_date",
        label: "transport.import.unloadingDate",
        columnType: UserSpecificDateType,
    },
    {
        key: "unloading_hour",
        label: "transport.import.unloadingHour",
        example: "08:00",
        columnType: "time_hm",
        validations: [
            {
                validate: "regex",
                regex: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
                errorMessage: "transport.import.HourValidation",
            },
        ],
    },
    {
        key: "vehicle_license_plate",
        label: "transport.import.vehicleLicensePlate",
        description: "fleet.import.licensePlateDescription",
        example: "001VEH55",
        columnType: "string",
    },
    {
        key: "trailer_license_plate",
        label: "transport.import.trailerLicensePlate",
        example: "300HJU55",
        columnType: "string",
    },
    {
        key: "trucker_code",
        label: "transport.import.truckerCode",
        columnType: "string",
    },
    {
        key: "trucker_instructions",
        label: "components.truckerInstructions",
        columnType: "string",
    },
    {
        key: "delivery_category",
        label: "transport.import.deliveryCategory",
        columnType: "string",
    },
    {
        key: "delivery_description",
        label: "transport.import.deliveryDescription",
        columnType: "string",
    },
    {
        key: "weight",
        label: "common.weight",
        columnType: "string",
    },
    {
        key: "quantity",
        label: "common.quantity",
        columnType: "string",
    },
    {
        key: "complementary_informations_deliveries",
        label: "transport.import.deliveriesComplementaryInformations",
        columnType: "string",
    },
    {
        key: "volume_display_unit",
        label: "common.volume",
        description: "common.volume",
        columnType: "category",
        dropdownOptions: [
            {
                label: "shipment.volumeUnit.m3",
                value: "m3",
                type: "string",
            },
            {
                label: "shipment.volumeUnit.L",
                value: "L",
                type: "string",
            },
        ],
        isMultiSelect: false,
    },
];

export function getNuvoStyle() {
    type ButtonThemeVariantAPI = Exclude<ThemeAPI["buttons"], undefined>;

    const mapColor = (value: string | undefined) => {
        if (value === undefined) {
            return undefined;
        }

        const styleMap: {[index: string]: string} = {
            "blue.dark": theme.colors.blue.dark,
            "blue.default": theme.colors.blue.default,
            "blue.light": theme.colors.blue.light,
            "blue.ultralight": theme.colors.blue.ultralight,

            "grey.white": theme.colors.grey.white,
            "grey.ultralight": theme.colors.grey.ultralight,
            "grey.light": theme.colors.grey.light,
            "grey.default": theme.colors.grey.default,
            "grey.dark": theme.colors.grey.dark,
            "grey.ultradark": theme.colors.grey.ultradark,
            transparent: "transparent",
        };

        if (Object.prototype.hasOwnProperty.call(styleMap, value)) {
            return styleMap[value];
        } else {
            Logger.warn(`${value} is not mapped for Nuvo importer`);
            return undefined;
        }
    };

    const buttonsStyle: ButtonThemeVariantAPI = Object.keys(buttonVariants).reduce(
        (acc: ButtonThemeVariantAPI, bloc) => {
            if (bloc == "primary" || bloc == "secondary") {
                acc[bloc] = {
                    border: "1px solid",
                    ":hover, :active": {
                        border: "1px solid",
                        borderColor: "transparent",
                    },
                    ":focus": {
                        border: "1px solid",
                        backgroundColor: mapColor("grey.ultralight"),
                    },

                    backgroundColor: mapColor(buttonVariants[bloc].backgroundColor),
                    borderColor: mapColor(buttonVariants[bloc].borderColor ?? "transparent"),
                    color: mapColor(buttonVariants[bloc].color),
                    ":hover": {
                        backgroundColor: mapColor(
                            buttonVariants[bloc]["&:hover"]?.backgroundColor
                        ),
                    },
                };
            }

            return acc;
        },
        {}
    );

    return {
        globals: {
            textColor: theme.colors.grey.ultradark,
            fontFamily: theme.fonts["primary"],
            backgroundColor: theme.colors.grey.ultralight,
            primaryTextColor: theme.colors.grey.ultradark,
            secondaryTextColor: theme.colors.grey.ultradark,
        },
        buttons: buttonsStyle,
        columnMatch: {
            columnMatchHeader: {
                root: {
                    height: "5rem",
                },
            },
            columnMatchValue: {
                root: {
                    height: "5rem",
                },
            },
        },
    };
}

export function createEmptyReport(entityNames: TranslationKeys[]): ImportReportType {
    const report: ImportReportType = {
        importedEntities: [],
        notImportedEntities: [],
    };

    for (const entityName of entityNames) {
        report.importedEntities.push({name: entityName, details: []});
        report.notImportedEntities.push({
            name: entityName,
            details: [],
        });
    }

    return report;
}

export async function importAndFillReport(
    report: ImportReportType,
    entityName: TranslationKeys,
    importFunction: () => Promise<unknown>,
    entityIdentifier: string,
    lineNumber: number
) {
    const importedEntity = report.importedEntities.find((element) => element.name === entityName);
    const notImportedEntity = report.notImportedEntities.find(
        (element) => element.name === entityName
    );

    if (!importedEntity || !notImportedEntity) {
        throw `Unknown entity for this import report : ${entityName}`;
    }

    try {
        await importFunction();
        importedEntity.details.push(entityIdentifier);
    } catch (httpError: unknown) {
        const parsedErrors = await getErrorMessagesFromServerError(httpError);
        notImportedEntity.details.push({
            lineNumber: lineNumber,
            identifier: entityIdentifier,
            errorDetails: JSON.stringify(parsedErrors),
        });
    }
}

export function formatResultsDatetime(
    model: NuvoModel,
    results: ResultValues,
    timezone: string
): ResultValues {
    const columnsToFormat = model.filter(
        (column) => column.columnType == UserSpecificDateType || column.columnType == "time_hm"
    );
    for (const result of results) {
        let loadingFormattedDateString: string | null = null;
        let unloadingFormattedDateString: string | null = null;
        let unloadingZonedDate: Date | null = null;
        let loadingZonedDate: Date | null = null;
        for (const column of columnsToFormat) {
            if (column.columnType == UserSpecificDateType && result[column.key]) {
                if (column.key.includes("unloading")) {
                    let [year, month, day] = (result[column.key] as string).split("-");
                    unloadingZonedDate = new Date(
                        parseInt(year),
                        parseInt(month) - 1,
                        parseInt(day)
                    );
                    unloadingFormattedDateString = zoneDateToISO(unloadingZonedDate, timezone);
                } else {
                    let [year, month, day] = (result[column.key] as string).split("-");
                    loadingZonedDate = new Date(
                        parseInt(year),
                        parseInt(month) - 1,
                        parseInt(day)
                    );
                    loadingFormattedDateString = zoneDateToISO(loadingZonedDate, timezone);
                }
            }
            if (column.columnType == "time_hm" && result[column.key]) {
                if (column.key.includes("unloading")) {
                    if (!unloadingZonedDate) {
                        unloadingZonedDate = new Date();
                    }
                    unloadingZonedDate = parse(
                        result[column.key] as string,
                        "hh:mm a",
                        unloadingZonedDate
                    );
                    unloadingFormattedDateString = zoneDateToISO(unloadingZonedDate, timezone);
                } else {
                    if (!loadingZonedDate) {
                        loadingZonedDate = new Date();
                    }
                    loadingZonedDate = parse(
                        result[column.key] as string,
                        "hh:mm a",
                        loadingZonedDate
                    );
                    loadingFormattedDateString = zoneDateToISO(loadingZonedDate, timezone);
                }
            }
        }

        result["loading_datetime"] =
            loadingFormattedDateString !== null ? loadingFormattedDateString : null;
        result["unloading_datetime"] =
            unloadingFormattedDateString !== null ? unloadingFormattedDateString : null;
    }
    return results;
}
