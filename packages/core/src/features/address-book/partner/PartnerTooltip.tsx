import {getReadableAddress, t} from "@dashdoc/web-core";
import {Box, CompanyAvatar, Flex, HorizontalLine, Text} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    name: string;
    notes: string;
    address?: {
        address: string;
        postcode: string;
        city: string;
        country: string;
    };
    vat_number?: string;
    invoicing_remote_id?: string;
};
export function PartnerTooltip({name, notes, address, vat_number, invoicing_remote_id}: Props) {
    return (
        <Box width="310px">
            <Flex alignItems="center" style={{gap: "8px"}}>
                <Box width="40px" height="40px" minWidth="auto" flexShrink={2}>
                    <CompanyAvatar name={name} />
                </Box>
                <Box ml={2}>
                    <Text variant="h2" color="grey.ultradark">
                        {name}
                    </Text>
                    {address && <Text>{getReadableAddress(address)}</Text>}
                </Box>
            </Flex>
            <HorizontalLine my={4} />
            {notes ? (
                <Text variant="caption">{notes}</Text>
            ) : (
                <Text variant="caption" color="grey.dark">
                    {t("partner.noNotesEntered")}
                </Text>
            )}
            {(vat_number || invoicing_remote_id) && (
                <>
                    <HorizontalLine my={4} />
                    <Box style={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>
                        {vat_number && (
                            <>
                                <Text variant="caption" color="grey.dark">
                                    {t("common.VAT")}
                                </Text>
                                <Text variant="caption">{vat_number}</Text>
                            </>
                        )}
                        {invoicing_remote_id && (
                            <>
                                <Text variant="caption" color="grey.dark">
                                    {t("components.invoicingRemoteId")}
                                </Text>
                                <Text variant="caption">{invoicing_remote_id}</Text>
                            </>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
}
