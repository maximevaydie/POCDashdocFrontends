import {
    BuildConstants,
    LocaleOption,
    localeService,
    SUPPORTED_LOCALES_OPTIONS,
} from "@dashdoc/web-core";
import {Box, Select, SelectProps} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {StaticImage} from "../../misc/StaticImage";

const languageSelectOption = ({value, label}: LocaleOption, displayFlagsAndCountries?: boolean) =>
    displayFlagsAndCountries ? (
        <Box>
            <StaticImage
                width="20px"
                marginRight={2}
                borderWidth="1px"
                borderColor="neutral.lighterTransparentBlack"
                borderStyle="solid"
                src={`flags/${value}.png`}
            />
            {label}
        </Box>
    ) : (
        // @ts-ignore 'value' is possibly 'undefined'.ts(18048)
        <Box>{value.toUpperCase()}</Box>
    );

type LanguageSelectProps = Partial<SelectProps<LocaleOption>> & {
    displayFlagsAndCountries?: boolean;
};

export const LanguageSelect: FunctionComponent<LanguageSelectProps> = ({
    displayFlagsAndCountries,
    ...otherProps
}) => {
    // We use the `BuildConstants.language` that deals with the current session language
    const value = localeService.getLocaleOption(BuildConstants.language);
    return (
        <Select
            options={SUPPORTED_LOCALES_OPTIONS}
            data-testid="navbar-language-selector"
            isSearchable={false}
            isClearable={false}
            formatOptionLabel={(option) => languageSelectOption(option, displayFlagsAndCountries)}
            styles={
                displayFlagsAndCountries
                    ? {}
                    : {
                          indicatorSeparator: (base) => ({
                              ...base,
                              display: "none",
                          }),
                      }
            }
            value={value}
            {...otherProps}
        />
    );
};
