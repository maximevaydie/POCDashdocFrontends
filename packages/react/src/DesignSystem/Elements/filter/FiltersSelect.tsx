import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Dropdown,
    Flex,
    DropdownProps,
    TextInputProps,
    ClickOutside,
    Text,
    TextInput,
} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {useToggle} from "dashdoc-utils";
import React, {
    FunctionComponent,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import Highlighter from "react-highlight-words";
import {MenuProps, OptionsType, components} from "react-select";

import {Checkbox} from "../choice/Checkbox";
import {Radio, RadioProps} from "../choice/Radio";
import {
    AsyncPaginatedSelect,
    AsyncSelect,
    Select as SyncSelect,
    AsyncPaginatedSelectProps,
    AsyncSelectProps,
    SelectOption,
    SelectOptionProps,
    SelectOptions,
    SelectProps,
} from "../choice/select2/Select";

type FiltersSelectCommonProps = {
    radioOptions?: SelectOptions<string>;
    radioOptionsLabel?: string;
    radioOptionsName?: RadioProps["name"];
    radioOptionsValue?: RadioProps["value"];
    onRadioOptionsChange?: RadioProps["onChange"];
    isSearchable?: boolean;
    onSelectAll?: (options: OptionsType<SelectOption>) => void;
    onUnselectAll?: (options: OptionsType<SelectOption>) => void;
    additionalFilterInputs?: Array<TextInputProps & {ComponentType: FunctionComponent}>;
    additionalFilterInputsLabel?: string;
    isSelectAll?: boolean;
    defaultSelectAllValue?: boolean;
    totalOptions?: number;
    isCurrentSearch?: boolean;
};

type FiltersSelectCommonPropsToOmit<CustomSelectProps> = Omit<
    Partial<CustomSelectProps>,
    "label" | "required" | "error" | "success"
>;

export type FiltersSelectProps = FiltersSelectCommonProps &
    FiltersSelectCommonPropsToOmit<SelectProps>;

type FiltersSelectAsyncProps = FiltersSelectCommonProps &
    FiltersSelectCommonPropsToOmit<AsyncSelectProps>;

export type FiltersSelectAsyncPaginatedProps = FiltersSelectCommonProps &
    FiltersSelectCommonPropsToOmit<AsyncPaginatedSelectProps>;

const NoPointerEventWrapper = styled(Box)`
    pointer-events: none;
`;

const onSelectAllContext = createContext({
    onSelectAll: null,
    onUnselectAll: null,
    isSelectAll: false,
    isCurrentSearch: false,
    defaultSelectAllValue: false,
    totalOptions: 0,
});

const MenuWithSelectAll = (props: MenuProps<SelectOption, true>) => {
    const {
        onSelectAll,
        onUnselectAll,
        isSelectAll,
        isCurrentSearch,
        defaultSelectAllValue,
        totalOptions,
    } = useContext(onSelectAllContext);

    const hasUnselectedOption =
        props.options.findIndex(
            (option) => props.getValue()?.findIndex((val) => val.pk === option.pk) === -1
        ) >= 0;

    const [allSelectValue, setAllSelectValue] = useState<boolean>(defaultSelectAllValue);

    useEffect(() => {
        if (defaultSelectAllValue != allSelectValue) {
            setAllSelectValue(defaultSelectAllValue);
        }
    }, [defaultSelectAllValue]);

    const handleOnSelectAll = () => {
        setAllSelectValue(!allSelectValue);
        if (allSelectValue) {
            // @ts-ignore
            onUnselectAll();
        } else {
            // @ts-ignore
            onSelectAll();
        }
    };

    const handleOnSelectByResults = () => {
        if (hasUnselectedOption) {
            // @ts-ignore
            onSelectAll(props.options);
        } else {
            // @ts-ignore
            onUnselectAll(props.options);
        }
    };

    const renderSelectByResults = () => {
        return (
            <Button
                onClick={handleOnSelectByResults}
                variant="plain"
                data-testid="filter-select-all-results"
                type="button" // to fix weird bug where the button is consider as submit type
            >
                {hasUnselectedOption
                    ? t("common.selectResultCount", {
                          smart_count: props.options?.length,
                      })
                    : t("common.unselectResultCount", {
                          smart_count: props.options?.length,
                      })}
            </Button>
        );
    };

    const renderSelectAll = () => {
        return allSelectValue ? (
            <Flex
                backgroundColor="blue.ultralight"
                p={4}
                flexDirection="column"
                style={{rowGap: 8}}
            >
                <Text>{t("filter.criteriaDetails")}</Text>
                <Text>{t("common.addressesMatching", {smart_count: totalOptions})}</Text>
                <Button
                    onClick={handleOnSelectAll}
                    variant="none"
                    backgroundColor="blue.ultralight"
                    color="blue.default"
                    justifyContent="start"
                >
                    {t("filter.deleteOrUpdate")}
                </Button>
            </Flex>
        ) : !isCurrentSearch && !allSelectValue ? (
            <Text variant="caption" lineHeight="16px" mx={1} color="grey.dark">
                {t("filter.selectOneByOne", {
                    type: t("common.addresses", {smart_count: totalOptions}),
                })}
            </Text>
        ) : (
            <Button
                onClick={handleOnSelectAll}
                variant="plain"
                textAlign="left"
                data-testid="select-all-addresses-button"
            >
                {t("filter.selectByCriteria", {
                    type: t("common.addresses", {smart_count: totalOptions}),
                    smart_count: totalOptions,
                })}
            </Button>
        );
    };

    const renderSelect = () => {
        if (isSelectAll) {
            return renderSelectAll();
        }
        return renderSelectByResults();
    };

    return (
        <>
            <Flex fontSize={1} justifyContent="space-between" alignItems="center">
                {onSelectAll && onUnselectAll && props.options.length > 0 && (
                    <Box m={2}>{renderSelect()}</Box>
                )}
            </Flex>
            {!allSelectValue && <components.Menu {...props}>{props.children}</components.Menu>}
        </>
    );
};

const FiltersSelectOption = ({
    innerProps,
    value,
    isSelected,
    isDisabled,
    data,
    selectProps,
}: SelectOptionProps) => {
    const {
        value: selectValue,
        inputValue,
        getOptionLabel,
        formatOptionLabel: customFormatOptionLabel,
    } = selectProps;

    const defaultFormatOptionLabel: SelectOptionProps["selectProps"]["formatOptionLabel"] = (
        data,
        {inputValue}
    ) => (
        <Highlighter
            autoEscape={true}
            sanitize={(str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}
            searchWords={[inputValue]}
            // @ts-ignore
            textToHighlight={getOptionLabel(data)}
        />
    );

    const formatOptionLabel = customFormatOptionLabel || defaultFormatOptionLabel;
    const label = useMemo(
        () =>
            formatOptionLabel(data, {
                context: "menu",
                // @ts-ignore
                inputValue,
                // @ts-ignore
                selectValue,
            }),
        [formatOptionLabel, data, inputValue, selectValue]
    );
    return (
        <Box
            className="Select__option"
            data-testid={`menu-option-${
                typeof data.value === "string" ? data.value : getOptionLabel?.(data)
            }`}
            {...innerProps}
        >
            <NoPointerEventWrapper px={3}>
                <Checkbox
                    checked={isSelected}
                    // @ts-ignore
                    value={value.toString()}
                    label={label}
                    disabled={isDisabled}
                />
            </NoPointerEventWrapper>
        </Box>
    );
};

type FiltersSelectBaseComponentProps =
    | FiltersSelectProps
    | FiltersSelectAsyncProps
    | FiltersSelectAsyncPaginatedProps;

const FiltersSelectionComponent: FunctionComponent<
    FiltersSelectBaseComponentProps & {
        Select?: FunctionComponent<SelectProps | AsyncSelectProps | AsyncPaginatedSelectProps>;
    }
> = ({
    Select = SyncSelect,
    radioOptions = [],
    radioOptionsLabel,
    radioOptionsName,
    radioOptionsValue,
    onRadioOptionsChange,
    isSearchable = true,
    onSelectAll,
    onUnselectAll,
    isSelectAll,
    defaultSelectAllValue,
    additionalFilterInputs,
    additionalFilterInputsLabel,
    defaultInputValue,
    totalOptions,
    ...props
}) => {
    const [inputValue, setInputValue] = useState(defaultInputValue || "");

    useEffect(() => {
        if (defaultInputValue != inputValue) {
            // @ts-ignore
            setInputValue(defaultInputValue);
        }
    }, [defaultInputValue]);

    const onInputChange: FiltersSelectBaseComponentProps["onInputChange"] = (
        newValue,
        {action}
    ) => {
        if (action === "input-change") {
            setInputValue(newValue);
            props.onInputChange?.(newValue, {action});
        }
    };

    const selectSubComponents = {
        // @ts-ignore
        DropdownIndicator: null as typeof components.DropdownIndicator,
        // @ts-ignore
        IndicatorSeparator: null as typeof components.IndicatorSeparator,
        Option: FiltersSelectOption,
        Menu: MenuWithSelectAll,
    };

    const selectStyle = useMemo(() => {
        return {
            control: (provided: any) =>
                isSearchable
                    ? {
                          ...provided,
                          margin: 8,
                          marginBottom: additionalFilterInputs ? "42px" : onSelectAll ? 0 : 8,
                          width: "auto",
                          "pointer-events": defaultSelectAllValue ? "none" : "auto",
                          backgroundColor: defaultSelectAllValue ? "#f9fafb" : "#fffff",
                      }
                    : {display: "none"},
            menu: () => ({
                boxShadow: "none",
                paddingTop: isSearchable ? (onSelectAll ? 0 : 4) : 8,
            }),
            input: () => ({
                color: defaultSelectAllValue ? "#919eab" : "#000",
            }),
        };
    }, [isSearchable, additionalFilterInputs, onSelectAll, defaultSelectAllValue]);

    const isCurrentSearch =
        additionalFilterInputs?.some(
            (additionalFilterInput: any) => additionalFilterInput?.value
        ) || !!defaultInputValue;

    return (
        <>
            {!!radioOptions.length && (
                <Box py={3} borderBottom="1px solid" borderColor="grey.light">
                    {radioOptionsLabel && (
                        <Text variant="h2" px={4} mb={4}>
                            {radioOptionsLabel}
                        </Text>
                    )}
                    {radioOptions.map(({label, value}) => (
                        <Box px={3} key={`${label}-${value}`}>
                            <Radio
                                name={radioOptionsName}
                                label={label}
                                value={value}
                                onChange={onRadioOptionsChange}
                                checked={radioOptionsValue === value}
                            />
                        </Box>
                    ))}
                </Box>
            )}
            {additionalFilterInputsLabel && (
                <Text variant="h2" px={4} my={2}>
                    {additionalFilterInputsLabel}
                </Text>
            )}
            <Box position="relative">
                {/*
// @ts-ignore */}
                {additionalFilterInputs?.length > 0 && (
                    <Flex
                        flex={1}
                        width="100%"
                        px={2}
                        position="absolute"
                        top="42px"
                        zIndex="level1"
                    >
                        {/*
// @ts-ignore */}
                        {additionalFilterInputs.map(
                            ({ComponentType = TextInput, ...additionalFilterInput}, idx) => (
                                <Flex ml={idx > 0 ? 1 : 0} key={`filter-input-${idx}`}>
                                    <ComponentType height="38px" {...additionalFilterInput} />
                                </Flex>
                            )
                        )}
                    </Flex>
                )}
                <onSelectAllContext.Provider
                    value={{
                        // @ts-ignore
                        onSelectAll,
                        // @ts-ignore
                        onUnselectAll,
                        // @ts-ignore
                        isSelectAll,
                        isCurrentSearch,
                        // @ts-ignore
                        defaultSelectAllValue,
                        // @ts-ignore
                        totalOptions,
                    }}
                >
                    <Select
                        {...props}
                        isMulti
                        menuIsOpen
                        backspaceRemovesValue={false}
                        components={selectSubComponents}
                        controlShouldRenderValue={false}
                        hideSelectedOptions={false}
                        tabSelectsValue={false}
                        isClearable={false}
                        inputValue={inputValue}
                        onInputChange={onInputChange}
                        styles={selectStyle}
                    />
                </onSelectAllContext.Provider>
            </Box>
        </>
    );
};

type SelectLabelProps = {
    selectionOnly?: boolean;
} & Pick<DropdownProps, "label" | "leftIcon">;
const FiltersSelectBaseComponent: FunctionComponent<
    FiltersSelectBaseComponentProps &
        SelectLabelProps & {
            Select?: FunctionComponent<SelectProps | AsyncSelectProps | AsyncPaginatedSelectProps>;
        }
> = ({label, leftIcon, "data-testid": dataTestId, selectionOnly, ...props}) => {
    const [isOpen, open, close] = useToggle();

    return selectionOnly ? (
        <FiltersSelectionComponent {...props} data-testid={dataTestId} />
    ) : (
        <ClickOutside
            reactRoot={document.getElementById("react-app-modal-root")}
            onClickOutside={close}
        >
            <Dropdown
                label={label}
                isOpen={isOpen}
                onOpen={open}
                onClose={close}
                leftIcon={leftIcon}
                data-testid={dataTestId}
            >
                <FiltersSelectionComponent {...props} />
            </Dropdown>
        </ClickOutside>
    );
};

const FiltersSelect: FunctionComponent<FiltersSelectProps & SelectLabelProps> = (props) => (
    <FiltersSelectBaseComponent {...props} />
);

const FiltersAsyncSelect: FunctionComponent<FiltersSelectAsyncProps & SelectLabelProps> = (
    props
) => <FiltersSelectBaseComponent Select={AsyncSelect} {...props} />;

const FiltersAsyncPaginatedSelect: FunctionComponent<
    FiltersSelectAsyncPaginatedProps & SelectLabelProps
> = (props) => <FiltersSelectBaseComponent Select={AsyncPaginatedSelect} {...props} />;

export {FiltersAsyncPaginatedSelect, FiltersAsyncSelect, FiltersSelect, FiltersSelectOption};
