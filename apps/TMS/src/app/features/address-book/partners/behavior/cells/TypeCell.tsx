import {PartnerInListOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge, Box, NoWrap} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    partner: PartnerInListOutput;
};

export function TypeCell({partner}: Props) {
    return (
        <NoWrap>
            <Box data-testid="address-type-cell">
                {partner.is_carrier && (
                    <Badge variant="blue" display="inline-block" shape="squared" mr={1} mb={1}>
                        {t("common.carrier")}
                    </Badge>
                )}
                {partner.is_shipper && (
                    <Badge variant="purple" display="inline-block" shape="squared" mr={1} mb={1}>
                        {t("common.shipper")}
                    </Badge>
                )}
                {!partner.is_shipper && !partner.is_carrier && (
                    <Badge variant="pink" display="inline-block" shape="squared" mr={1} mb={1}>
                        {t("common.other")}
                    </Badge>
                )}
            </Box>
        </NoWrap>
    );
}
