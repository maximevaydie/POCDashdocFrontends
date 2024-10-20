import {t} from "@dashdoc/web-core";
import {Flex, Text} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {useSiteDate} from "hooks/useSiteDate";
import {useSiteTime} from "hooks/useSiteTime";
import React from "react";
import {getHours, isSameDay} from "services/date";

type Props = {hour: number; opening: boolean; closing: boolean};

export function HourLine({hour, opening, closing}: Props) {
    const siteTime = useSiteTime();
    const siteDate = useSiteDate();
    let highlight = false;
    if (!closing && siteDate !== null && isSameDay(siteDate, siteTime)) {
        const currentHour = getHours(siteTime);
        highlight = currentHour === hour;
    }

    return (
        <Flex justifyContent="center" alignItems="center" marginX={3}>
            <HorizontalLine
                width={4}
                size={2}
                borderColor={highlight ? "turquoise.default" : "grey.light"}
            />
            {highlight ? (
                <Text
                    variant="captionBold"
                    textAlign="center"
                    fontWeight={600}
                    px={1}
                    py={1}
                    color="grey.white"
                    backgroundColor="turquoise.default"
                    borderRadius={1}
                >
                    {hour}:00 {opening && t("common.opening")}
                    {closing && t("common.closing")}
                </Text>
            ) : (
                <Text
                    variant="captionBold"
                    textAlign="center"
                    fontWeight={600}
                    px={1}
                    color="blue.dark"
                >
                    {hour}:00 {opening && t("common.opening")}
                    {closing && t("common.closing")}
                </Text>
            )}
            <HorizontalLine
                flexGrow={1}
                width={4}
                size={2}
                borderColor={highlight ? "turquoise.default" : "grey.light"}
            />
        </Flex>
    );
}
