import {t} from "@dashdoc/web-core";
import {Flex, Icon, IconNames, Text} from "@dashdoc/web-ui";
import React from "react";

type TripValidationDetailsProps = {
    type: "valid" | "invalid";
    tripCount: number;
    activityCount?: number;
};
export function TripValidationDetails({
    type,
    tripCount,
    activityCount,
}: TripValidationDetailsProps) {
    const labels =
        type === "valid"
            ? {
                  icon: "checkCircle",
                  iconColor: "green.default",
                  main: t("trip.invalidMerge.validTrips"),
                  explanation: t("trip.invalidMerge.validTrips.explanation", {
                      smart_count: tripCount,
                      activity_count: activityCount,
                  }),
              }
            : {
                  icon: "removeCircle",
                  iconColor: "red.default",
                  main: t("trip.invalidMerge.invalidTrips"),
                  explanation: t("trip.invalidMerge.invalidTrips.explanation", {
                      smart_count: tripCount,
                  }),
              };
    return (
        <>
            <Flex mt={3}>
                <Icon
                    mr={2}
                    name={labels.icon as IconNames}
                    color={labels.iconColor}
                    alignSelf="center"
                />
                <Text variant="h2">{labels.main}</Text>
            </Flex>
            <Text color="grey.dark">{labels.explanation}</Text>
        </>
    );
}
