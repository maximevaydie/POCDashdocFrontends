import {CompanyName} from "@dashdoc/web-common";
import {Box, BoxProps} from "@dashdoc/web-ui";
import React from "react";
import {Company} from "types";

type Props = BoxProps & {company: Partial<Company>};

export function CompanyWithAddressSelectOption({company, ...props}: Props) {
    return (
        <Box {...props}>
            <b>
                <CompanyName company={company} />
            </b>
        </Box>
    );
}
