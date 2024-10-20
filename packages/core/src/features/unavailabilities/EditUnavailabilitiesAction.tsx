import {t} from "@dashdoc/web-core";
import {Badge, Box, Button, ClickableFlex, Icon, TooltipWrapper} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import {UnavailabilitiesPanel} from "features/unavailabilities/modals/UnavailabilitiesPanel";
import {useSiteTimezone} from "hooks/useSiteTimezone";
import React from "react";
import {useSelector} from "redux/hooks";
import {RootState} from "redux/reducers";
import {selectBookingStatusByZoneId} from "redux/reducers/flow/bookingStatus.slice";
import {isUpdating} from "redux/reducers/flow/slot.slice";
import {metricsService} from "services/metrics.service";
import {Zone} from "types";

type Props = {
    zone: Zone;
};

export function EditUnavailabilitiesAction({zone}: Props) {
    const [show, setShow, setHide] = useToggle(false);
    const status = useSelector((state: RootState) => selectBookingStatusByZoneId(state, zone.id));
    const hasAvailability = status.availability_status.length > 0;
    const hasUnavailability = status.unavailabilities.length > 0;
    const disabled = useSelector(isUpdating) || !hasAvailability;
    const timezone = useSiteTimezone();
    const {unavailableSlots, overloadedSlots} = metricsService.getMetrics(zone, status, timezone);
    return (
        <Box position="absolute">
            <Box position="relative">
                <TooltipWrapper content={t("components.unavailabilities")}>
                    {unavailableSlots > 0 && (
                        <ClickableFlex
                            hoverStyle={{bg: "transparent"}}
                            position="absolute"
                            width="100%"
                            zIndex="level1"
                            top="-2px"
                            right="33px"
                            justifyContent="end"
                            data-testid="unavailabilities-decorator"
                        >
                            <Badge
                                onClick={disabled ? undefined : setShow}
                                variant={overloadedSlots ? "errorDark" : "blueDark"}
                                paddingX={unavailableSlots > 9 ? "2px" : "6px"}
                                paddingY={0}
                                fontWeight="bold"
                                data-testid={
                                    overloadedSlots
                                        ? "unavailabilities-decorator-with-overload"
                                        : "unavailabilities-decorator-without-overload"
                                }
                            >
                                {unavailableSlots}
                            </Badge>
                        </ClickableFlex>
                    )}
                    <Button
                        variant="plain"
                        onClick={setShow}
                        disabled={disabled}
                        width="fit-content"
                        data-testid="unavailabilities-button"
                    >
                        <Icon fontSize={4} name="calendarDisabled" />
                    </Button>
                </TooltipWrapper>
            </Box>
            {show && (
                <UnavailabilitiesPanel
                    title={
                        hasUnavailability
                            ? t("flow.unavailabilityDetails")
                            : t("flow.addUnavailability")
                    }
                    zone={zone}
                    status={status}
                    onClose={setHide}
                    data-testid="edit-unavailabilities-modal"
                />
            )}
        </Box>
    );
}
