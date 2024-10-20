import {t} from "@dashdoc/web-core";
import {Flex, Icon, Link, OnDesktop, OnMobile, Text} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    isIrregular: boolean;
    onIrregular: () => void;
    onRegular: () => void;
};
export function RegularToIrregular({isIrregular, onIrregular, onRegular}: Props) {
    const linkContent = isIrregular ? (
        <Link fontSize={1} data-testid="flow-add-regular-slot-booking" onClick={onRegular}>
            {t("flow.selectPredefinedSlotBooking")}
        </Link>
    ) : (
        <Link fontSize={1} data-testid="flow-add-irregular-slot-booking" onClick={onIrregular}>
            {t("flow.addCustomSlotBooking")}
        </Link>
    );
    return (
        <>
            <OnDesktop>
                <Flex alignItems="center" px={5}>
                    <Flex>
                        <Icon name="clock" color="grey.dark" />
                        <Text ml={1} mr={2} variant="captionBold" color="grey.dark">
                            {isIrregular
                                ? t("flow.needAPredefinedSlot")
                                : t("flow.needACustomSlot")}
                        </Text>
                    </Flex>
                    {linkContent}
                </Flex>
            </OnDesktop>
            <OnMobile>
                <Flex alignItems="top" pb={4}>
                    <Flex alignSelf="start">
                        <Icon name="clock" color="grey.dark" />
                    </Flex>
                    <Text
                        ml={2}
                        mr={2}
                        variant="captionBold"
                        color="grey.dark"
                        flexBasis="fit-content"
                    >
                        {isIrregular ? t("flow.needAPredefinedSlot") : t("flow.needACustomSlot")}
                        <Text as="span" ml={1} lineHeight={0}>
                            {linkContent}
                        </Text>
                    </Text>
                </Flex>
            </OnMobile>
        </>
    );
}
