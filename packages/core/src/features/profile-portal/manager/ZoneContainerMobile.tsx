import {t} from "@dashdoc/web-core";
import {Box, Flex, LoadingWheel, Select, SelectOption, Text} from "@dashdoc/web-ui";
import {SiteDate} from "features/site-date/SiteDate";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React, {useState} from "react";
import {useSelector} from "redux/hooks";
import {loadingFlow} from "redux/reducers/flow";
import {selectBookingStatus} from "redux/reducers/flow/bookingStatus.slice";
import {selectZones} from "redux/reducers/flow/zone.slice";
import {Zone} from "types";

import {EmptyZones} from "./zone/empty-zone/EmptyZones";
import {ZoneColumn} from "./zone/zone-column/ZoneColumn";
import {zoneService} from "./zone/zone-column/zone.service";

export function ZoneContainerMobile() {
    const loading = useSelector(loadingFlow);
    const zones = useSelector(selectZones);
    const bookingStatus = useSelector(selectBookingStatus);
    const timezone = useSiteTimezone();
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    let value: Zone | null = null;
    if (selectedZone !== null) {
        value = selectedZone;
    } else if (zones.length > 0) {
        value = zones[0];
    }

    if (loading === "idle") {
        return null;
    } else if (loading === "pending") {
        return <LoadingWheel />;
    } else if (loading === "failed") {
        return <Text>{t("common.error")}</Text>;
    } else if (zones.length === 0) {
        return <EmptyZones />;
    } else {
        const {startDate, endDate} = zoneService.getDayDensityTimeRange(bookingStatus, timezone);
        return (
            <Flex px={4} pb={2} flexDirection="column" flexGrow={1} width="100vw" height="100%">
                <Box style={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>
                    <SiteDate />
                    {zones.length > 0 ? (
                        <Select
                            isSearchable={false}
                            isClearable={false}
                            options={getZoneOptions(zones)}
                            data-testid="select-jobs"
                            value={
                                value
                                    ? {
                                          value: value.id,
                                          label: value.name,
                                      }
                                    : null
                            }
                            styles={{
                                valueContainer: (provided) => ({
                                    ...provided,
                                    height: "40px",
                                }),
                            }}
                            onChange={(newValue: SelectOption) => {
                                if (newValue?.value) {
                                    const zone = zones.find((zone) => zone.id === newValue.value);
                                    if (zone) {
                                        setSelectedZone(zone);
                                    }
                                }
                            }}
                        />
                    ) : (
                        <Box />
                    )}
                </Box>
                {value && <ZoneColumn zone={value} startDate={startDate} endDate={endDate} />}
            </Flex>
        );
    }
}

function getZoneOptions(zones: Zone[]): SelectOption[] {
    return zones.map((zone) => ({
        value: zone.id,
        label: zone.name,
    }));
}
