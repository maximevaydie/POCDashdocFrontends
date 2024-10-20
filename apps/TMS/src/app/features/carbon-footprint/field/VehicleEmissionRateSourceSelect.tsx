import {t} from "@dashdoc/web-core";
import {Box, Select, Text} from "@dashdoc/web-ui";
import groupBy from "lodash.groupby";
import React, {useMemo} from "react";

import {GenericVehicleEmissionRate} from "app/services/carbon-footprint/genericEmissionRateApi.service";

const CATEGORY_ORDER: Record<GenericVehicleEmissionRate["category"], number> = {
    articulated: 0,
    rigid: 1,
    utility: 2,
    light_duty_vehicle: 3,
    national_average: 4,
};

function EmissionRateSourceOption({
    emissionRateSource,
    locale,
}: {
    emissionRateSource: GenericVehicleEmissionRate;
    locale: string;
}) {
    return (
        <Box>
            <Text color="inherit" flex={1} lineHeight={1}>
                {locale === "fr"
                    ? emissionRateSource.french_label
                    : emissionRateSource.english_label}
            </Text>
            <Text ellipsis flex={1} color="inherit" variant="caption" lineHeight={1}>
                {Math.round(emissionRateSource.value * 1000) / 1000}{" "}
                {t("components.requestedVehicle.emissionRateUnit")}
            </Text>
        </Box>
    );
}

type Props = {
    error?: string;
    emissionRateSources: GenericVehicleEmissionRate[];
    onChange: (value: GenericVehicleEmissionRate) => void;
    value?: GenericVehicleEmissionRate;
    locale: string;
    label?: string;
} & Parameters<typeof Select>[0];

export function VehicleEmissionRateSourceSelect({
    error,
    emissionRateSources,
    onChange,
    value,
    locale,
    label,
    ...props
}: Props) {
    const groupedOptions = useMemo(() => {
        const x = groupBy(emissionRateSources, ({category}) => category);
        return Object.entries(x).map(
            ([category, options]) =>
                ({
                    label: category,
                    options,
                }) as {
                    label: GenericVehicleEmissionRate["category"];
                    options: GenericVehicleEmissionRate[];
                }
        );
    }, [emissionRateSources]);

    const sortedGroupedOptions = useMemo(() => {
        // Sort the categories
        const categorySorted = groupedOptions.sort(
            (a, b) => CATEGORY_ORDER[a.label] - CATEGORY_ORDER[b.label]
        );
        // Sort the options by alphabetical order within each category
        return categorySorted.map((category) => ({
            ...category,
            options: category.options.sort((a, b) => {
                if (locale === "fr") {
                    return a.french_label.localeCompare(b.french_label);
                }
                return a.english_label.localeCompare(b.english_label);
            }),
        }));
    }, [groupedOptions, locale]);

    const categoryTranslations: Record<GenericVehicleEmissionRate["category"], string> = {
        articulated: t("components.requestedVehicle.category.articulated"),
        rigid: t("components.requestedVehicle.category.rigid"),
        utility: t("components.requestedVehicle.category.utility"),
        light_duty_vehicle: t("components.requestedVehicle.category.lightDutyVehicle"),
        national_average: t("components.requestedVehicle.category.nationalAverage"),
    };

    return (
        <Select
            label={label || t("components.requestedVehicle.emissionRateSource")}
            error={error}
            options={sortedGroupedOptions}
            getOptionValue={({uid}) => uid}
            getOptionLabel={({english_label, french_label}) =>
                locale === "fr" ? french_label : english_label
            }
            formatOptionLabel={(emissionRateSource: GenericVehicleEmissionRate) => {
                return (
                    <EmissionRateSourceOption
                        emissionRateSource={emissionRateSource}
                        locale={locale}
                    />
                );
            }}
            formatGroupLabel={({label}) =>
                categoryTranslations[label as GenericVehicleEmissionRate["category"]]
            }
            onChange={onChange}
            value={value}
            placeholder={t("components.requestedVehicle.emisisonRateSourcePlaceholder")}
            styles={{
                valueContainer: (provided, {selectProps: {label}}) => ({
                    ...provided,
                    height: label ? "6em" : "5em",
                }),
                singleValue: (provided, {selectProps: {label}}) => ({
                    ...provided,
                    ...(label && {top: "28%"}),
                }),
                menu: (provided) => ({
                    ...provided,
                    maxHeight: "600px",
                }),
            }}
            maxMenuHeight={600}
            {...props}
        />
    );
}
