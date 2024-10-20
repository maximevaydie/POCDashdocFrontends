import {t} from "@dashdoc/web-core";
import {Box, ErrorMessage, PhoneNumberInput, PhoneNumberInputProps} from "@dashdoc/web-ui";
import {CountryCode} from "libphonenumber-js/types";
import React, {FunctionComponent} from "react";
import {type Value} from "react-phone-number-input";
import {useSelector} from "react-redux";

import {getConnectedManager} from "../../../../react/Redux/accountSelector";

type Props = Omit<PhoneNumberInputProps, "language" | "defaultCountry"> & {
    country: CountryCode | undefined;
};

export const LocalizedPhoneNumberInput: FunctionComponent<Props> = (props) => {
    const connectedManager = useSelector(getConnectedManager);
    const language = connectedManager?.language ?? "en";
    const {onChange: originalOnChange, country, error, ...remainingProps} = props;

    return (
        <Box>
            <PhoneNumberInput
                label={t("common.phoneNumber")}
                defaultCountry={country}
                language={language}
                onChange={onChange}
                error={!!error}
                {...remainingProps}
            />
            {typeof error === "string" && <ErrorMessage error={error as string} />}
        </Box>
    );

    function onChange(value?: Value) {
        // Always return a string
        // Fix BUG-3611 where it would return `undefined` which out APIScope strip from the payload
        // so it was impossible to remove a phone number.
        originalOnChange?.(value ?? ("" as Value));
    }
};
