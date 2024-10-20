import {TranslationKeys} from "@dashdoc/web-core";
import {ColumnAPI, ColumnType, DropdownOptionAPI, ValidatorAPI} from "nuvo-react";

export const UserSpecificDateType = "CUSTOMIZABLE_DATE_COLUMN_TYPE";

export type NuvoValidator = Omit<ValidatorAPI, "errorMessage"> & {
    errorMessage?: TranslationKeys;
};
export type NuvoDropdownOption = Omit<DropdownOptionAPI, "label"> & {
    label: TranslationKeys;
};
type NuvoColumn = Omit<
    ColumnAPI,
    "label" | "description" | "validations" | "dropdownOptions" | "columnType"
> & {
    label: TranslationKeys;
    description?: TranslationKeys;
    validations?: NuvoValidator[];
    dropdownOptions?: NuvoDropdownOption[];
    columnType?: ColumnType | typeof UserSpecificDateType;
};
export type NuvoModel = NuvoColumn[];
