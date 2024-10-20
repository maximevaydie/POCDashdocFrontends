import {theme, themeAwareCss} from "@dashdoc/web-ui";
import omit from "lodash.omit";
import {Theme, defaultTheme as reactSelectDefaultTheme} from "react-select";

import {getInputStylesFromProps} from "../../input/input2/Input";

import {ReactSelectStyles} from "./reactSelectComponents";
import {CommonProps} from "./types";

const defaultTheme: Theme = {
    ...reactSelectDefaultTheme,
    borderRadius: theme.radii[1],
    spacing: {...reactSelectDefaultTheme.spacing, controlHeight: 38},
    colors: {
        ...reactSelectDefaultTheme.colors,
        primary: theme.colors.blue.default,
        primary75: theme.colors.blue.light,
        primary50: theme.colors.blue.ultralight,
        primary25: theme.colors.grey.light,
        danger: theme.colors.red.default,
        dangerLight: theme.colors.red.ultralight,
    },
};

export const getTheme = ({label}: CommonProps): Theme =>
    label
        ? {...defaultTheme, spacing: {...defaultTheme.spacing, controlHeight: 48}}
        : defaultTheme;

type Control = NonNullable<NonNullable<ReactSelectStyles>["control"]>;
type Placeholder = NonNullable<NonNullable<ReactSelectStyles>["placeholder"]>;
type ValueContainer = NonNullable<NonNullable<ReactSelectStyles>["valueContainer"]>;
type SingleValue = NonNullable<NonNullable<ReactSelectStyles>["singleValue"]>;
type MultiValue = NonNullable<NonNullable<ReactSelectStyles>["multiValue"]>;
type MultiValueLabel = NonNullable<NonNullable<ReactSelectStyles>["multiValueLabel"]>;
type Option = NonNullable<NonNullable<ReactSelectStyles>["option"]>;

export const defaultStyles: NonNullable<ReactSelectStyles> = {
    control: (provided: Parameters<Control>[0], props: Parameters<Control>[1]) => {
        const {isFocused, isDisabled, selectProps} = props;
        const {label, error, success} = selectProps;

        const inputStyles = getInputStylesFromProps({error, success});

        const stylePropertiesToOmit = [
            "&:focus",
            "&:disabled",
            "::placeholder",
            "color",
            "border",
        ];
        if (isFocused) {
            stylePropertiesToOmit.push("&:hover");
        }
        if (!label) {
            stylePropertiesToOmit.push("lineHeight");
        }

        return {
            ...provided,
            ...themeAwareCss({
                ...omit(inputStyles, stylePropertiesToOmit),
                ...(isFocused && omit(inputStyles["&:focus"], "border")),
                ...(isDisabled && omit(inputStyles["&:disabled"], "border")),
                padding: 0,
            })(theme),
        };
    },
    input: (provided) => ({
        ...provided,
        padding: 0,
        margin: 0,
    }),
    placeholder: (provided: Parameters<Placeholder>[0], props: Parameters<Placeholder>[1]) => {
        const {
            selectProps: {label},
            isFocused,
        } = props;
        return {
            ...provided,
            ...themeAwareCss({
                margin: 0,
                paddingRight: 4,
                maxWidth: "100%",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: label ? "grey.dark" : "grey.dark",
                ...(props.isMulti && {
                    paddingX: 1,
                }),
            })(theme),
            ...(label && {
                transform: "none",
            }),
            ...(label &&
                !isFocused && {
                    display: "none",
                }),
        };
    },
    valueContainer: (
        provided: Parameters<ValueContainer>[0],
        props: Parameters<ValueContainer>[1]
    ) => ({
        ...provided,
        ...themeAwareCss({
            paddingY: 0,
            paddingX: 3,
            ...(props.isMulti && {
                lineHeight: 1,
                paddingY: 0,
                paddingX: 2,
            }),
            ...(props.selectProps.label && {
                paddingY: props.hasValue ? 1 : 2,
                paddingTop: "22px",
                paddingBottom: "6px",
                lineHeight: "20px",
            }),
        })(theme),
    }),
    singleValue: (provided: Parameters<SingleValue>[0], props: Parameters<SingleValue>[1]) => ({
        ...provided,
        margin: 0,
        ...(props.selectProps.label && {
            transform: "none",
        }),
        "& i": themeAwareCss({color: "blue.default"})(theme), // so all icons will always be blue
    }),
    multiValue: (provided: Parameters<MultiValue>[0], props: Parameters<MultiValue>[1]) => ({
        ...provided,
        ...themeAwareCss({
            margin: 1,
            borderRadius: 1,
            paddingLeft: 2,
            ...(props.selectProps.label && {
                marginY: 0,
                lineHeight: 0,
            }),
        })(theme),
    }),
    multiValueLabel: (provided: Parameters<MultiValueLabel>[0]) => ({
        ...provided,
        paddingTop: 0,
        paddingBottom: 0,
    }),
    option: (provided: Parameters<Option>[0], {data, isSelected}: Parameters<Option>[1]) => {
        return {
            ...provided,
            ...(data.__isNew__ && !isSelected && themeAwareCss({color: "blue.default"})(theme)),
            "& i": themeAwareCss({color: isSelected ? "grey.white" : "blue.default"})(theme), // so all icons will always be blue (or white if selected)
        };
    },
};
