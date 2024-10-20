import {addressDisplayService, PartnerInListOutput} from "@dashdoc/web-common";
import {Box} from "@dashdoc/web-ui";
import React from "react";
import Highlighter from "react-highlight-words";

import {PartnersScreenQuery} from "app/features/address-book/partners/types";

type Props = {
    partner: PartnerInListOutput;
    currentQuery: PartnersScreenQuery;
};

export function AdministrativeAddressCell({partner, currentQuery}: Props) {
    const searchedTexts: string[] = currentQuery.text ?? [];
    return (
        <Box style={{whiteSpace: "pre-line"}}>
            <Highlighter
                autoEscape={true}
                searchWords={searchedTexts}
                textToHighlight={addressDisplayService.getActivityAddressLabel(
                    partner.administrative_address,
                    true
                )}
            />
        </Box>
    );
}
