import {Box, BoxProps, Flex, Text, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

import {AddressLabel} from "../../address/label/AddressLabel";
import {CompanyName} from "../../company/CompanyName";
import {PartnerTooltip} from "../PartnerTooltip";

import type {UpdatablePartner} from "../../types";

export function PartnerSelectOption({
    partner,
    isMenuContext,
    isFocused,
    ...props
}: BoxProps & {
    partner: UpdatablePartner;
    isMenuContext: boolean;
    isFocused?: boolean;
}) {
    const content = (
        <Box {...props} position="relative">
            <Flex alignItems={"center"} justifyContent={"space-between"}>
                <Flex flexBasis="100%">
                    <Box>
                        <Flex alignItems="center">
                            <Text
                                ellipsis={isMenuContext ? false : true}
                                fontWeight="bold"
                                color="inherit"
                            >
                                <CompanyName company={partner} withoutContainer={true} />
                            </Text>
                        </Flex>
                        <AddressLabel address={partner.administrative_address} />
                    </Box>
                </Flex>
            </Flex>
        </Box>
    );
    const forceDisplay = isMenuContext && isFocused;
    return (
        <TooltipWrapper
            hidden={!forceDisplay}
            forceDisplay={forceDisplay}
            onlyOnDesktop
            content={
                <PartnerTooltip
                    name={partner.name}
                    notes={partner.notes ?? ""}
                    vat_number={partner.vat_number}
                    invoicing_remote_id={partner.invoicing_remote_id}
                />
            }
            placement="right"
            gap={10}
        >
            {content}
        </TooltipWrapper>
    );
}
