import {t} from "@dashdoc/web-core";
import {
    AsyncPaginatedSelectProps,
    Box,
    Coordinates,
    Flex,
    Icon,
    Link,
    Text,
} from "@dashdoc/web-ui";
import {Address, Company, ExtractedNewAddress, OriginalAddress, useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";
import {ActionMeta, OptionTypeBase} from "react-select";

import {useDispatch} from "../../../../hooks/useDispatch";
import {fetchUpdateAddress} from "../../../../redux/actions/fetchUpdateAddress";
import {HasFeatureFlag, HasNotFeatureFlag} from "../../../misc/FeatureFlag";
import {CompanyModal} from "../../company/CompanyModal";
import {PartnerModal} from "../../partner/PartnerModal";
import {addressService, type AddressCategories} from "../address.service";
import {AddressModal} from "../modal/AddressModal";
import {ValidateCoordinatesModal} from "../modal/validate-coordinates-modal";

import {AddressSelect} from "./AddressSelect";

import type {SuggestedAddress} from "./types";
import type {DefaultPartnerValue, PartnerDetailOutput} from "../../../../types/partnerTypes";
import type {AddressType} from "../types";

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

export const AddressCreatableSelect: FunctionComponent<
    Omit<PropsAddressSelectProps, "onCreateAddress">
> = (selectProps) => {
    const [addCompanyModalParam, setAddCompanyModalParam] = useState<{name: string}>();
    const [addAddressModalParam, setAddAddressModalParam] = useState<{name: string}>();
    const [
        isValidateCoordinatesModalOpen,
        openValidateCoordinatesModal,
        closeValidateCoordinatesModal,
    ] = useToggle(false);
    const dispatch = useDispatch();

    // If there is only addresses in the select, we open the address modal, otherwise we open the company modal
    const isAddressFieldType = selectProps.categories.every((category) =>
        ["origin", "destination"].includes(category)
    );

    const preSelectedCategory = (
        selectProps.categories.length === 1 ? "is_" + selectProps.categories : undefined
    ) as AddressType;

    const defaultPartnerValue: DefaultPartnerValue = {};
    if (addCompanyModalParam?.name) {
        defaultPartnerValue.name = addCompanyModalParam.name;
    }
    if (selectProps.categories.includes("carrier")) {
        defaultPartnerValue.is_carrier = true;
    }
    if (selectProps.categories.includes("shipper")) {
        defaultPartnerValue.is_shipper = true;
    }

    return (
        <>
            <AddressSelect
                {...selectProps}
                onCreateAddress={(newAddressName) =>
                    isAddressFieldType
                        ? setAddAddressModalParam({name: newAddressName})
                        : setAddCompanyModalParam({name: newAddressName})
                }
            />
            {isAddressFieldType && (selectProps.value as Address)?.coords_validated === false && (
                <Flex mt={2} borderRadius="4px" p={3} backgroundColor="yellow.ultralight">
                    <Icon mr={2} name="warning" color="yellow.dark" />
                    <Box>
                        <Text mb={1} variant="caption">
                            {t("components.warningCoordinatesNotValidated")}
                        </Text>
                        <Link fontSize={1} onClick={openValidateCoordinatesModal}>
                            {t("components.addOrUpdateGPSCoordinates")}
                        </Link>
                    </Box>
                </Flex>
            )}
            {!!addCompanyModalParam && (
                <>
                    <HasFeatureFlag flagName="betterCompanyRoles">
                        <PartnerModal
                            partner={defaultPartnerValue}
                            onClose={() => setAddCompanyModalParam(undefined)}
                            onSaved={handleNewPartner}
                        />
                    </HasFeatureFlag>
                    <HasNotFeatureFlag flagName="betterCompanyRoles">
                        <CompanyModal
                            categories={selectProps.categories}
                            company={addCompanyModalParam}
                            onClose={() => setAddCompanyModalParam(undefined)}
                            onSave={handleNewCompany}
                        />
                    </HasNotFeatureFlag>
                </>
            )}
            {addAddressModalParam && (
                <AddressModal
                    address={addAddressModalParam}
                    addressCategory={preSelectedCategory}
                    onClose={() => setAddAddressModalParam(undefined)}
                    onSave={handleNewAddress}
                />
            )}
            {isValidateCoordinatesModalOpen && (
                <ValidateCoordinatesModal
                    address={selectProps.value as Address}
                    saveWithGPS={handleUpdateGPSCoordinates}
                    saveWithoutGPS={closeValidateCoordinatesModal}
                    onClose={closeValidateCoordinatesModal}
                />
            )}
        </>
    );

    function handleNewPartner(partner: PartnerDetailOutput) {
        // we should always have addresses, the 'if' is here to please TS while avoiding a '@ts-ignore'
        if (partner.logistic_points && partner.logistic_points.length > 0) {
            // TODO: we should have a better way to handle this
            selectProps.onChange(partner.logistic_points[0] as any as OriginalAddress, {
                action: "create-option",
            });
            setAddCompanyModalParam(undefined);
        }
    }

    function handleNewCompany(company: Company) {
        // we should always have addresses, the 'if' is here to please TS while avoiding a '@ts-ignore'
        if (company.addresses) {
            // TODO: clean this by fixing the BaseAddress type
            selectProps.onChange(company.addresses[0] as any as OriginalAddress, {
                action: "create-option",
            });
            setAddCompanyModalParam(undefined);
        }
    }
    function handleNewAddress(address: Address) {
        selectProps.onChange(addressService.convertAddressToIOriginalAddress(address), {
            action: "create-option",
        });
        setAddAddressModalParam(undefined);
    }

    function handleUpdateGPSCoordinates(coordinates: Coordinates & {radius: number}) {
        closeValidateCoordinatesModal();
        dispatch(
            fetchUpdateAddress((selectProps.value as Address)?.pk, {
                ...(selectProps.value as Address),
                coords_validated: true,
                ...coordinates,
            })
        );
        selectProps.onChange(
            selectProps.value
                ? addressService.convertAddressToIOriginalAddress({
                      ...selectProps.value,
                      coords_validated: true,
                  } as Address)
                : undefined,
            {
                action: "select-option",
                // @ts-ignore
                option: null,
            }
        );
    }
};
