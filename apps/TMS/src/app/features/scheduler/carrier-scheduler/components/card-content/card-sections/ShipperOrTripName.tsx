import {NoWrap, Text} from "@dashdoc/web-ui";
import React from "react";

import {CardLineHeight} from "../cardLineHeights.constants";

export function ShipperOrTripName({name}: {name: string | undefined}) {
    return (
        <Text
            variant="caption"
            color="grey.ultradark"
            fontWeight="600"
            lineHeight="20px"
            height={`${CardLineHeight.shipper}px`}
            pr="20px"
        >
            <NoWrap>{name}</NoWrap>
        </Text>
    );
}
