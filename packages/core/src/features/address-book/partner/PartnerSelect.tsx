import {t} from "@dashdoc/web-core";
import {
    AsyncPaginatedCreatableSelect,
    AsyncPaginatedSelect,
    AsyncPaginatedSelectProps,
    Flex,
    Icon,
    Text,
    mergeSelectStyles,
    select2Service,
} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {useToggle} from "dashdoc-utils";
import debounce from "debounce-promise";
import React, {useMemo} from "react";
import {ActionMeta, FormatOptionLabelMeta, OptionTypeBase} from "react-select";
import {LoadOptions} from "react-select-async-paginate";

import {PartnerSelectOption} from "./components/PartnerSelectOption";

import type {
    CarrierInListOutput,
    PartnerCategory,
    PartnerInListOutput,
} from "../../../types/partnerTypes";
import type {Response} from "react-select-async-paginate";

type Props<T = CarrierInListOutput | PartnerInListOutput> = Partial<
    Omit<AsyncPaginatedSelectProps, "onChange">
> & {
    displayTooltip?: boolean;
    variant?: PartnerCategory; // use an dedicated label of the create option
    onCreate?: (name: string) => void;
    onChange: (partner: T | null, action: ActionMeta<OptionTypeBase>) => void;
    loadPartners: (input: string, page: number) => Promise<Response<T, {page: number}>>;
    ["data-testid"]?: string;
};

type PartnerOption =
    | CarrierInListOutput
    | PartnerInListOutput
    | {
          __isNew__: boolean;
          label: string;
      };

export function PartnerSelect<T = CarrierInListOutput | PartnerInListOutput>({
    displayTooltip,
    variant,
    styles = {},
    onChange,
    onCreate,
    loadPartners,
    ...props
}: Props<T>) {
    const [isLoading, startLoading, stopLoading] = useToggle(false);
    const debouncedLoadOptions: LoadOptions<T, {page: number}> = useMemo(
        () =>
            debounce(
                async (input: string, _: any, {page}: {page: number}) => {
                    startLoading();
                    try {
                        return await loadPartners(input, page);
                    } finally {
                        stopLoading();
                    }
                },
                1000,
                {
                    leading: true,
                }
            ),
        [startLoading, stopLoading, loadPartners]
    );

    const SelectComponent = onCreate ? AsyncPaginatedCreatableSelect : AsyncPaginatedSelect;
    const creatableProps = onCreate
        ? {
              formatCreateLabel: (value: string) => (
                  <CreatePartnerOption value={value} variant={variant} />
              ),
              isValidNewOption: () => true,
              onCreateOption: onCreate,
          }
        : null;

    const selectRef = React.useRef(null);
    const selectStyles = useMemo(
        () =>
            mergeSelectStyles(
                {
                    valueContainer: (provided, {selectProps: {label}}) => ({
                        ...provided,
                        height: label ? "5em" : "4em",
                    }),
                    singleValue: (provided, {selectProps: {label}}) => ({
                        ...provided,
                        ...(label && {top: "30%"}),
                    }),
                    menu: (provided) => ({
                        ...provided,
                        maxHeight: "400px",
                    }),
                },
                styles
            ),
        [styles]
    );

    return (
        <SelectComponent
            ref={selectRef}
            defaultOptions
            data-testid={props["data-testid"]}
            isLoading={isLoading}
            placeholder={t("components.searchAPartner")}
            loadOptions={debouncedLoadOptions}
            getOptionValue={getOptionValue}
            formatOptionLabel={formatOptionLabel}
            styles={selectStyles}
            onChange={handleChange}
            {...creatableProps}
            {...props}
            blurInputOnSelect
        />
    );

    function getOptionValue(option: PartnerOption) {
        if ("__isNew__" in option) {
            return option.label;
        }
        return option.pk.toString();
    }

    function formatOptionLabel(
        option: PartnerOption,
        meta: FormatOptionLabelMeta<PartnerOption, false>
    ) {
        if ("__isNew__" in option) {
            return option.label;
        }
        const {context} = meta;
        const isFocused =
            displayTooltip && context === "menu" && select2Service.isFocused(selectRef, option);

        return (
            <PartnerSelectOption
                isFocused={isFocused}
                partner={option}
                isMenuContext={context === "menu"}
                css={css`
                    line-height: 20px;
                    padding: 5px 0px;
                `}
            />
        );
    }

    function handleChange(partner: OptionTypeBase | null, action: ActionMeta<OptionTypeBase>) {
        onChange(partner as T, action);
    }
}

function CreatePartnerOption({value, variant}: {value: string; variant?: PartnerCategory}) {
    let label = t("components.addPartner", undefined, {capitalize: true});
    if (variant === "carrier") {
        label = t("transportsForm.addCarrier", undefined, {capitalize: true});
    } else if (variant === "shipper") {
        label = t("transportsForm.addShipper", undefined, {capitalize: true});
    }

    if (value) {
        label = t("common.add") + " : " + value;
    }

    return (
        <Flex alignItems="center">
            <Icon name="add" mr={1} color="inherit" />
            <Text color="inherit">{label}</Text>
        </Flex>
    );
}
