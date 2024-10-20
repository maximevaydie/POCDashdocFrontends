import {t} from "@dashdoc/web-core";
import {Box, Callout, Flex, Icon, Link, Text} from "@dashdoc/web-ui";
import React from "react";

type SubcontractedTransportInfoBannerProps = {
    transportNumber: number | string;
    transportUid: string;
};

export function SubcontractedTransportInfoBanner({
    transportNumber,
    transportUid,
}: SubcontractedTransportInfoBannerProps) {
    return (
        <Callout variant="warning" iconDisabled my={3}>
            <Icon
                name="charter"
                color="yellow.dark"
                scale={1.2}
                width={19}
                height={19}
                textAlign="center"
            />
            <Text display="inline" fontWeight="bold" marginX={2}>
                {t("chartering.subcontractedTransportBanner", {number: transportNumber})}
            </Text>
            <Link
                color="black.default"
                href={`/app/transports/${transportUid}/`}
                target="_blank"
                rel="noreferrer noopener"
            >
                {t("common.getBackToTransportNumber", {number: transportNumber})}
            </Link>
        </Callout>
    );
}
type SubcontractedTripInfoBannerProps = {
    tripName: string;
    tripUid: string;
};

export function SubcontractedTripInfoBanner({
    tripName,
    tripUid,
}: SubcontractedTripInfoBannerProps) {
    return (
        <Callout
            variant="neutral"
            iconDisabled
            my={3}
            backgroundColor={"white"}
            border="1px solid"
            borderColor="grey.light"
            borderRadius="4px"
            data-testid="subcontracted-trip-info-banner"
        >
            <Flex flexDirection={"row"}>
                <Box pr={2} display="flex" alignItems="center" justifyContent="center">
                    <Icon
                        name="charter"
                        color={"blue.default"}
                        scale={1.4}
                        width={28}
                        height={28}
                        textAlign="center"
                    />
                </Box>
                <Flex flexDirection="row" alignItems="center">
                    <Text marginX={2}>
                        {tripName
                            ? t("subcontracting.subcontractedTripBannerWithName", {name: tripName})
                            : t("subcontracting.subcontractedTripBanner")}
                        <Link
                            color="black.default"
                            href={`/app/trips/${tripUid}/`}
                            target="_blank"
                            rel="noreferrer noopener"
                            ml={1}
                            css={{textDecoration: "none"}}
                        >
                            {t("common.seeTrip")}
                            <Icon
                                name="openInNewTab"
                                ml={1}
                                scale={0.8}
                                verticalAlign="middle"
                                mt={-1}
                            />
                        </Link>
                    </Text>
                </Flex>
            </Flex>
        </Callout>
    );
}
