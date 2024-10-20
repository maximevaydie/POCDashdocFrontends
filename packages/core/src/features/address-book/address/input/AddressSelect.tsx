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
import {ExtractedNewAddress, OriginalAddress, useToggle} from "dashdoc-utils";
import debounce from "debounce-promise";
import React, {FunctionComponent, useMemo} from "react";
import {ActionMeta, FormatOptionLabelMeta, OptionTypeBase} from "react-select";

import {useFeatureFlag} from "../../../../hooks/useFeatureFlag";
import {addressService, type AddressCategories} from "../address.service";

import {AddressSelectOption} from "./AddressSelectOption";

import type {
    ExtractedNewAddressEnriched,
    OriginalAddressEnriched,
    SuggestedAddress,
} from "./types";

type PropsAddressSelectProps = Partial<Omit<AsyncPaginatedSelectProps, "onChange">> & {
    displayTooltip?: boolean;
    categories: AddressCategories[];
    onChange: (address: OriginalAddress | undefined, action: ActionMeta<OptionTypeBase>) => void;
    ordering?: string;
    suggestedAddresses?: SuggestedAddress[];
    confirmationExtractedAddresses?: (OriginalAddress | ExtractedNewAddress)[];
    onCreateAddress?: (name: string) => void;
    onChangeWithExtractedNewAddress?: (address: ExtractedNewAddress) => void;
    /** Do not display the extracted information if an address is missing created_by
     *
     * This is useful because we don't yet have typing for the fed value of the select,
     * And we may wan't to provide only few address info without activating the extracted info
     */
    disableExtractedInfo?: boolean;
    ["data-testid"]?: string;
};

type AddressOption = (OriginalAddressEnriched | ExtractedNewAddressEnriched) & {
    __isNew__: boolean;
    label: string;
};

export const AddressSelect: FunctionComponent<PropsAddressSelectProps> = ({
    displayTooltip,
    categories,
    onChange,
    ordering = "",
    suggestedAddresses = [],
    confirmationExtractedAddresses = [],
    styles = {},
    onCreateAddress,
    onChangeWithExtractedNewAddress,
    disableExtractedInfo = false,
    ...props
}) => {
    const [isLoading, startLoading, stopLoading] = useToggle(false);

    const hasLogisticPointsHaveNoRoleEnabled = useFeatureFlag("logisticPointsHaveNoRole");

    const debouncedSearchAddresses = useMemo(
        () =>
            debounce(
                async (input, _, {page}) => {
                    startLoading();
                    try {
                        const response = await addressService.searchAddresses(
                            input,
                            categories,
                            ordering,
                            suggestedAddresses,
                            confirmationExtractedAddresses,
                            page,
                            hasLogisticPointsHaveNoRoleEnabled
                        );
                        return response;
                    } finally {
                        stopLoading();
                    }
                },
                1000,
                {
                    leading: true,
                }
            ),
        [
            categories,
            ordering,
            suggestedAddresses,
            confirmationExtractedAddresses,
            hasLogisticPointsHaveNoRoleEnabled,
        ]
    );

    const SelectComponent = onCreateAddress ? AsyncPaginatedCreatableSelect : AsyncPaginatedSelect;
    const creatableProps = onCreateAddress
        ? {
              formatCreateLabel: (value: string) => {
                  let label = t("transportsForm.addAddress", undefined, {capitalize: true});
                  if (categories.length === 1) {
                      if (categories[0] === "carrier") {
                          label = t("transportsForm.addCarrier", undefined, {capitalize: true});
                      } else if (categories[0] === "shipper") {
                          label = t("transportsForm.addShipper", undefined, {capitalize: true});
                      }
                  } else if (
                      categories.some(
                          (category) => category === "shipper" || category === "carrier"
                      )
                  ) {
                      label = t("transportsForm.addCompany", undefined, {capitalize: true});
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
              },
              onCreateOption: onCreateAddress,
              isValidNewOption: () => true,
          }
        : null;

    const selectRef = React.useRef(null);

    return (
        <SelectComponent
            isLoading={isLoading}
            className="select-big"
            placeholder={t("components.searchAnAddress")}
            loadOptions={debouncedSearchAddresses}
            defaultOptions={true}
            data-testid={props["data-testid"]}
            getOptionValue={(address) => ("created_by" in address ? address.pk : address.name)}
            getOptionLabel={({address}) => address}
            ref={selectRef}
            formatOptionLabel={(
                address: AddressOption,
                meta: FormatOptionLabelMeta<AddressOption, false>
            ) => {
                const {context} = meta;
                const isFocused =
                    displayTooltip &&
                    context === "menu" &&
                    "pk" in address &&
                    select2Service.isFocused(selectRef, address);

                return address.__isNew__ ? (
                    address.label
                ) : (
                    <AddressSelectOption
                        isFocused={isFocused}
                        address={address}
                        categories={categories}
                        suggestedAddresses={suggestedAddresses}
                        confirmationExtractedAddresses={confirmationExtractedAddresses}
                        isMenuContext={context === "menu"}
                        disableExtractedInfo={disableExtractedInfo}
                        css={css`
                            line-height: 20px;
                            padding: 5px 0px;
                        `}
                    />
                );
            }}
            styles={mergeSelectStyles(
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
            )}
            onChange={(
                richAddress: OriginalAddressEnriched | ExtractedNewAddressEnriched,
                action
            ) => {
                if (!richAddress) {
                    onChange(undefined, action);
                    return;
                }
                if ("created_by" in richAddress) {
                    const address = addressService.convertAddressToIOriginalAddress(richAddress);
                    onChange(address, action);
                } else {
                    const {isLastExtracted: _, ...address} =
                        richAddress as ExtractedNewAddressEnriched;
                    onChangeWithExtractedNewAddress?.(address);
                }
            }}
            {...creatableProps}
            {...props}
            blurInputOnSelect
        />
    );
};
