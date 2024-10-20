import {t} from "@dashdoc/web-core";
import {Box, BoxProps, Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {Address, ExtractedNewAddress, OriginalAddress} from "dashdoc-utils";
import React from "react";

import {AddressLabel} from "../label/AddressLabel";
import {AddressNameLabel} from "../label/AddressNameLabel";
import {NewAddressBadge} from "../NewAddressBadge";

import {AddressTooltip} from "./AddressTooltip";

import type {
    ExtractedNewAddressEnriched,
    OriginalAddressEnriched,
    SuggestedAddress,
} from "./types";

export const AddressSelectOption = ({
    address,
    isMenuContext,
    categories,
    suggestedAddresses = [],
    confirmationExtractedAddresses = [],
    disableExtractedInfo = false,
    isFocused,
    ...props
}: BoxProps & {
    address: Address | ExtractedNewAddress | OriginalAddressEnriched | ExtractedNewAddressEnriched;
    isMenuContext: boolean;
    categories?: string[];
    suggestedAddresses?: SuggestedAddress[];
    confirmationExtractedAddresses?: (OriginalAddress | ExtractedNewAddress)[];
    disableExtractedInfo?: boolean;
    isFocused?: boolean;
}) => {
    const isExtracted =
        !("created_by" in address) ||
        confirmationExtractedAddresses
            .map((address) => ("created_by" in address ? address.pk : null))
            .includes(address.pk);

    const isSuggested =
        !isExtracted &&
        "pk" in address &&
        address.pk &&
        suggestedAddresses.map(({address}) => address.pk).includes(address.pk);

    const content = (
        <Box {...props} position="relative">
            <Flex alignItems={"center"} justifyContent={"space-between"}>
                <Flex
                    flexBasis={
                        "created_by" in address && "children" in address && address.children
                            ? "60%"
                            : "100%"
                    }
                >
                    <Box>
                        <Flex alignItems="center">
                            <Text
                                ellipsis={isMenuContext ? false : true}
                                fontWeight="bold"
                                color="inherit"
                            >
                                <AddressNameLabel address={address} />
                            </Text>
                            {(("has_flow_site" in address && address.has_flow_site) ||
                                ("flow_site" in address && address.flow_site?.slug)) && (
                                <TooltipWrapper
                                    content={
                                        <Text>
                                            {t("tmsIntegration.addressAssociatedWithAFlowSite")}
                                        </Text>
                                    }
                                >
                                    <Icon name="flow" ml={2} fontSize={4} />
                                </TooltipWrapper>
                            )}
                            {!isMenuContext && !disableExtractedInfo && isExtracted && (
                                <>
                                    {!("created_by" in address) && (
                                        <NewAddressBadge paddingY={0} ml={2} />
                                    )}
                                    <Icon
                                        name="robot"
                                        data-testid="address-robot-icon"
                                        ml={2}
                                        mr={2}
                                        mb={1}
                                    />
                                </>
                            )}
                        </Flex>
                        <AddressLabel address={address} />
                    </Box>
                </Flex>
                {"created_by" in address && "children" in address && address.children && (
                    <Flex flexBasis="35%">{address.children}</Flex>
                )}
                {isMenuContext &&
                    (isSuggested ? (
                        "tooltipContent" in address && address.tooltipContent ? (
                            <TooltipWrapper
                                boxProps={{
                                    display: "inline-block",
                                }}
                                content={
                                    <Text
                                        dangerouslySetInnerHTML={{
                                            // nosemgrep react-dangerouslysetinnerhtml
                                            __html: address.tooltipContent,
                                        }}
                                    ></Text>
                                }
                                placement="right"
                            >
                                <Icon name="magicWand" data-testid="address-magic-wand-icon" />
                            </TooltipWrapper>
                        ) : (
                            <Icon name="magicWand" data-testid="address-magic-wand-icon" />
                        )
                    ) : (
                        !disableExtractedInfo &&
                        isExtracted && (
                            <>
                                {!("created_by" in address) && (
                                    <NewAddressBadge paddingY={0} mr={2} />
                                )}
                                <Icon name="robot" data-testid="address-robot-icon" />
                            </>
                        )
                    ))}
            </Flex>
            <Box
                borderBottom={
                    isMenuContext &&
                    (("created_by" in address &&
                        "isLastSuggested" in address &&
                        address.isLastSuggested) ||
                        ("isLastExtracted" in address && address.isLastExtracted))
                        ? "0.5px solid"
                        : null
                }
                borderColor="blue.light"
                position="absolute"
                bottom="-7.5px"
                left="-12px"
                right="-12px"
            ></Box>
        </Box>
    );
    if ("company" in address && address.company) {
        const forceDisplay = isMenuContext && isFocused;
        return (
            <TooltipWrapper
                hidden={!forceDisplay}
                forceDisplay={forceDisplay}
                onlyOnDesktop
                content={<AddressTooltip address={address} />}
                placement="right"
                gap={10}
            >
                {content}
            </TooltipWrapper>
        );
    }
    return content;
};
