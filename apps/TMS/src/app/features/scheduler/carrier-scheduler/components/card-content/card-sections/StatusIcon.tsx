import {Flex, Icon} from "@dashdoc/web-ui";
import React from "react";

import {Decoration} from "app/features/scheduler/carrier-scheduler/carrierScheduler.types";

export function StatusIcon({decoration}: {decoration: Decoration}) {
    return (
        <Flex
            width="20px"
            height="20px"
            borderRadius="50%"
            alignItems="center"
            justifyContent="center"
            backgroundColor={decoration.color}
            lineHeight="0.9em"
            fontSize="0.9em"
        >
            {decoration.statusIcon && (
                <Icon
                    name={decoration.statusIcon}
                    color="grey.white"
                    strokeWidth={decoration.statusIconStrokeWidth ?? 2}
                />
            )}
        </Flex>
    );
}
