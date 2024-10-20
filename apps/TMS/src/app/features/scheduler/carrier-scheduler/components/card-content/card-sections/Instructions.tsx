import {Text, Icon, NoWrap} from "@dashdoc/web-ui";
import React from "react";

import {CardLineHeight} from "../cardLineHeights.constants";
export function Instructions({instructions}: {instructions: string}) {
    return (
        <Text color="grey.dark" variant="subcaption" height={`${CardLineHeight.instructions}px`}>
            <NoWrap>
                <Icon name="info" mr={1} fontSize={0} />
                {instructions}
            </NoWrap>
        </Text>
    );
}
