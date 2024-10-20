import {t} from "@dashdoc/web-core";
import {Box, Icon, theme} from "@dashdoc/web-ui";
import {ThemeProvider} from "@emotion/react";
import {TransportAddress, formatDate} from "dashdoc-utils";
import React from "react";

import {ActivityMarker} from "app/features/maps/marker/activity-marker";

import {AddressWithBadCoordinates} from "./AddressWithBadCoordinates";
import {LegendLine} from "./LegendLine";
import {LegendTitle} from "./LegendTitle";

import type {Activity} from "app/types/transport";

type Props = {
    activities: Activity[];
};

export function MapLegend(props: Props) {
    const addressWithInvalidCoords: TransportAddress[] = props.activities
        .map((activity) => activity.site.address)
        .filter((address) => address !== null && address !== undefined)
        .filter((address) => address.coords_validated === false);
    const activityWithEta = props.activities.find(
        (activity) =>
            activity.site.eta_tracking &&
            !["late", "on_time"].includes(activity.site.punctuality_status) &&
            activity.site.eta
    );

    const displayInformations = addressWithInvalidCoords.length > 0 || activityWithEta;

    return (
        <Box>
            <LegendTitle text={t("common.legend")} />
            <LegendLine
                icon={<ActivityMarker activityStatus="not_started" m={1} />}
                text={t("legend.activityNotStarted")}
            />
            <LegendLine
                icon={<ActivityMarker activityStatus="on_site" m={1} />}
                text={t("legend.activityOnSite")}
            />
            <LegendLine
                icon={<ActivityMarker activityStatus="done" m={1} />}
                text={t("legend.activityDone")}
            />
            <LegendLine icon={<ActivityMarker m={1} />} text={t("legend.plannedSite")} />
            {props.activities[props.activities.length - 1].status !== "done" && (
                <LegendLine
                    icon={
                        <ThemeProvider theme={theme}>
                            <Icon
                                name="truck"
                                color="blue.default"
                                backgroundColor="grey.white"
                                border="1px solid"
                                borderColor="grey.light"
                                round
                                m={1}
                            />
                        </ThemeProvider>
                    }
                    text={t("legend.lastKnownTruckPosition")}
                />
            )}
            <LegendLine
                icon={
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <g color={theme.colors.blue.default}>
                            <circle
                                cx="50"
                                cy="50"
                                r="8"
                                stroke="currentColor"
                                fill="none"
                                strokeWidth="8"
                            />
                        </g>
                    </svg>
                }
                text={t("legend.telematicTraces")}
            />

            {displayInformations && (
                <>
                    <LegendTitle text={t("common.informations")} />
                    {activityWithEta && (
                        <LegendLine
                            icon={<Icon name="clock" fontSize="large" m={1} ml={3} />}
                            text={t("legend.nextSiteEta", {
                                hour: formatDate(activityWithEta.site.eta, "p"),
                            })}
                        />
                    )}
                    {addressWithInvalidCoords.length > 0 && (
                        <LegendLine
                            icon={<Icon name="warning" fontSize="large" m={1} ml={3} />}
                            text={
                                <>
                                    {t("legend.addressWithBadCoordinates")}
                                    <br />

                                    {addressWithInvalidCoords.map((address) => (
                                        <React.Fragment key={address.pk}>
                                            - <AddressWithBadCoordinates address={address} />
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </>
                            }
                        />
                    )}
                </>
            )}
        </Box>
    );
}
