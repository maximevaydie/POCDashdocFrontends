import {useTimezone} from "@dashdoc/web-common";
import {Flex, Text} from "@dashdoc/web-ui";
import {Rest} from "dashdoc-utils";
import React from "react";

import {getRestTimeText} from "../rental.service";

import {DurationBlock} from "./DurationBlock";
import {RentalAmendDeleteRestButton} from "./RentalAmendDeleteRestButton";
import {AmendRentalRest} from "./RentalAmendRestButtons";

export const RestLine = ({
    rest,
    canAmend,
    deliveryUid,
    transportUid,
}: {
    rest: Rest;
    canAmend: boolean;
    deliveryUid: string;
    transportUid: string;
}) => {
    const timezone = useTimezone();
    if (!rest.start || !rest.end) {
        return null;
    }
    const restText = getRestTimeText(rest, timezone);
    return (
        <Flex
            key={rest.uid}
            bg="grey.ultralight"
            py={2}
            mb={1}
            borderRadius={1}
            alignItems="center"
            data-testid={"rest-line"}
        >
            <Text pl={3} flex={1}>
                {restText}
            </Text>
            <DurationBlock
                small
                duration={-parseFloat(rest.duration_hours)}
                data-testid="rest-hours"
            />
            <Flex mr={1} width="62px">
                {canAmend && (
                    <>
                        <AmendRentalRest
                            rest={rest}
                            deliveryUid={deliveryUid}
                            transportUid={transportUid}
                        />
                        <RentalAmendDeleteRestButton
                            restUid={rest.uid}
                            deliveryUid={deliveryUid}
                            transportUid={transportUid}
                        />
                    </>
                )}
            </Flex>
        </Flex>
    );
};
