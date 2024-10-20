import {BoxProps, TextInputProps, TextInput, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React, {forwardRef} from "react";
import PhoneInput, {Props as PhoneInputProps} from "react-phone-number-input";
import de from "react-phone-number-input/locale/de.json";
import en from "react-phone-number-input/locale/en.json";
import fr from "react-phone-number-input/locale/fr.json";
import nl from "react-phone-number-input/locale/nl.json";
import "react-phone-number-input/style.css";

export type PhoneNumberInputProps = BoxProps &
    PhoneInputProps<Omit<TextInputProps, "ref">> & {
        error?: boolean | string;
        language: string;
    };

const labelsByLanguage: Record<string, any> = {
    fr,
    de,
    nl,
    en,
};

function _FlexTextInput(props: TextInputProps, ref: React.Ref<HTMLInputElement>) {
    return <TextInput {...props} containerProps={{flex: 1}} ref={ref} />;
}

const FlexTextInput = forwardRef(_FlexTextInput);

function _PhoneNumberInput({language, ...props}: PhoneNumberInputProps) {
    return (
        <PhoneInput
            {...props}
            labels={labelsByLanguage[language] ?? en}
            inputComponent={FlexTextInput}
        />
    );
}

export const PhoneNumberInput: React.ComponentType<PhoneNumberInputProps> = styled(
    _PhoneNumberInput
)(() =>
    themeAwareCss({
        flexDirection: "row",
        alignItems: "inherit",
        flex: 1,
        /* Force a top position to avoid an UX issue with country selector */
        label: {
            top: "8px",
            lineHeight: "16px",
            fontSize: "12px",
        },
        "input.PhoneInputInput": {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
        },
        /* Position the country selector */
        "div.PhoneInputCountry": {
            paddingTop: "2px",
            paddingLeft: "14px",
            lineHeight: "20px",
            width: "56px",
            borderTopLeftRadius: 1,
            borderBottomLeftRadius: 1,
            marginRight: "-2px",
            border: "1px solid",
            borderColor: "grey.light",
        },
    })
);
