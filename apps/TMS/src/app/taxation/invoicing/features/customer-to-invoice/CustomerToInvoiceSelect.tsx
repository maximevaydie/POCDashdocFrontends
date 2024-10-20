import {PartnerTooltip} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    AsyncPaginatedSelect,
    Box,
    Flex,
    Icon,
    AsyncSelectProps,
    FiltersSelectAsyncPaginatedProps,
    SelectOption,
    TooltipWrapper,
    select2Service,
    theme,
    themeAwareCss,
} from "@dashdoc/web-ui";
import {InvoiceableCompany, InvoicingAddress} from "dashdoc-utils";
import React, {FunctionComponent, useCallback} from "react";
import {FormatOptionLabelMeta} from "react-select";

import {searchInvoiceableCustomers} from "app/taxation/invoicing/services/customerToInvoice";

// Although we should receive InvoiceableCompany, the invoicing_address is not always present
// because the company could have been made non-invoiceable after the customer to invoice was selected.
type MaybeInvoiceableCompany = Omit<InvoiceableCompany, "invoicing_address"> & {
    invoicing_address?: InvoicingAddress;
};

export const CustomerToInvoiceSelect: FunctionComponent<
    AsyncSelectProps<SelectOption<MaybeInvoiceableCompany>> & {
        isShipper?: boolean;
        displayTooltip?: boolean;
    }
> = ({
    label,
    value,
    onChange,
    required,
    error,
    isMulti,
    isClearable = true,
    isShipper,
    displayTooltip = false,
}) => {
    const loadOptions: FiltersSelectAsyncPaginatedProps["loadOptions"] = useCallback(
        async (search: string, _: any, {page}: {page: number}) => {
            try {
                const {results, next} = await searchInvoiceableCustomers({
                    search,
                    page,
                    is_shipper: isShipper,
                });

                return {
                    options: results,
                    hasMore: !!next,
                    additional: {
                        page: page + 1,
                    },
                };
            } catch (error) {
                Logger.error(error);
                return {
                    options: [],
                    hasMore: undefined,
                };
            }
        },
        []
    );
    const selectRef = React.useRef(null);

    return (
        <AsyncPaginatedSelect
            className={`select-big`}
            placeholder={t("component.searchCustomerToInvoice")}
            loadOptions={loadOptions}
            defaultOptions={true}
            data-testid="update-customer-to-invoice-select"
            getOptionValue={({pk}) => pk}
            getOptionLabel={({name}) => name}
            ref={selectRef}
            formatOptionLabel={(
                company: MaybeInvoiceableCompany,
                meta: FormatOptionLabelMeta<MaybeInvoiceableCompany, any>
            ) => {
                const {context} = meta;
                const isFocused =
                    displayTooltip &&
                    context === "menu" &&
                    select2Service.isFocused(selectRef, company);
                return (
                    <CustomerToInvoiceSelectOption
                        company={company}
                        isFocused={isFocused}
                        isMulti={isMulti}
                    />
                );
            }}
            styles={
                isMulti
                    ? undefined
                    : {
                          valueContainer: (provided, {selectProps: {label}}) => ({
                              ...provided,
                              height: label ? "5em" : "4em",
                          }),
                          singleValue: (provided, {selectProps: {label}}) => ({
                              ...provided,
                              ...(label && {top: "30%"}),
                              "& i": themeAwareCss({color: "yellow.default"})(theme),
                          }),
                          menu: (provided) => ({
                              ...provided,
                              maxHeight: "400px",
                          }),
                      }
            }
            value={value}
            onChange={onChange}
            label={label}
            required={required}
            error={error}
            isClearable={isClearable}
            isMulti={isMulti}
            closeMenuOnSelect={!isMulti}
        />
    );
};

const formatAddress = (address: InvoicingAddress) => (
    <>
        {address.address && <>{address.address + ", "}</>}
        {address.postcode + " " + address.city + ", " + address.country}
    </>
);
function CustomerToInvoiceSelectOption({
    company,
    isFocused,
    isMulti,
}: {
    company: MaybeInvoiceableCompany;
    isFocused: boolean;
    isMulti?: boolean;
}) {
    return (
        <TooltipWrapper
            hidden={!isFocused}
            forceDisplay={isFocused}
            onlyOnDesktop
            content={
                <PartnerTooltip
                    name={company.name}
                    notes={company.notes}
                    // TODO: Add following props in TMaybeInvoiceableCompany type & related endpoint
                    // vat_number={...}
                    // invoicing_remote_id={...}
                />
            }
            placement="right"
            gap={10}
        >
            {isMulti ? (
                <>{company.name}</>
            ) : (
                <Box>
                    <b>{company.name}</b>
                    <br />
                    {company.invoicing_address ? (
                        formatAddress(company.invoicing_address)
                    ) : (
                        <Flex data-testid="customer-to-invoice-select-selected-customer-not-invoiceable-warning">
                            <Icon name="warning" mr={2} />
                            {t("customerToInvoice.notInvoiceable")}
                        </Flex>
                    )}
                </Box>
            )}
        </TooltipWrapper>
    );
}
