import {t} from "@dashdoc/web-core";
import {TranslationKeys} from "@dashdoc/web-core";
import {Box, Select} from "@dashdoc/web-ui";
import {ColumnType} from "nuvo-react";
import React from "react";

export type DateFormat = {
    key: "standard" | "us";
    columnType: ColumnType;
    alternativeMatches: string[];
    example: string;
};
export const availableDateFormats: DateFormat[] = [
    {
        key: "standard",
        columnType: "date_iso",
        alternativeMatches: [],
        example: "2023-01-30",
    },
    {
        key: "us",
        columnType: "date_mdy",
        alternativeMatches: [],
        example: "01.30.2023",
    },
];
export const DateFormatPicker = ({
    onPick,
    value,
}: {
    onPick: (value: DateFormat) => void;
    value: DateFormat;
}) => {
    const labelMap: {standard: TranslationKeys; us: TranslationKeys} = {
        us: "fleet.usDateFormat",
        standard: "fleet.standardDateFormat",
    };

    return (
        <Box>
            {t("fleet.dateFormatPicker")}
            <Box flex={1} minWidth="220px" maxWidth="300px" mb={2} ml={0} mt={2}>
                <Select
                    label={t("common.dateFormat")}
                    value={{label: t(labelMap[value.key]), value: value}}
                    onChange={(option: {label: string; value: DateFormat}) => onPick(option.value)}
                    isClearable={false}
                    isSearchable={false}
                    options={availableDateFormats.map((format: DateFormat) => {
                        return {
                            label: t(labelMap[format.key]),
                            value: format,
                        };
                    })}
                />
            </Box>
        </Box>
    );
};
